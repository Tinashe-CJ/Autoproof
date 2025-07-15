from typing import Dict, Any, List
import openai
from config.settings import settings

openai.api_key = settings.OPENAI_API_KEY


class ComplianceAnalyzer:
    """Service for analyzing text/code for compliance violations using OpenAI"""
    
    COMPLIANCE_PROMPT = """
    You are a compliance expert. Analyze the following text/code for potential violations of:
    - GDPR (General Data Protection Regulation)
    - SOC 2 (Service Organization Control 2)
    - HIPAA (Health Insurance Portability and Accountability Act)
    - PCI DSS (Payment Card Industry Data Security Standard)
    - General security best practices
    
    Return a JSON response with the following structure:
    {
        "violations": [
            {
                "type": "GDPR|SOC2|HIPAA|PCI_DSS|SECURITY",
                "severity": "LOW|MEDIUM|HIGH|CRITICAL",
                "title": "Brief violation title",
                "description": "Detailed description of the violation",
                "recommendation": "How to fix this violation",
                "line_numbers": [1, 2, 3] // if applicable
            }
        ],
        "compliance_score": 85, // 0-100 score
        "summary": "Overall assessment summary"
    }
    
    Text/Code to analyze:
    """
    
    async def analyze_compliance(self, content: str, content_type: str = "text") -> Dict[str, Any]:
        """
        Analyze content for compliance violations
        
        Args:
            content: The text or code to analyze
            content_type: Type of content ("text", "code", "message")
            
        Returns:
            Analysis result with violations and recommendations
        """
        try:
            prompt = f"{self.COMPLIANCE_PROMPT}\n\n{content}"
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a compliance expert. Always respond with valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.1
            )
            
            # Extract token usage
            tokens_used = response.usage.total_tokens
            
            # Parse the response
            analysis_text = response.choices[0].message.content
            
            # Try to parse as JSON, fallback to structured response
            try:
                import json
                analysis_result = json.loads(analysis_text)
            except json.JSONDecodeError:
                # Fallback structure if GPT doesn't return valid JSON
                analysis_result = {
                    "violations": [],
                    "compliance_score": 50,
                    "summary": analysis_text,
                    "raw_response": analysis_text
                }
            
            return {
                "analysis": analysis_result,
                "tokens_used": tokens_used,
                "model": "gpt-4"
            }
            
        except Exception as e:
            raise Exception(f"OpenAI analysis failed: {str(e)}")
    
    async def analyze_batch(self, contents: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """
        Analyze multiple pieces of content in batch
        
        Args:
            contents: List of {"content": str, "type": str, "id": str}
            
        Returns:
            List of analysis results
        """
        results = []
        total_tokens = 0
        
        for item in contents:
            try:
                result = await self.analyze_compliance(
                    item["content"], 
                    item.get("type", "text")
                )
                result["item_id"] = item.get("id")
                results.append(result)
                total_tokens += result["tokens_used"]
            except Exception as e:
                results.append({
                    "item_id": item.get("id"),
                    "error": str(e),
                    "tokens_used": 0
                })
        
        return {
            "results": results,
            "total_tokens": total_tokens,
            "processed_count": len(contents)
        }