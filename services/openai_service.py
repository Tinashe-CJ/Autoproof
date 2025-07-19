from typing import Dict, Any, List, Sequence
from openai import AsyncOpenAI
from config.settings import settings
from backend.app.schemas.analyze import Violation
import json

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

class ComplianceAnalyzer:
    """
    Service for analyzing text for compliance violations using OpenAI.
    Refactored to match the minimal AnalyzeResponse and Violation schemas.
    """
    SYSTEM_PROMPT = (
        "You are a compliance analysis assistant. "
        "Given a text from Slack, GitHub, or custom source, analyze it for potential compliance violations "
        "(e.g., SOC2, GDPR, HIPAA). Return a JSON array of objects, each with: 'type', 'issue', 'recommendation', 'severity'. "
        "Example: [{\"type\": \"GDPR\", \"issue\": \"PII shared in public channel\", "
        "\"recommendation\": \"Move to private channel\", \"severity\": \"high\"}] "
        "If no violations, return an empty array."
    )

    async def analyze_compliance(self, text: str, source: str) -> Dict[str, Any]:
        """
        Analyze text for compliance violations and return AnalyzeResponse-compatible dict.
        Args:
            text: The text to analyze
            source: 'slack', 'github', or 'custom'
        Returns:
            Dict with 'violations' (list of Violation dicts) and 'token_usage' (int)
        """
        source_tag = f"[{source.upper()}]"
        user_message = f"{source_tag} {text}"
        # Per OpenAI Python SDK v1+, messages is a list of dicts with 'role' and 'content'
        messages: Sequence[dict[str, str]] = [  # type: ignore
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,  # type: ignore
                temperature=0.2,
                max_tokens=1024
            )
            content = getattr(response.choices[0].message, "content", None)
            if content is not None:
                content = content.strip()
            else:
                content = ""
            try:
                violations_raw = json.loads(content)
                # Validate/parse each violation as a Violation model
                violations = [Violation(**v).dict() for v in violations_raw]
            except Exception:
                # TODO: Add more robust JSON extraction/parsing if needed
                violations = []
            usage = response.usage
            token_usage = getattr(usage, "total_tokens", 0)
            return {
                "violations": violations,
                "token_usage": token_usage
            }
        except Exception as e:
            # TODO: Add logging and more granular error handling
            raise RuntimeError(f"OpenAI analysis failed: {e}")

# TODO: Add sync wrapper if needed
# TODO: Add batch analysis, compliance_score, summary, etc. as future enhancements