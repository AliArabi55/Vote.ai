"""
Suggestions Router
Handles suggestion creation, listing, voting, and AI-powered duplicate detection
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import uuid

from database.connection import get_db
from database.models import User, Suggestion, Vote
from routers.auth import get_current_user
from utils.ai import get_embedding, find_similar_suggestions


router = APIRouter(prefix="/suggestions", tags=["Suggestions"])


# Pydantic models
class SuggestionCreate(BaseModel):
    title: str
    description: Optional[str] = None


class SuggestionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    vote_count: int
    status: str
    created_at: str
    user_has_voted: bool = False
    
    class Config:
        from_attributes = True


class DuplicateCheckResponse(BaseModel):
    duplicate_found: bool
    similar_suggestions: List[dict] = []
    message: Optional[str] = None


class VoteResponse(BaseModel):
    suggestion_id: str
    new_vote_count: int
    user_has_voted: bool


@router.post("/check-duplicate", response_model=DuplicateCheckResponse)
async def check_duplicate(
    suggestion_data: SuggestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Check if a similar suggestion already exists using AI
    
    This should be called BEFORE creating a new suggestion to prevent duplicates
    """
    # Generate embedding for the new suggestion
    combined_text = f"{suggestion_data.title} {suggestion_data.description or ''}"
    embedding = get_embedding(combined_text)
    
    # Find similar suggestions (threshold = 0.85 means 85% similar)
    similar = find_similar_suggestions(db, embedding, threshold=0.85, limit=3)
    
    if similar:
        return DuplicateCheckResponse(
            duplicate_found=True,
            similar_suggestions=similar,
            message=f"مقترح مشابه موجود بالفعل مع {similar[0]['vote_count']} صوت. هل تريد التصويت عليه بدلاً من ذلك؟"
        )
    
    return DuplicateCheckResponse(
        duplicate_found=False,
        message="لا توجد مقترحات مشابهة. يمكنك المتابعة لإنشاء المقترح."
    )


@router.post("", response_model=SuggestionResponse, status_code=status.HTTP_201_CREATED)
async def create_suggestion(
    suggestion_data: SuggestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new suggestion
    
    - Generates AI embedding for the suggestion
    - Saves to database with embedding vector
    """
    # Generate embedding
    combined_text = f"{suggestion_data.title} {suggestion_data.description or ''}"
    embedding = get_embedding(combined_text)
    
    # Create suggestion
    new_suggestion = Suggestion(
        id=uuid.uuid4(),
        user_id=current_user.id,
        title=suggestion_data.title,
        description=suggestion_data.description,
        embedding=embedding,
        vote_count=0,
        status="pending"
    )
    
    db.add(new_suggestion)
    db.commit()
    db.refresh(new_suggestion)
    
    return SuggestionResponse(
        id=str(new_suggestion.id),
        user_id=str(new_suggestion.user_id),
        title=new_suggestion.title,
        description=new_suggestion.description,
        vote_count=new_suggestion.vote_count,
        status=new_suggestion.status,
        created_at=str(new_suggestion.created_at),
        user_has_voted=False
    )


@router.get("", response_model=List[SuggestionResponse])
async def get_suggestions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all suggestions sorted by vote_count (most popular first)
    
    This is the "Feed" - automatically sorted by popularity
    """
    # Query suggestions ordered by vote_count DESC (thanks to the index!)
    suggestions = db.query(Suggestion).order_by(
        Suggestion.vote_count.desc()
    ).offset(skip).limit(limit).all()
    
    # Check which suggestions the current user has voted on
    user_votes = db.query(Vote.suggestion_id).filter(
        Vote.user_id == current_user.id
    ).all()
    voted_suggestion_ids = {str(vote[0]) for vote in user_votes}
    
    # Build response with user_has_voted flag
    return [
        SuggestionResponse(
            id=str(s.id),
            user_id=str(s.user_id),
            title=s.title,
            description=s.description,
            vote_count=s.vote_count,
            status=s.status,
            created_at=str(s.created_at),
            user_has_voted=str(s.id) in voted_suggestion_ids
        )
        for s in suggestions
    ]


@router.get("/{suggestion_id}", response_model=SuggestionResponse)
async def get_suggestion(
    suggestion_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific suggestion by ID
    """
    suggestion = db.query(Suggestion).filter(Suggestion.id == uuid.UUID(suggestion_id)).first()
    
    if not suggestion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suggestion not found"
        )
    
    # Check if user has voted
    user_vote = db.query(Vote).filter(
        Vote.user_id == current_user.id,
        Vote.suggestion_id == suggestion.id
    ).first()
    
    return SuggestionResponse(
        id=str(suggestion.id),
        user_id=str(suggestion.user_id),
        title=suggestion.title,
        description=suggestion.description,
        vote_count=suggestion.vote_count,
        status=suggestion.status,
        created_at=str(suggestion.created_at),
        user_has_voted=user_vote is not None
    )


@router.post("/{suggestion_id}/vote", response_model=VoteResponse)
async def toggle_vote(
    suggestion_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Toggle vote on a suggestion (upvote or remove vote)
    
    - If user hasn't voted: Add vote and increment vote_count
    - If user has voted: Remove vote and decrement vote_count
    
    This is ATOMIC - uses database transaction
    """
    suggestion = db.query(Suggestion).filter(
        Suggestion.id == uuid.UUID(suggestion_id)
    ).first()
    
    if not suggestion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suggestion not found"
        )
    
    # Check if user has already voted
    existing_vote = db.query(Vote).filter(
        Vote.user_id == current_user.id,
        Vote.suggestion_id == suggestion.id
    ).first()
    
    if existing_vote:
        # Remove vote (downvote)
        db.delete(existing_vote)
        suggestion.vote_count -= 1
        user_has_voted = False
    else:
        # Add vote (upvote)
        new_vote = Vote(
            user_id=current_user.id,
            suggestion_id=suggestion.id
        )
        db.add(new_vote)
        suggestion.vote_count += 1
        user_has_voted = True
    
    db.commit()
    db.refresh(suggestion)
    
    return VoteResponse(
        suggestion_id=str(suggestion.id),
        new_vote_count=suggestion.vote_count,
        user_has_voted=user_has_voted
    )


@router.get("/my/votes", response_model=List[SuggestionResponse])
async def get_my_votes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all suggestions the current user has voted on
    """
    # Get suggestion IDs the user voted on
    voted_suggestions = db.query(Suggestion).join(Vote).filter(
        Vote.user_id == current_user.id
    ).order_by(Suggestion.vote_count.desc()).all()
    
    return [
        SuggestionResponse(
            id=str(s.id),
            user_id=str(s.user_id),
            title=s.title,
            description=s.description,
            vote_count=s.vote_count,
            status=s.status,
            created_at=str(s.created_at),
            user_has_voted=True
        )
        for s in voted_suggestions
    ]
