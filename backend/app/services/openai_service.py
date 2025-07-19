print("DEBUG: backend/app/services/openai_service.py loaded")

import os
import openai
import json
from typing import List, Tuple
from backend.app.core.config import settings

key_env = os.getenv("OPENAI_API_KEY")
if key_env:
    print("DEBUG: Backend OpenAI key prefix:", key_env[:8], "********")
else:
    print("DEBUG: Backend OpenAI key is None!")

# SYSTEM_PROMPT: Instructs GPT-4o-mini to return a JSON list of violations with required fields
SYSTEM_PROMPT = (
    "You are a compliance analysis assistant. "
    "Given a text from Slack, GitHub, or custom source, analyze it for potential compliance violations "
    "(e.g., SOC2, GDPR, HIPAA). Return a JSON array of objects, each with: 'type', 'issue', 'recommendation', 'severity'. "
    "Example: [{\"type\": \"GDPR\", \"issue\": \"PII shared in public channel\", "
    "\"recommendation\": \"Move to private channel\", \"severity\": \"high\"}] "
    "If no violations, return an empty array."
)

openai.api_key = settings.OPENAI_API_KEY
if openai.api_key:
    print("DEBUG: openai.api_key prefix:", openai.api_key[:8], "********")
else:
    print("DEBUG: openai.api_key is None!")

async def analyze_text(text: str, source: str) -> Tuple[List[dict], int]:
    """
    Analyze the given text for compliance violations using OpenAI GPT-4o-mini.
    Returns (violations, total_tokens).
    """
    # Compose the prompt with context tag
    source_tag = f"[{source.upper()}]"
    user_message = f"{source_tag} {text}"
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message}
    ]
    try:
        response = await openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.2,
            max_tokens=1024
        )
        # Extract the JSON from the response
        content = response.choices[0].message["content"].strip()
        try:
            violations = json.loads(content)
        except json.JSONDecodeError:
            # TODO: Add more robust JSON extraction/parsing if needed
            violations = []
        usage = response["usage"]
        total_tokens = usage.get("prompt_tokens", 0) + usage.get("completion_tokens", 0)
        return violations, total_tokens
    except Exception as e:
        # TODO: Add logging and more granular error handling
        raise RuntimeError(f"OpenAI analysis failed: {e}") 