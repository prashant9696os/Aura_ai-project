
import json
import uuid
import re
import logging

from io import BytesIO
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

import numpy as np
from pypdf import PdfReader
from docx import Document as DocxDocument

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.config import STORAGE_DIR


logger = logging.getLogger(__name__)


class RAGService:

    def __init__(self):
        self.documents_file = STORAGE_DIR / "documents.json"
        self.chunks_file = STORAGE_DIR / "chunks.json"

        self.documents: List[Dict[str, Any]] = []
        self.chunks: List[Dict[str, Any]] = []

        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.tfidf_matrix = None

        self._load_data()

    # --------------------------------------------------
    # LOAD EXISTING DATA
    # --------------------------------------------------

    def _load_data(self):

        if self.documents_file.exists():
            try:
                with open(self.documents_file, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
            except Exception:
                logger.exception("Failed to load documents.json")
                self.documents = []

        if self.chunks_file.exists():
            try:
                with open(self.chunks_file, "r", encoding="utf-8") as f:
                    self.chunks = json.load(f)
            except Exception:
                logger.exception("Failed to load chunks.json")
                self.chunks = []

        if not self.documents:
            self._seed_default_documents()

        elif not self.chunks:
            logger.warning("Chunks missing. Rebuilding from stored documents.")

            self.chunks = []

            for doc in self.documents:
                raw_text = doc.get("raw_text", "")

                if raw_text:
                    self.chunks.extend(
                        self._chunk_text(
                            raw_text,
                            doc["id"],
                            doc["name"]
                        )
                    )

            self._save_data()
            self._rebuild_index()

        else:
            self._rebuild_index()

    # --------------------------------------------------
    # SAVE DATA
    # --------------------------------------------------

    def _save_data(self):

        STORAGE_DIR.mkdir(parents=True, exist_ok=True)

        with open(self.documents_file, "w", encoding="utf-8") as f:
            json.dump(self.documents, f, indent=2, ensure_ascii=False)

        with open(self.chunks_file, "w", encoding="utf-8") as f:
            json.dump(self.chunks, f, indent=2, ensure_ascii=False)

    # --------------------------------------------------
    # DEFAULT DOCUMENTS
    # --------------------------------------------------

    def _seed_default_documents(self):

        default_docs = [
            {
                "id": "doc-1",
                "name": "Enterprise_Architecture_Overview.pdf",
                "size": "2.4 MB",
                "type": "pdf",
                "tokens": 18450,
                "chunks": 36,
                "uploadedAt": "2026-10-12T14:30:00Z",
                "status": "indexed",
                "summary": "Cloud-native microservices architecture, Kubernetes ingress policies, and zero-trust identity verification.",
                "raw_text": (
                    "AURA Enterprise Architecture Overview.\n"
                    "Architecture: Distributed microservices running on Kubernetes EKS with Istio service mesh.\n"
                    "Vector Store: Distributed HNSW index with SQ8 scalar quantization. Nodes maintain sub-50ms p99 retrieval latency.\n"
                    "Security: Zero-trust network access (ZTNA), mTLS between pods, AES-256 at rest, SOC2 Type II compliance.\n"
                    "Ingress: Envoy proxy with rate limiting, JWT token validation, and geographic edge caching."
                )
            },
            {
                "id": "doc-2",
                "name": "Q3_Customer_Support_SLA_Guidelines.docx",
                "size": "1.1 MB",
                "type": "docx",
                "tokens": 8320,
                "chunks": 17,
                "uploadedAt": "2026-10-11T09:15:00Z",
                "status": "indexed",
                "summary": "Response time tiers: Tier 1 (15m), Tier 2 (1h), escalation protocols and refund threshold matrices.",
                "raw_text": (
                    "Customer Support SLA Guidelines Q3.\n"
                    "Tier 1 (P1 Critical): Max response time 15 minutes. High severity outages, vector database timeout spikes, auth outages.\n"
                    "Tier 2 (P2 High): Max response time 60 minutes. Degradation in inference throughput, webhook delays.\n"
                    "Tier 3 (P3 Standard): Max response time 4 hours. General billing inquiries, SAML SSO setup, configuration questions.\n"
                    "Escalation: Automated escalation triggers if ticket remains unassigned for 10 minutes."
                )
            },
            {
                "id": "doc-3",
                "name": "LLM_FineTuning_Security_Checklist.json",
                "size": "420 KB",
                "type": "json",
                "tokens": 4120,
                "chunks": 8,
                "uploadedAt": "2026-10-10T18:40:00Z",
                "status": "indexed",
                "summary": "Data anonymization pipelines, differential privacy parameters, and automated PII scrubbing protocols.",
                "raw_text": (
                    "LLM Fine-Tuning & Model Safety Security Checklist.\n"
                    "1. PII Scrubbing: Strip SSN, credit cards, emails, IP addresses using Microsoft Presidio regex engine.\n"
                    "2. Differential Privacy: Epsilon budget <= 2.5 with Gaussian noise injection during LoRA weight updates.\n"
                    "3. Model Isolation: Dedicated tenant weights stored in private KMS encrypted S3 buckets.\n"
                    "4. Prompt Injection Mitigation: Dual-pass validation with guardrail classifiers on input embeddings."
                )
            }
        ]

        self.documents = default_docs
        self.chunks = []

        for doc in self.documents:

            chunks = self._chunk_text(
                doc.get("raw_text", ""),
                doc["id"],
                doc["name"]
            )

            self.chunks.extend(chunks)

        self._save_data()
        self._rebuild_index()

    # --------------------------------------------------
    # DOCUMENT TEXT EXTRACTION
    # --------------------------------------------------

    def _extract_text(self, filename: str, content_bytes: bytes) -> str:

        extension = Path(filename).suffix.lower()

        if extension == ".pdf":

            reader = PdfReader(BytesIO(content_bytes))

            pages = [
                page.extract_text() or ""
                for page in reader.pages
            ]

            raw_text = "\n".join(pages)

        elif extension == ".docx":

            document = DocxDocument(BytesIO(content_bytes))

            paragraphs = [
                paragraph.text
                for paragraph in document.paragraphs
            ]

            table_text = []

            for table in document.tables:

                for row in table.rows:

                    table_text.append(
                        " | ".join(
                            cell.text for cell in row.cells
                        )
                    )

            raw_text = "\n".join(paragraphs + table_text)

        elif extension in {
            ".txt",
            ".md",
            ".json",
            ".csv",
            ".log",
            ".xml"
        }:

            raw_text = content_bytes.decode(
                "utf-8-sig",
                errors="replace"
            )

        else:

            raise ValueError(
                "Unsupported file type. Upload PDF, DOCX, TXT, MD, JSON, CSV, LOG or XML."
            )

        clean_text = re.sub(r"\s+", " ", raw_text).strip()

        if not clean_text:

            raise ValueError(
                "No readable text found. The PDF may be scanned or image-based."
            )

        return clean_text

    # --------------------------------------------------
    # TEXT CHUNKING
    # --------------------------------------------------

    def _chunk_text(
        self,
        text: str,
        doc_id: str,
        doc_name: str,
        chunk_size: int = 250,
        overlap: int = 50
    ) -> List[Dict[str, Any]]:

        words = text.split()

        if not words:
            return []

        chunks = []

        idx = 0
        step = max(1, chunk_size - overlap)

        for i in range(0, len(words), step):

            chunk_words = words[i:i + chunk_size]

            chunk_text = " ".join(chunk_words)

            chunks.append({
                "id": f"{doc_id}-chk-{idx}",
                "doc_id": doc_id,
                "doc_name": doc_name,
                "text": chunk_text
            })

            idx += 1

            if i + chunk_size >= len(words):
                break

        return chunks

    # --------------------------------------------------
    # REBUILD TF-IDF INDEX
    # --------------------------------------------------

    def _rebuild_index(self):

        if not self.chunks:

            self.tfidf_matrix = None
            return

        corpus = [
            chunk["text"]
            for chunk in self.chunks
        ]

        try:

            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

            logger.info(
                "RAG index rebuilt successfully. Total chunks: %s",
                len(self.chunks)
            )

        except Exception:

            logger.exception("Failed to rebuild RAG index")
            self.tfidf_matrix = None

    # --------------------------------------------------
    # GET ALL DOCUMENTS
    # --------------------------------------------------

    def get_documents(self) -> List[Dict[str, Any]]:

        return [
            {
                key: value
                for key, value in doc.items()
                if key != "raw_text"
            }
            for doc in self.documents
        ]

    # --------------------------------------------------
    # GET SINGLE DOCUMENT
    # --------------------------------------------------

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:

        for doc in self.documents:

            if doc["id"] == doc_id:
                return doc

        return None

    # --------------------------------------------------
    # ADD / UPLOAD DOCUMENT
    # --------------------------------------------------

    def add_document(
        self,
        filename: str,
        content_bytes: bytes
    ) -> Dict[str, Any]:

        if not content_bytes:
            raise ValueError("Uploaded document is empty.")

        doc_id = f"doc-{uuid.uuid4().hex[:8]}"

        size_bytes = len(content_bytes)

        size_str = (
            f"{size_bytes / (1024 * 1024):.1f} MB"
            if size_bytes > 1024 * 1024
            else f"{size_bytes / 1024:.0f} KB"
        )

        extension = (
            Path(filename).suffix.lower().lstrip(".") or "txt"
        )

        # Extract actual document text
        raw_text = self._extract_text(
            filename,
            content_bytes
        )

        # Count extracted words
        tokens = len(raw_text.split())

        # Split document into chunks
        chunks = self._chunk_text(
            raw_text,
            doc_id,
            filename
        )

        if not chunks:
            raise ValueError(
                "Document does not contain indexable text."
            )

        summary = (
            f"Indexed {len(chunks)} chunks for {filename}. "
            f"Extracted approximately {tokens} words."
        )

        new_doc = {
            "id": doc_id,
            "name": filename,
            "size": size_str,
            "type": extension,
            "tokens": tokens,
            "chunks": len(chunks),
            "uploadedAt": datetime.utcnow().isoformat() + "Z",
            "status": "indexed",
            "summary": summary,
            "raw_text": raw_text
        }

        self.documents.insert(0, new_doc)

        self.chunks.extend(chunks)

        self._save_data()
        self._rebuild_index()

        logger.info(
            "Document uploaded and indexed: %s",
            filename
        )

        return {
            key: value
            for key, value in new_doc.items()
            if key != "raw_text"
        }

    # --------------------------------------------------
    # DELETE DOCUMENT
    # --------------------------------------------------

    def delete_document(self, doc_id: str) -> bool:

        initial_length = len(self.documents)

        self.documents = [
            doc
            for doc in self.documents
            if doc["id"] != doc_id
        ]

        self.chunks = [
            chunk
            for chunk in self.chunks
            if chunk["doc_id"] != doc_id
        ]

        if len(self.documents) < initial_length:

            self._save_data()
            self._rebuild_index()

            logger.info(
                "Document deleted: %s",
                doc_id
            )

            return True

        return False

    # --------------------------------------------------
    # SEMANTIC SEARCH USING TF-IDF
    # --------------------------------------------------

    def semantic_search(
        self,
        query: str,
        doc_filter_ids: Optional[List[str]] = None,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:

        if not self.chunks or self.tfidf_matrix is None:
            return []

        if not query or not query.strip():
            return []

        try:

            # Filter documents before similarity ranking
            candidate_indices = [
                index
                for index, chunk in enumerate(self.chunks)
                if (
                    not doc_filter_ids
                    or chunk["doc_id"] in doc_filter_ids
                )
            ]

            if not candidate_indices:
                return []

            query_vec = self.vectorizer.transform([query])

            candidate_matrix = self.tfidf_matrix[
                candidate_indices
            ]

            similarities = cosine_similarity(
                query_vec,
                candidate_matrix
            ).flatten()

            ranked_positions = np.argsort(similarities)[::-1]

            results = []

            for position in ranked_positions:

                score = float(similarities[position])

                if score < 0.05:
                    break

                original_index = candidate_indices[position]

                chunk = self.chunks[original_index]

                results.append({
                    "doc_name": chunk["doc_name"],
                    "text": chunk["text"],
                    "score": round(score, 3)
                })

                if len(results) >= top_k:
                    break

            logger.info(
                "RAG search completed. Query: %s | Results: %s",
                query[:100],
                len(results)
            )

            return results

        except Exception:

            logger.exception("RAG semantic search failed")
            return []


# --------------------------------------------------
# GLOBAL RAG SERVICE
# --------------------------------------------------

rag_service = RAGService()
