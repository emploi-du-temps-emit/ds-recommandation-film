"""
Opérations CRUD (Create, Read, Update, Delete)
===============================================
Fonctions pour interagir avec la base de données PostgreSQL.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from passlib.hash import bcrypt
from typing import List, Optional
import pandas as pd

import models
import schemas


# ==================== Users ====================

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    """Récupère un utilisateur par son ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Récupère un utilisateur par son email"""
    return (
        db.query(models.User).filter(models.User.email == email).first()
    )


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Crée un nouvel utilisateur avec mot de passe hashé"""
    hashed_password = bcrypt.hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(
    db: Session, email: str, password: str
) -> Optional[models.User]:
    """Authentifie un utilisateur par email/mot de passe"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not bcrypt.verify(password, user.password_hash):
        return None
    return user


# ==================== Movies ====================

def get_movies(
    db: Session, skip: int = 0, limit: int = 20
) -> List[models.Movie]:
    """Récupère une liste paginée de films"""
    return db.query(models.Movie).offset(skip).limit(limit).all()


def get_movie(db: Session, movie_id: int) -> Optional[models.Movie]:
    """Récupère un film par son ID"""
    return db.query(models.Movie).filter(models.Movie.id == movie_id).first()


def search_movies(
    db: Session, query: str, limit: int = 20
) -> List[models.Movie]:
    """Recherche des films par titre"""
    return (
        db.query(models.Movie)
        .filter(models.Movie.title.ilike(f"%{query}%"))
        .limit(limit)
        .all()
    )


def bulk_import_movies(
    db: Session, csv_path: str
) -> int:
    """Importe en masse les films depuis le CSV MovieLens"""
    df = pd.read_csv(csv_path)
    count = 0
    for _, row in df.iterrows():
        existing = (
            db.query(models.Movie)
            .filter(models.Movie.id == row["movieId"])
            .first()
        )
        if not existing:
            movie = models.Movie(
                id=row["movieId"],
                title=row["title"],
                genres=row["genres"],
            )
            db.add(movie)
            count += 1
    db.commit()
    return count


# ==================== Ratings ====================

def create_rating(
    db: Session, rating: schemas.RatingCreate
) -> models.Rating:
    """Ajoute ou met à jour une évaluation"""
    # Vérifier si l'évaluation existe déjà
    existing = (
        db.query(models.Rating)
        .filter(
            models.Rating.user_id == rating.user_id,
            models.Rating.movie_id == rating.movie_id,
        )
        .first()
    )

    if existing:
        # Mise à jour de la note existante
        existing.rating = rating.rating
    else:
        # Création d'une nouvelle évaluation
        existing = models.Rating(**rating.model_dump())
        db.add(existing)

    db.commit()
    db.refresh(existing)
    return existing


def get_user_ratings(
    db: Session, user_id: int
) -> List[models.Rating]:
    """Récupère toutes les évaluations d'un utilisateur"""
    return (
        db.query(models.Rating)
        .filter(models.Rating.user_id == user_id)
        .all()
    )


def get_movie_ratings(
    db: Session, movie_id: int
) -> List[models.Rating]:
    """Récupère toutes les évaluations d'un film"""
    return (
        db.query(models.Rating)
        .filter(models.Rating.movie_id == movie_id)
        .all()
    )


# ==================== Stats ====================

def get_dataset_stats(db: Session) -> dict:
    """Retourne les statistiques du dataset"""
    n_users = db.query(models.User).count()
    n_movies = db.query(models.Movie).count()
    n_ratings = db.query(models.Rating).count()

    # Note moyenne globale
    avg_rating = (
        db.query(func.avg(models.Rating.rating)).scalar() or 0
    )

    return {
        "n_users": n_users,
        "n_movies": n_movies,
        "n_ratings": n_ratings,
        "avg_rating": round(float(avg_rating), 2),
    }
