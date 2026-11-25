import json
import random
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.config import STORAGE_DIR

class TriageService:
    def __init__(self):
        self.tickets_file = STORAGE_DIR / "tickets.json"
        self.tickets: List[Dict[str, Any]] = []
        self._load_data()

    def _load_data(self):
        if self.tickets_file.exists():
            try:
                with open(self.tickets_file, "r", encoding="utf-8") as f:
                    self.tickets = json.load(f)
            except Exception:
                self.tickets = []

        if not self.tickets:
            self._seed_default_tickets()

    def _save_data(self):
        with open(self.tickets_file, "w", encoding="utf-8") as f:
            json.dump(self.tickets, f, indent=2)

    def _seed_default_tickets(self):
        self.tickets = [
            {
                "id": "TCK-8942",
                "title": "High latency spikes on Vector Search API cluster in us-east-1",
                "customer": "Sarah Jenkins (Apex FinTech)",
                "email": "sarah.j@apexfin.io",
                "priority": "Urgent",
                "status": "In Progress",
                "category": "Infrastructure",
                "sentiment": "Frustrated (-0.72)",
                "sentimentScore": -0.72,
                "createdAt": "12 mins ago",
                "slaDue": "18 mins remaining",
                "messages": [
                    {"sender": "customer", "text": "Our production embedding queries are taking >1400ms instead of the usual 80ms. Multiple user timeouts triggered."}
                ],
                "aiTriage": {
                    "urgency": "P1 Critical",
                    "rootCauseHypothesis": "Likely HNSW index memory fragmentation or replica throttling during node rebalance.",
                    "confidence": "96%",
                    "suggestedResolution": "Scale read replicas to 4 pods, verify PVC IOPS threshold, and recycle pod-vector-worker-03.",
                    "suggestedDraft": (
                        "Hi Sarah,\n\nOur automated telemetry detected the query latency anomaly on the us-east-1 vector shard. "
                        "We have already provisioned additional read replica nodes and cleared the pending HNSW cache lock.\n\n"
                        "Latency has normalized back to 42ms. We are monitoring for the next 30 minutes to confirm total stability.\n\n"
                        "Best regards,\nAURA Enterprise Support Team"
                    )
                }
            },
            {
                "id": "TCK-8941",
                "title": "Request for custom SSO SAML 2.0 configuration with Okta",
                "customer": "David Chen (OmniCorp)",
                "email": "dchen@omnicorp.org",
                "priority": "Medium",
                "status": "Open",
                "category": "Authentication",
                "sentiment": "Neutral (+0.12)",
                "sentimentScore": 0.12,
                "createdAt": "45 mins ago",
                "slaDue": "3 hours remaining",
                "messages": [
                    {"sender": "customer", "text": "We are rolling out Okta enterprise-wide and need the ACS URL and Entity ID for our tenant domain."}
                ],
                "aiTriage": {
                    "urgency": "P3 Standard",
                    "rootCauseHypothesis": "Routine enterprise tenant SSO integration request.",
                    "confidence": "99%",
                    "suggestedResolution": "Provide tenant ACS endpoint and SAML metadata descriptor link from organization settings.",
                    "suggestedDraft": (
                        "Hello David,\n\nThank you for reaching out. Here are your dedicated Okta SAML 2.0 configuration attributes:\n"
                        "- Single Sign-On ACS URL: https://auth.aura-ai.io/saml/sso/omnicorp\n"
                        "- Audience URI (Entity ID): urn:aura-ai:saml:omnicorp\n"
                        "- Name ID Format: EmailAddress\n\n"
                        "Let us know if you need assistance testing assertion claims.\n\n"
                        "Warm regards,\nAURA Support"
                    )
                }
            },
            {
                "id": "TCK-8939",
                "title": "Billing invoice discrepancy for September GPU inference tokens",
                "customer": "Elena Rostova (NeuralLab Inc)",
                "email": "elena@neurallab.ai",
                "priority": "High",
                "status": "Resolved",
                "category": "Billing",
                "sentiment": "Concerned (-0.38)",
                "sentimentScore": -0.38,
                "createdAt": "2 hours ago",
                "slaDue": "Resolved within SLA",
                "messages": [
                    {"sender": "customer", "text": "The token breakdown shows 1.2M DeepSeek tokens charged at GPT-4o tier."}
                ],
                "aiTriage": {
                    "urgency": "P2 High",
                    "rootCauseHypothesis": "Billing tier mapping config tag was outdated during September 28 release.",
                    "confidence": "98%",
                    "suggestedResolution": "Issue an automated credit memo of $184.50 and update billing meter tags.",
                    "suggestedDraft": (
                        "Hi Elena,\n\nWe investigated your September invoice. You are completely right—the system applied the default rate prior to model classification update. "
                        "We have applied a $184.50 credit to your billing ledger and updated your current statement.\n\n"
                        "Thank you for catching this!\n\nBest regards,\nAURA Finance & Support"
                    )
                }
            }
        ]
        self._save_data()

    def get_all_tickets(self) -> List[Dict[str, Any]]:
        return self.tickets

    def get_ticket(self, ticket_id: str) -> Optional[Dict[str, Any]]:
        for t in self.tickets:
            if t["id"] == ticket_id:
                return t
        return None

    def create_ticket(self, data: Dict[str, Any]) -> Dict[str, Any]:
        random_num = random.randint(1000, 9999)
        ticket_id = f"TCK-{random_num}"
        priority = data.get("priority", "Urgent")
        customer = data.get("customer", "Enterprise Client")
        title = data.get("title", "New Customer Inquiry")
        description = data.get("description", title)
        email = data.get("email", "client@enterprise.com")
        category = data.get("category", "General Operations")

        # Sentiment estimation
        text_lower = (title + " " + description).lower()
        if any(w in text_lower for w in ["timeout", "broken", "critical", "latency", "failed", "down", "error"]):
            sentiment = "Urgent / Frustrated (-0.68)"
            score = -0.68
            urgency = "P1 Critical" if priority == "Urgent" else "P2 High"
            confidence = "97%"
            hypothesis = f"Telemetry alert triggered regarding {title}. Memory or IOPS threshold reached."
            resolution = "Perform cluster health probe, inspect error traces, and scale read replicas."
        else:
            sentiment = "Neutral (+0.10)"
            score = 0.10
            urgency = "P3 Standard"
            confidence = "95%"
            hypothesis = "General enterprise operational request or account inquiry."
            resolution = "Provide requested configuration attributes or answer technical documentation query."

        first_name = customer.split()[0] if customer else "there"
        suggested_draft = (
            f"Hello {first_name},\n\n"
            f"Thank you for contacting AURA Support regarding \"{title}\". "
            f"Our automated diagnostic telemetry has ingested your request and flagged it as {urgency}.\n\n"
            f"Our engineering team is actively reviewing your tenant environment and will provide a full resolution update shortly.\n\n"
            f"Best regards,\nAURA Autonomous Operations"
        )

        new_ticket = {
            "id": ticket_id,
            "title": title,
            "customer": customer,
            "email": email,
            "priority": priority,
            "status": "Open",
            "category": category,
            "sentiment": sentiment,
            "sentimentScore": score,
            "createdAt": "Just now",
            "slaDue": "4 hours remaining" if urgency == "P3 Standard" else "25 mins remaining",
            "messages": [{"sender": "customer", "text": description}],
            "aiTriage": {
                "urgency": urgency,
                "rootCauseHypothesis": hypothesis,
                "confidence": confidence,
                "suggestedResolution": resolution,
                "suggestedDraft": suggested_draft
            }
        }

        self.tickets.insert(0, new_ticket)
        self._save_data()
        return new_ticket

    def update_status(self, ticket_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        for t in self.tickets:
            if t["id"] == ticket_id:
                t["status"] = new_status
                if new_status == "Resolved":
                    t["slaDue"] = "Resolved within SLA"
                self._save_data()
                return t
        return None

    def regenerate_triage(self, ticket_id: str) -> Optional[Dict[str, Any]]:
        for t in self.tickets:
            if t["id"] == ticket_id:
                first_name = t["customer"].split()[0] if t["customer"] else "there"
                t["aiTriage"]["confidence"] = "98%"
                t["aiTriage"]["suggestedDraft"] = (
                    f"Hi {first_name},\n\n"
                    f"We have finalized our diagnostics for incident {ticket_id}. "
                    f"Our autonomous cluster controller has rerouted queries to healthy shard replicas and verified normal throughput.\n\n"
                    f"Please confirm that your API integration is operating smoothly on your end.\n\n"
                    f"Warm regards,\nAURA Enterprise Operations"
                )
                self._save_data()
                return t
        return None

triage_service = TriageService()
