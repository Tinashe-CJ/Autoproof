print("DEBUG: backend/app/services/openai_service.py loaded")

import os
import json
import time
import hashlib
import asyncio
from typing import List, Tuple, Dict, Any, Optional
from datetime import datetime, timedelta
from openai import AsyncOpenAI
from backend.app.core.config import settings
import re

# Initialize OpenAI client with proper error handling
try:
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    print("DEBUG: OpenAI client initialized successfully")
except Exception as e:
    print(f"DEBUG: Failed to initialize OpenAI client: {e}")
    client = None

# Simple in-memory cache for development (should be replaced with Redis in production)
_cache = {}
_cache_ttl = 3600  # 1 hour cache TTL

# Rate limiting
_rate_limit_queue = asyncio.Queue()
_rate_limit_delay = 0.1  # 100ms between requests
_last_request_time = 0

# Fallback models configuration
PRIMARY_MODEL = "gpt-4o-mini"
FALLBACK_MODELS = ["gpt-3.5-turbo", "gpt-4o-mini"]
MAX_RETRIES = 3

# Enhanced system prompts for different analysis scenarios
SYSTEM_PROMPTS = {
    "compliance": (
        "You are a compliance analysis assistant. "
        "Given a text from Slack, GitHub, or custom source, analyze it for potential compliance violations "
        "(e.g., SOC2, GDPR, HIPAA, PCI-DSS). Return a JSON array of objects, each with: 'type', 'issue', 'recommendation', 'severity'. "
        "Example: [{\"type\": \"GDPR\", \"issue\": \"PII shared in public channel\", "
        "\"recommendation\": \"Move to private channel\", \"severity\": \"high\"}] "
        "If no violations, return an empty array."
    ),
    "policy_parsing": (
        "You are a policy document parser. "
        "Extract structured policy rules from the given document. "
        "Return a JSON object with: 'rules' (array of rule objects), 'metadata' (document info), 'confidence' (parsing confidence score). "
        "Each rule should have: 'name', 'description', 'keywords', 'severity', 'conditions'."
    ),
    "text_analysis": (
        "You are a text analysis assistant for compliance checking. "
        "Analyze the given text for potential security, privacy, or compliance issues. "
        "Return a JSON array of objects with: 'type', 'issue', 'recommendation', 'severity', 'confidence_score'. "
        "Focus on data leaks, PII exposure, security vulnerabilities, and policy violations."
    )
}

class OpenAIError(Exception):
    """Custom exception for OpenAI-related errors"""
    pass

class RateLimitError(OpenAIError):
    """Exception raised when rate limit is exceeded"""
    pass

class TokenLimitError(OpenAIError):
    """Exception raised when token limit is exceeded"""
    pass

async def _rate_limit():
    """Implement rate limiting to avoid API throttling"""
    global _last_request_time
    current_time = time.time()
    time_since_last = current_time - _last_request_time
    
    if time_since_last < _rate_limit_delay:
        await asyncio.sleep(_rate_limit_delay - time_since_last)
    
    _last_request_time = time.time()

def _get_cache_key(text: str, source: str, analysis_type: str = "compliance") -> str:
    """Generate cache key for the analysis request"""
    content_hash = hashlib.sha256(text.encode()).hexdigest()
    return f"{analysis_type}:{source}:{content_hash}"

def _get_from_cache(cache_key: str) -> Optional[Dict[str, Any]]:
    """Get result from cache if not expired"""
    if cache_key in _cache:
        cached_data = _cache[cache_key]
        if datetime.now() - cached_data["timestamp"] < timedelta(seconds=_cache_ttl):
            return cached_data["data"]
        else:
            del _cache[cache_key]
    return None

def _set_cache(cache_key: str, data: Dict[str, Any]):
    """Store result in cache"""
    _cache[cache_key] = {
        "data": data,
        "timestamp": datetime.now()
    }

def _optimize_tokens(text: str, max_tokens: int = 4000) -> str:
    """Optimize text to fit within token limits"""
    # Simple token estimation (rough approximation: 1 token ≈ 4 characters)
    estimated_tokens = len(text) // 4
    
    if estimated_tokens <= max_tokens:
        return text
    
    # Truncate text to fit within token limit
    max_chars = max_tokens * 4
    return text[:max_chars] + "..."

async def _make_openai_request(
    messages: List[Dict[str, str]], 
    model: str, 
    max_tokens: int = 1024,
    temperature: float = 0.2
) -> Tuple[Dict[str, Any], int]:
    """Make OpenAI API request with error handling and retries"""
    if not client:
        raise OpenAIError("OpenAI client not initialized")
    
    for attempt in range(MAX_RETRIES):
        try:
            await _rate_limit()
            
            response = await client.chat.completions.create(
                model=model,
                messages=messages,  # type: ignore
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            content = response.choices[0].message.content
            if content is None:
                content = ""
            content = content.strip()
            usage = response.usage
            total_tokens = usage.total_tokens if usage else 0
            
            return {"content": content, "usage": usage}, total_tokens
            
        except Exception as e:
            error_msg = str(e).lower()
            
            if "rate limit" in error_msg or "429" in error_msg:
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    continue
                raise RateLimitError(f"Rate limit exceeded after {MAX_RETRIES} attempts")
            
            elif "token" in error_msg and "limit" in error_msg:
                raise TokenLimitError(f"Token limit exceeded: {e}")
            
            elif attempt < MAX_RETRIES - 1:
                await asyncio.sleep(1)  # Simple retry delay
                continue
            
            raise OpenAIError(f"OpenAI request failed after {MAX_RETRIES} attempts: {e}")
    
    # This should never be reached, but mypy requires it
    raise OpenAIError("All retry attempts failed")

async def analyze_text(
    text: str, 
    source: str, 
    analysis_type: str = "compliance",
    use_cache: bool = True
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Analyze text for compliance violations using OpenAI.
    
    Args:
        text: Input text to analyze
        source: Source of the content
        analysis_type: Type of analysis to perform
        use_cache: Whether to use cached results
        
    Returns:
        Tuple of (violations, token_usage)
    """
    # For now, use the enhanced analysis function
    violations, token_usage, _ = await analyze_text_with_openai(text, source)
    return violations, token_usage

async def analyze_text_with_openai(text: str, source: str, context: Dict[str, Any] = None) -> Tuple[List[Dict[str, Any]], int, str]:
    """
    Analyze text using OpenAI with enhanced context from the compliance pipeline.
    
    Args:
        text: Input text to analyze
        source: Source of the content
        context: Additional context from pipeline stages
        
    Returns:
        Tuple of (violations, token_usage, model_used)
    """
    # Prepare enhanced system prompt with context
    system_prompt = """You are AutoProof, an advanced compliance analysis system. 

Given the text, intermediate findings from pattern matching, and regulatory context, identify specific compliance violations.

Previous analysis stages found:
- Regex patterns: {regex_count} potential violations
- NER analysis: {ner_count} entity-based violations  
- Config linting: {config_count} configuration issues
- Regulatory frameworks: {frameworks}

Focus on:
1. Regulatory compliance (SOC2, GDPR, HIPAA, PCI-DSS, SOX, ISO27001)
2. Security misconfigurations
3. Data protection violations
4. Privacy concerns
5. Access control issues

Return a JSON array of violation objects, each with:
- "type": violation category
- "issue": specific problem description
- "recommendation": actionable remediation steps
- "severity": "low", "medium", "high", or "critical"
- "confidence_score": 0.0-1.0 confidence level
- "matched_content": relevant text excerpt (optional)

If no violations found, return empty array []."""

    # Format context for the prompt
    regex_count = context.get("regex_violations", 0) if context else 0
    ner_count = context.get("ner_violations", 0) if context else 0
    config_count = context.get("config_violations", 0) if context else 0
    frameworks = []
    if context and "regulatory_contexts" in context:
        frameworks = []
        for ctx in context["regulatory_contexts"]:
            regulation = ctx.get("regulation", "Unknown")
            if hasattr(regulation, 'value'):
                frameworks.append(regulation.value)
            else:
                frameworks.append(str(regulation))
    
    formatted_prompt = system_prompt.format(
        regex_count=regex_count,
        ner_count=ner_count,
        config_count=config_count,
        frameworks=", ".join(frameworks) if frameworks else "None detected"
    )
    
    # Create user message with text and context
    user_message = f"Text to analyze:\n{text}\n\nSource: {source}"
    
    if context and "compliance_recommendations" in context:
        user_message += f"\n\nCompliance recommendations:\n"
        for rec in context["compliance_recommendations"][:3]:  # Limit to top 3
            user_message += f"- {rec['issue']}: {rec['recommendation']}\n"
    
    # Make the API call
    try:
        messages = [
            {"role": "system", "content": formatted_prompt},
            {"role": "user", "content": user_message}
        ]
        
        # Use synchronous call for now (can be made async later)
        import asyncio
        loop = asyncio.get_event_loop()
        response, token_usage = await _make_openai_request(messages, PRIMARY_MODEL, max_tokens=2048)
        
        # Parse the response
        try:
            # Handle our custom response format from _make_openai_request
            if "content" in response:
                content = response["content"]
            elif "choices" in response and response["choices"]:
                content = response["choices"][0]["message"]["content"]
            else:
                print(f"DEBUG: Unexpected response format: {response}")
                return [], token_usage, PRIMARY_MODEL

            # Robustly handle markdown/code block and 'json' prefix
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            if content.lower().startswith("json"):
                content = content[4:].strip()
            # Now try to parse
            violations = json.loads(content)
            if not isinstance(violations, list):
                violations = []
        except Exception as e:
            print(f"DEBUG: JSON parsing failed for model {PRIMARY_MODEL}: {e}")
            print(f"DEBUG: Content was: {content}")
            violations = []
        
        return violations, token_usage, PRIMARY_MODEL
        
    except Exception as e:
        print(f"DEBUG: Error in analyze_text_with_openai: {e}")
        return [], 0, PRIMARY_MODEL
    """
    Analyze the given text for compliance violations using OpenAI.
    
    Args:
        text: The text to analyze
        source: Source of the text ('slack', 'github', 'custom')
        analysis_type: Type of analysis ('compliance', 'policy_parsing', 'text_analysis')
        use_cache: Whether to use caching
    
    Returns:
        Tuple of (violations, total_tokens)
    """
    # Check cache first
    if use_cache:
        cache_key = _get_cache_key(text, source, analysis_type)
        cached_result = _get_from_cache(cache_key)
        if cached_result:
            print(f"DEBUG: Returning cached result for {cache_key}")
            return cached_result["violations"], cached_result["token_usage"]
    
    # Optimize text for token limits
    optimized_text = _optimize_tokens(text)
    
    # Get appropriate system prompt
    system_prompt = SYSTEM_PROMPTS.get(analysis_type, SYSTEM_PROMPTS["compliance"])
    
    # Compose the prompt with context tag
    source_tag = f"[{source.upper()}]"
    user_message = f"{source_tag} {optimized_text}"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
    
    # Try primary model first, then fallback models
    models_to_try = [PRIMARY_MODEL] + FALLBACK_MODELS
    last_error = None
    
    for model in models_to_try:
        try:
            response_data, total_tokens = await _make_openai_request(messages, model)
            content = response_data["content"]
            
            # Parse JSON response
            try:
                if analysis_type == "policy_parsing":
                    violations = json.loads(content)
                else:
                    violations = json.loads(content) if content else []
            except json.JSONDecodeError as e:
                print(f"DEBUG: JSON parsing failed for model {model}: {e}")
                print(f"DEBUG: Raw content: {content}")
                violations = []
            
            result = {
                "violations": violations,
                "token_usage": total_tokens,
                "model_used": model
            }
            
            # Cache the result
            if use_cache:
                cache_key = _get_cache_key(text, source, analysis_type)
                _set_cache(cache_key, result)
            
            return violations, total_tokens
            
        except (RateLimitError, TokenLimitError) as e:
            last_error = e
            if model == models_to_try[-1]:  # Last model
                raise e
            continue
        except Exception as e:
            last_error = e
            if model == models_to_try[-1]:  # Last model
                raise OpenAIError(f"All models failed: {e}")
            continue
    
    raise last_error or OpenAIError("Unknown error occurred")

async def parse_policy_document(document_text: str) -> Dict[str, Any]:
    """
    Parse a policy document to extract structured rules.
    
    Args:
        document_text: The policy document text
    
    Returns:
        Dictionary containing parsed rules, metadata, and confidence score
    """
    try:
        violations, token_usage = await analyze_text(
            document_text, 
            "custom", 
            "policy_parsing",
            use_cache=True
        )
        
        # Handle the case where violations might be a list or dict
        if isinstance(violations, dict):
            return {
                "rules": violations.get("rules", []),
                "metadata": violations.get("metadata", {}),
                "confidence": violations.get("confidence", 0.0),
                "token_usage": token_usage
            }
        else:
            # If violations is a list, return empty structure
            return {
                "rules": [],
                "metadata": {},
                "confidence": 0.0,
                "token_usage": token_usage
            }
    except Exception as e:
        raise OpenAIError(f"Policy parsing failed: {e}")

async def analyze_text_compliance(text: str, source: str) -> Tuple[List[Dict[str, Any]], int]:
    """
    Analyze text for compliance violations (backward compatibility).
    
    Args:
        text: The text to analyze
        source: Source of the text
    
    Returns:
        Tuple of (violations, total_tokens)
    """
    return await analyze_text(text, source, "compliance")

NO_VIOLATION_PHRASES = [
    "no compliance violations",
    "no violations detected",
    "no issues found",
    "no compliance issues",
    "no policy violations",
    "no security violations",
    "no problems found",
    "no issues were found",
    "no violation detected"
]

NO_VIOLATION_PATTERNS = [
    r"no (apparent )?compliance violations",
    r"does not contain any (apparent )?compliance violations",
    r"no (apparent )?violations",
    r"does not contain any (apparent )?violations",
    r"no violations detected",
    r"no issues found",
    r"no compliance issues",
    r"no policy violations",
    r"no security violations",
    r"no problems found",
    r"no issues were found",
    r"no violation detected",
    r"there (is|are) no (apparent )?compliance violations",
    r"there (is|are) no (apparent )?violations",
    r"the text provided does not contain any (apparent )?compliance violations",
    r"the text provided does not contain any (apparent )?violations",
    r"no evidence of (apparent )?compliance violations",
    r"no evidence of (apparent )?violations",
    r"no (apparent )?violations present"
]

def _llm_output_indicates_no_violation(content: str) -> bool:
    content_lc = content.strip().lower()
    for pattern in NO_VIOLATION_PATTERNS:
        if re.search(pattern, content_lc):
            return True
    return False

async def analyze_with_model(model: str, messages: list[dict], max_tokens: int = 1024, temperature: float = 0.2) -> tuple[list[dict], int]:
    """
    Analyze with a specific OpenAI model, returning parsed violations and token usage.
    If the LLM returns non-JSON output, wrap it in a violation dict unless it matches a 'no violation' pattern.
    """
    response_data, total_tokens = await _make_openai_request(messages, model, max_tokens=max_tokens, temperature=temperature)
    content = response_data["content"]
    try:
        violations = json.loads(content) if content else []
    except Exception as e:
        print(f"DEBUG: JSON parsing failed in analyze_with_model: {e}")
        print(f"DEBUG: Raw content: {content}")
        # Broader detection for 'no violation' LLM outputs
        if content and _llm_output_indicates_no_violation(content):
            return [], total_tokens
        # Otherwise, treat as a single violation
        violations = [{
            "title": "AI Compliance Analysis",
            "description": content,
            "severity": "high",
            "confidence": 0.8,
            "type": "compliance_issue"
        }]
    return violations, total_tokens

# Logging and monitoring functions
def log_analysis_event(
    source: str, 
    text_length: int, 
    violations_count: int, 
    token_usage: int, 
    model_used: str,
    processing_time_ms: int
):
    """Log analysis event for monitoring and analytics"""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "source": source,
        "text_length": text_length,
        "violations_detected": violations_count,
        "token_usage": token_usage,
        "model_used": model_used,
        "processing_time_ms": processing_time_ms
    }
    print(f"ANALYSIS_LOG: {json.dumps(log_entry)}")

def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics for monitoring"""
    return {
        "cache_size": len(_cache),
        "cache_entries": list(_cache.keys()),
        "cache_ttl_seconds": _cache_ttl
    }

def clear_cache():
    """Clear the cache"""
    global _cache
    _cache = {}
    print("DEBUG: Cache cleared")


class ComplianceAnalyzer:
    """Enhanced compliance analyzer for the violation pipeline."""
    
    def __init__(self):
        self.model = PRIMARY_MODEL
        self.max_tokens = 2048
        self.temperature = 0.2
    
    async def analyze_compliance(
        self, 
        text: str, 
        context: Dict[str, Any] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Analyze text for compliance violations with enhanced context.
        
        Args:
            text: Text to analyze
            context: Additional context from pipeline stages
            
        Returns:
            Tuple of (violations, token_usage)
        """
        try:
            violations, token_usage, _ = await analyze_text_with_openai(text, "api", context)
            return violations, token_usage
        except Exception as e:
            print(f"DEBUG: Error in ComplianceAnalyzer.analyze_compliance: {e}")
            return [], 0
    
    async def analyze_with_context(
        self, 
        text: str, 
        context: Dict[str, Any] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Analyze text with context (alias for analyze_compliance).
        
        Args:
            text: Text to analyze
            context: Additional context from pipeline stages
            
        Returns:
            Tuple of (violations, token_usage)
        """
        return await self.analyze_compliance(text, context)
    
    def get_analysis_summary(self, violations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a summary of the analysis results."""
        if not violations:
            return {
                "total_violations": 0,
                "severity_breakdown": {},
                "type_breakdown": {},
                "confidence_avg": 0.0
            }
        
        severity_counts = {}
        type_counts = {}
        total_confidence = 0.0
        
        for violation in violations:
            # Count by severity
            severity = violation.get("severity", "medium")
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            
            # Count by type
            violation_type = violation.get("type", "unknown")
            type_counts[violation_type] = type_counts.get(violation_type, 0) + 1
            
            # Sum confidence scores
            total_confidence += violation.get("confidence_score", 0.0)
        
        return {
            "total_violations": len(violations),
            "severity_breakdown": severity_counts,
            "type_breakdown": type_counts,
            "confidence_avg": total_confidence / len(violations) if violations else 0.0
        } 