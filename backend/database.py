"""
Configuration de la base de données PostgreSQL
===============================================
Utilise SQLAlchemy pour la connexion et la gestion des sessions.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de connexion à la base de données
# Par défaut : PostgreSQL locale
# En production : utiliser la variable d'environnement DATABASE_URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/movie_recommender",
)

# Création du moteur SQLAlchemy
engine = create_engine(DATABASE_URL)

# Factory de sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base pour les modèles déclaratifs
Base = declarative_base()
