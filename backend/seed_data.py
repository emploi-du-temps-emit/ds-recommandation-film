"""
Script d'import des données MovieLens
======================================
Importe les films et évaluations depuis les fichiers CSV de MovieLens
dans la base de données PostgreSQL.

Usage:
    python seed_data.py                  # Importe depuis les chemins par défaut
    python seed_data.py --movies data/movies.csv --ratings data/ratings.csv
    python seed_data.py --clear           # Vide les tables avant d'importer
"""

import argparse
import os
import sys

import pandas as pd

# Ajouter le dossier backend au path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
import models
from crud import bulk_import_movies


def import_ratings(db, ratings_path: str, batch_size: int = 1000) -> int:
    """
    Importe les évaluations depuis le CSV MovieLens.

    Note : les évaluations importées sont liées à des utilisateurs
    du dataset original (userId de MovieLens). Pour l'application,
    seules les évaluations faites via l'API sont utilisées.
    """
    if not os.path.exists(ratings_path):
        print(f"[Warning] Fichier non trouvé : {ratings_path}")
        return 0

    print(f"[Import] Import des évaluations depuis {ratings_path}...")
    df = pd.read_csv(ratings_path)
    print(f"   {len(df)} évaluations trouvées dans le CSV")

    # On importe les évaluations comme données d'entraînement
    # (elles seront utilisées par le modèle mais pas par l'API)
    count = 0
    for _, row in df.iterrows():
        existing = (
            db.query(models.Rating)
            .filter(
                models.Rating.user_id == row["userId"] + 10000,  # Décalage pour éviter les conflits
                models.Rating.movie_id == row["movieId"],
            )
            .first()
        )
        if not existing:
            rating = models.Rating(
                user_id=row["userId"] + 10000,
                movie_id=row["movieId"],
                rating=row["rating"],
            )
            db.add(rating)
            count += 1

            if count % batch_size == 0:
                db.commit()
                print(f"   {count} évaluations importées...")

    db.commit()
    print(f"✅ {count} évaluations importées avec succès")
    return count


def clear_tables(db):
    """Vide les tables de la base de données."""
    print("[Delete] Suppression des données existantes...")
    db.query(models.Recommendation).delete()
    db.query(models.Rating).delete()
    db.query(models.Movie).delete()
    db.query(models.User).delete()
    db.commit()
    print("✅ Tables vidées avec succès")


def main():
    parser = argparse.ArgumentParser(
        description="Importe les données MovieLens dans la base de données"
    )
    parser.add_argument(
        "--movies",
        default=os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "data",
            "ml-latest-small",
            "movies.csv",
        ),
        help="Chemin vers le fichier movies.csv",
    )
    parser.add_argument(
        "--ratings",
        default=os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "data",
            "ml-latest-small",
            "ratings.csv",
        ),
        help="Chemin vers le fichier ratings.csv",
    )
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Vide les tables avant d'importer",
    )
    args = parser.parse_args()

    # Création des tables si elles n'existent pas
    print("[Setup] Création des tables...")
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if args.clear:
            clear_tables(db)

        movies_count = bulk_import_movies(db, args.movies)
        print(f"✅ {movies_count} films importés avec succès")

        ratings_count = import_ratings(db, args.ratings)
        print(f"✅ {ratings_count} évaluations importées avec succès")

        total_movies = db.query(models.Movie).count()
        total_ratings = db.query(models.Rating).count()
        total_users = db.query(models.User).count()

        print("\n[Stats] Statistiques finales :")
        print(f"   Films : {total_movies}")
        print(f"   Évaluations : {total_ratings}")
        print(f"   Utilisateurs : {total_users}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
