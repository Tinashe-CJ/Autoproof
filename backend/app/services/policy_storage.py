"""
Policy Storage Service
Handles database operations for storing and retrieving policy rules and document metadata
"""

import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from supabase.client import Client

logger = logging.getLogger(__name__)

class PolicyStorageError(Exception):
    """Custom exception for policy storage errors"""
    pass

class PolicyStorageService:
    """
    Service for storing and retrieving policy rules and document metadata
    """
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    async def store_document_metadata(
        self,
        team_id: str,
        filename: str,
        original_filename: str,
        file_type: str,
        file_size: int,
        file_hash: str,
        document_name: Optional[str] = None,
        document_type: Optional[str] = None,
        compliance_framework: Optional[str] = None
    ) -> str:
        """
        Store document metadata and return document ID
        """
        try:
            document_data = {
                "id": str(uuid.uuid4()),
                "team_id": team_id,
                "filename": filename,
                "original_filename": original_filename,
                "file_type": file_type,
                "file_size": str(file_size),
                "file_hash": file_hash,
                "status": "uploaded",
                "document_name": document_name,
                "document_type": document_type,
                "compliance_framework": compliance_framework,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            result = self.supabase.table("policy_documents").insert(document_data).execute()
            
            if not result.data:
                raise PolicyStorageError("Failed to insert document metadata")
            
            return result.data[0]["id"]
            
        except Exception as e:
            logger.error(f"Error storing document metadata: {e}")
            raise PolicyStorageError(f"Failed to store document metadata: {str(e)}")
    
    async def update_document_processing_status(
        self,
        document_id: str,
        status: str,
        processing_metadata: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None,
        error_stage: Optional[str] = None
    ) -> bool:
        """
        Update document processing status and metadata
        """
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.now().isoformat()
            }
            
            if status == "processing":
                update_data["processing_started_at"] = datetime.now().isoformat()
            elif status in ["completed", "failed"]:
                update_data["processing_completed_at"] = datetime.now().isoformat()
                
                # Calculate processing duration
                if processing_metadata and "start_time" in processing_metadata:
                    start_time = processing_metadata["start_time"]
                    if isinstance(start_time, datetime):
                        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
                        update_data["processing_duration_ms"] = str(duration_ms)
            
            # Add processing metadata
            if processing_metadata:
                if "word_count" in processing_metadata:
                    update_data["word_count"] = str(processing_metadata["word_count"])
                if "line_count" in processing_metadata:
                    update_data["line_count"] = str(processing_metadata["line_count"])
                if "character_count" in processing_metadata:
                    update_data["character_count"] = str(processing_metadata["character_count"])
                if "extracted_text" in processing_metadata:
                    update_data["extracted_text"] = processing_metadata["extracted_text"]
            
            # Add error information
            if error_message:
                update_data["error_message"] = error_message
            if error_stage:
                update_data["error_stage"] = error_stage
            
            result = self.supabase.table("policy_documents").update(update_data).eq("id", document_id).execute()
            
            if not result.data:
                raise PolicyStorageError("Failed to update document status")
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating document status: {e}")
            raise PolicyStorageError(f"Failed to update document status: {str(e)}")
    
    async def store_policy_rules(
        self,
        team_id: str,
        document_id: str,
        rules: List[Dict[str, Any]],
        extraction_metadata: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """
        Store extracted policy rules and return rule IDs
        """
        try:
            rule_ids = []
            
            for rule in rules:
                rule_data = {
                    "id": str(uuid.uuid4()),
                    "team_id": team_id,
                    "document_id": document_id,
                    "name": rule.get("name", "Unnamed Rule"),
                    "description": rule.get("description", ""),
                    "keywords": rule.get("keywords", []),
                    "severity": rule.get("severity", "medium"),
                    "conditions": rule.get("conditions", []),
                    "rule_type": rule.get("rule_type"),
                    "category": rule.get("category"),
                    "confidence_score": rule.get("confidence_score", 0.0),
                    "extraction_method": rule.get("extraction_method", "gpt-4"),
                    "token_usage": rule.get("token_usage", 0),
                    "source_text": rule.get("source_text"),
                    "source_line_start": rule.get("source_line_start"),
                    "source_line_end": rule.get("source_line_end"),
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
                
                result = self.supabase.table("policy_rules").insert(rule_data).execute()
                
                if not result.data:
                    raise PolicyStorageError(f"Failed to insert rule: {rule.get('name', 'Unknown')}")
                
                rule_ids.append(result.data[0]["id"])
            
            return rule_ids
            
        except Exception as e:
            logger.error(f"Error storing policy rules: {e}")
            raise PolicyStorageError(f"Failed to store policy rules: {str(e)}")
    
    async def log_processing_event(
        self,
        team_id: str,
        document_id: Optional[str],
        stage: str,
        status: str,
        message: Optional[str] = None,
        duration_ms: Optional[int] = None,
        tokens_used: Optional[int] = None,
        api_calls: Optional[int] = None,
        error_type: Optional[str] = None,
        error_details: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Log a processing event for tracking and debugging
        """
        try:
            log_data = {
                "id": str(uuid.uuid4()),
                "team_id": team_id,
                "document_id": document_id,
                "stage": stage,
                "status": status,
                "message": message,
                "duration_ms": duration_ms,
                "tokens_used": tokens_used,
                "api_calls": api_calls,
                "error_type": error_type,
                "error_details": error_details,
                "created_at": datetime.now().isoformat()
            }
            
            result = self.supabase.table("document_processing_logs").insert(log_data).execute()
            
            if not result.data:
                raise PolicyStorageError("Failed to insert processing log")
            
            return result.data[0]["id"]
            
        except Exception as e:
            logger.error(f"Error logging processing event: {e}")
            raise PolicyStorageError(f"Failed to log processing event: {str(e)}")
    
    async def get_document_rules(
        self,
        team_id: str,
        document_id: str
    ) -> List[Dict[str, Any]]:
        """
        Retrieve all rules for a specific document
        """
        try:
            result = self.supabase.table("policy_rules").select("*").eq("team_id", team_id).eq("document_id", document_id).eq("deleted_at", None).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error retrieving document rules: {e}")
            raise PolicyStorageError(f"Failed to retrieve document rules: {str(e)}")
    
    async def get_team_documents(
        self,
        team_id: str,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Retrieve documents for a team with optional filtering
        """
        try:
            query = self.supabase.table("policy_documents").select("*").eq("team_id", team_id).eq("deleted_at", None)
            
            if status:
                query = query.eq("status", status)
            
            result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error retrieving team documents: {e}")
            raise PolicyStorageError(f"Failed to retrieve team documents: {str(e)}")
    
    async def get_team_rules_summary(
        self,
        team_id: str
    ) -> Dict[str, Any]:
        """
        Get a summary of rules for a team
        """
        try:
            result = self.supabase.table("team_policy_summary").select("*").eq("team_id", team_id).execute()
            
            if result.data:
                return result.data[0]
            else:
                return {
                    "team_id": team_id,
                    "total_documents": 0,
                    "processed_documents": 0,
                    "failed_documents": 0,
                    "total_rules": 0,
                    "critical_rules": 0,
                    "high_rules": 0,
                    "medium_rules": 0,
                    "low_rules": 0,
                    "avg_confidence": 0.0,
                    "total_tokens_used": 0
                }
            
        except Exception as e:
            logger.error(f"Error retrieving team rules summary: {e}")
            raise PolicyStorageError(f"Failed to retrieve team rules summary: {str(e)}")
    
    async def delete_document(
        self,
        team_id: str,
        document_id: str
    ) -> bool:
        """
        Soft delete a document and its associated rules
        """
        try:
            # Soft delete the document
            doc_result = self.supabase.table("policy_documents").update({
                "deleted_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }).eq("id", document_id).eq("team_id", team_id).execute()
            
            # Soft delete associated rules
            rules_result = self.supabase.table("policy_rules").update({
                "deleted_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }).eq("document_id", document_id).eq("team_id", team_id).execute()
            
            return bool(doc_result.data)
            
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            raise PolicyStorageError(f"Failed to delete document: {str(e)}") 