"""
Movie Recommender API - FastAPI Backend
========================================
API de recommandation de films basée sur le Machine Learning.
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import joblib
import os

from database import SessionLocal, engine
import models
import schemas
import crud

# Création des tables dans la base de données
models.Base.metadata.create_all(bind=engine)

# Initialisation de l'application
app = FastAPI(
    title="Movie Recommender API",
    description="API de recommandation de films personnalisée avec Machine Learning",
    version="1.0.0",
    contact={
        "name": "Movie Recommender Team",
        "url": "https://github.com/your-repo/movie-recommender",
    },
)

# Configuration CORS - permet au frontend d'accéder à l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, limiter aux domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chargement du modèle IA
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "models", "recommendation_model.pkl"
)

# Initialisation du recommender (sera chargé à la demande)
recommender = None


def get_recommender():
    """Charge le modèle IA (lazy loading)"""
    global recommender
    if recommender is None:
        if os.path.exists(MODEL_PATH):
            recommender = joblib.load(MODEL_PATH)
        else:
            recommender = None
    return recommender


# Dépendance pour la session base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ===================== Routes =====================

@app.get("/")
def read_root():
    """Page d'accueil de l'API"""
    return {
        "message": "🎬 API de recommandation de films",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "GET  /": "Cette page",
            "GET  /movies": "Liste des films (paginated)",
            "GET  /movies/{id}": "Détail d'un film",
            "POST /ratings": "Noter un film",
            "GET  /recommendations/{user_id}": "Recommandations personnalisées",
            "POST /users": "Créer un utilisateur",
            "POST /login": "Connexion",
            "GET  /stats": "Statistiques du dataset",
        },
    }


@app.get("/movies", response_model=List[schemas.Movie])
def get_movies(
    skip: int = 0, limit: int = 20, db: Session = Depends(get_db)
):
    """Récupère la liste des films avec pagination"""
    movies = crud.get_movies(db, skip=skip, limit=limit)
    return movies


@app.get("/movies/{movie_id}", response_model=schemas.MovieDetail)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    """Récupère les détails d'un film spécifique"""
    movie = crud.get_movie(db, movie_id)
    if not movie:
        raise HTTPException(
            status_code=404, detail=f"Film avec ID {movie_id} non trouvé"
        )
    return movie


@app.post("/ratings", response_model=schemas.Rating)
def create_rating(rating: schemas.RatingCreate, db: Session = Depends(get_db)):
    """Ajoute ou met à jour une évaluation de film"""
    if rating.rating < 0.5 or rating.rating > 5.0:
        raise HTTPException(
            status_code=400, detail="La note doit être entre 0.5 et 5.0"
        )
    return crud.create_rating(db, rating)


@app.get(
    "/recommendations/{user_id}",
    response_model=List[schemas.MovieRecommendation],
)
def get_recommendations(
    user_id: int, n: int = 5, db: Session = Depends(get_db)
):
    """Génère des recommandations personnalisées pour un utilisateur"""
    recommender_model = get_recommender()

    if recommender_model is None:
        raise HTTPException(
            status_code=503,
            detail="Le modèle de recommandation n'est pas encore entraîné. "
            "Lancez d'abord le notebook 05_modelisation.ipynb",
        )

    # Récupérer les notes de l'utilisateur depuis la BDD
    user_ratings = crud.get_user_ratings(db, user_id)

    if len(user_ratings) < 3:
        raise HTTPException(
            status_code=400,
            detail="L'utilisateur doit avoir noté au moins 3 films "
            "pour obtenir des recommandations",
        )

    # Générer les recommandations avec le modèle IA
    recommendations = recommender_model.recommend(user_id, n_recommendations=n)

    # Enrichir avec les informations de la BDD
    result = []
    for rec in recommendations:
        movie = crud.get_movie(db, rec["movieId"])
        if movie:
            result.append(
                schemas.MovieRecommendation(
                    movie=movie,
                    predicted_rating=rec["predicted_rating"],
                    reason="Basé sur vos évaluations et celles "
                    "d'utilisateurs ayant des goûts similaires",
                )
            )

    return result


@app.post("/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Crée un nouveau compte utilisateur"""
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(
            status_code=400, detail="Un compte avec cet email existe déjà"
        )
    return crud.create_user(db, user)


@app.post("/login")
def login(
    credentials: schemas.LoginRequest, db: Session = Depends(get_db)
):
    """Authentifie un utilisateur et retourne son ID"""
    user = crud.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
        )
    return {
        "user_id": user.id,
        "username": user.username,
        "message": "Connexion réussie",
    }


@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Retourne les statistiques du dataset"""
    return crud.get_dataset_stats(db)
