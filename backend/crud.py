"""
Opérations CRUD (Create, Read, Update, Delete)
===============================================
Fonctions pour interagir avec la base de données PostgreSQL.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
import bcrypt
from typing import List, Optional
import pandas as pd
import os
import requests

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
    hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
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
    try:
        if not bcrypt.checkpw(password.encode("utf-8"), user.password_hash.encode("utf-8")):
            return None
    except Exception:
        return None
    return user


# ==================== Movies ====================

# Configuration TMDB
TMDB_ACCESS_TOKEN = os.getenv("TMDB_ACCESS_TOKEN", "")
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"


def fetch_tmdb_poster(tmdb_id: int) -> Optional[str]:
    """Recupere l'URL du poster depuis TMDB via Bearer Token"""
    if not TMDB_ACCESS_TOKEN:
        print(f"[TMDB] Token d'acces manquant pour le poster du film {tmdb_id}")
        return None
    try:
        headers = {"Authorization": f"Bearer {TMDB_ACCESS_TOKEN}"}
        url = f"https://api.themoviedb.org/3/movie/{tmdb_id}"
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            poster_path = data.get("poster_path")
            if poster_path:
                return f"{TMDB_IMAGE_BASE}{poster_path}"
        else:
            print(f"[TMDB] Erreur {resp.status_code} pour film {tmdb_id}: {resp.text[:100]}")
    except Exception as e:
        print(f"[TMDB] Exception pour film {tmdb_id}: {e}")
    return None


def enrich_movie(movie: models.Movie, db: Session = None) -> models.Movie:
    """Enrichit un film avec poster_url si disponible (caché en DB)"""
    if movie.tmdb_id and not movie.poster_url:
        poster = fetch_tmdb_poster(movie.tmdb_id)
        if poster:
            movie.poster_url = poster
            if db:
                db.commit()  # Caché en base de données
    if not movie.poster_url and not TMDB_ACCESS_TOKEN and movie.tmdb_id:
        print(f"[TMDB] Token d'accès manquant pour le poster du film {movie.id}.")
    return movie


def get_movies(
    db: Session, skip: int = 0, limit: int = 20
) -> List[models.Movie]:
    """Récupère une liste paginée de films"""
    movies = db.query(models.Movie).offset(skip).limit(limit).all()
    for m in movies:
        enrich_movie(m, db)
    return movies


def get_movie(db: Session, movie_id: int) -> Optional[models.Movie]:
    """Récupère un film par son ID"""
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if movie:
        enrich_movie(movie, db)
    return movie


def search_movies(
    db: Session, query: str, limit: int = 20
) -> List[models.Movie]:
    """Recherche des films par titre"""
    movies = (
        db.query(models.Movie)
        .filter(models.Movie.title.ilike(f"%{query}%"))
        .limit(limit)
        .all()
    )
    for m in movies:
        enrich_movie(m, db)
    return movies


def bulk_import_movies(
    db: Session, csv_path: str, links_path: str = None
) -> int:
    """Importe en masse les films depuis le CSV MovieLens"""
    df = pd.read_csv(csv_path)
    
    # Charger les liens TMDB si disponibles
    tmdb_map = {}
    if links_path and os.path.exists(links_path):
        links_df = pd.read_csv(links_path)
        for _, row in links_df.iterrows():
            if pd.notna(row.get("tmdbId")):
                tmdb_map[int(row["movieId"])] = int(row["tmdbId"])
    
    count = 0
    for _, row in df.iterrows():
        existing = (
            db.query(models.Movie)
            .filter(models.Movie.id == row["movieId"])
            .first()
        )
        if not existing:
            movie_id = int(row["movieId"])
            movie = models.Movie(
                id=movie_id,
                title=row["title"],
                genres=row["genres"],
                tmdb_id=tmdb_map.get(movie_id),
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
