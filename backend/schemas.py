"""
Schémas Pydantic pour la validation des données
================================================
Définit la structure des données échangées via l'API.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


# ==================== Movie ====================

class Movie(BaseModel):
    """Schéma de base pour un film"""
    id: int
    title: str
    genres: str

    class Config:
        from_attributes = True


class MovieDetail(Movie):
    """Schéma détaillé d'un film (avec infos optionnelles)"""
    poster_url: Optional[str] = None
    overview: Optional[str] = None
    release_year: Optional[int] = None


# ==================== Rating ====================

class RatingCreate(BaseModel):
    """Schéma pour la création d'une évaluation"""
    user_id: int = Field(..., description="ID de l'utilisateur")
    movie_id: int = Field(..., description="ID du film")
    rating: float = Field(
        ..., ge=0.5, le=5.0, description="Note entre 0.5 et 5.0"
    )


class Rating(BaseModel):
    """Schéma de réponse pour une évaluation"""
    id: int
    user_id: int
    movie_id: int
    rating: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== User ====================

class UserCreate(BaseModel):
    """Schéma pour la création d'un utilisateur"""
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    password: str = Field(..., min_length=6, max_length=100)


class User(BaseModel):
    """Schéma de réponse pour un utilisateur (sans mot de passe)"""
    id: int
    username: str
    email: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Schéma pour la connexion"""
    email: str
    password: str


# ==================== Recommendation ====================

class MovieRecommendation(BaseModel):
    """Schéma pour une recommandation de film"""
    movie: MovieDetail
    predicted_rating: float = Field(
        ..., ge=0.5, le=5.0, description="Note prédite par le modèle"
    )
    reason: str = Field(
        ..., description="Explication de la recommandation"
    )
