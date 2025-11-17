"""
AI Utilities
Azure OpenAI integration for embeddings and similarity detection
"""
from openai import AzureOpenAI
from core.config import settings
from typing import List, Optional
import numpy as np


# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=settings.AZURE_OPENAI_API_KEY,
    api_version=settings.AZURE_OPENAI_API_VERSION,
    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT
)


def get_embedding(text: str) -> List[float]:
    """
    Generate embedding vector for text using Azure OpenAI
    
    Args:
        text: Input text to embed
        
    Returns:
        1536-dimensional embedding vector
    """
    response = client.embeddings.create(
        input=text,
        model=settings.AZURE_OPENAI_EMBEDDING_MODEL
    )
    
    return response.data[0].embedding


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors
    
    Args:
        vec1: First embedding vector
        vec2: Second embedding vector
        
    Returns:
        Similarity score between 0 and 1 (1 = identical, 0 = completely different)
    """
    vec1_np = np.array(vec1)
    vec2_np = np.array(vec2)
    
    dot_product = np.dot(vec1_np, vec2_np)
    norm_vec1 = np.linalg.norm(vec1_np)
    norm_vec2 = np.linalg.norm(vec2_np)
    
    return dot_product / (norm_vec1 * norm_vec2)


def find_similar_suggestions(
    db,
    new_embedding: List[float],
    threshold: float = 0.85,
    limit: int = 3
) -> List[dict]:
    """
    Find suggestions similar to the new embedding using PostgreSQL pgvector
    
    Args:
        db: Database session
        new_embedding: Embedding vector of the new suggestion
        threshold: Minimum similarity threshold (0-1)
        limit: Maximum number of results to return
        
    Returns:
        List of similar suggestions with their similarity scores
    """
    from database.models import Suggestion
    from sqlalchemy import text
    
    # Convert embedding to string format for PostgreSQL
    embedding_str = "[" + ",".join(map(str, new_embedding)) + "]"
    
    # Query using pgvector's cosine distance operator (<=>)
    # Note: 1 - distance = similarity
    query = text("""
        SELECT id, title, description, vote_count,
               1 - (embedding <=> :embedding::vector) as similarity
        FROM suggestions
        WHERE 1 - (embedding <=> :embedding::vector) > :threshold
        ORDER BY similarity DESC
        LIMIT :limit
    """)
    
    results = db.execute(
        query,
        {
            "embedding": embedding_str,
            "threshold": threshold,
            "limit": limit
        }
    ).fetchall()
    
    return [
        {
            "id": str(row[0]),
            "title": row[1],
            "description": row[2],
            "vote_count": row[3],
            "similarity": float(row[4])
        }
        for row in results
    ]
