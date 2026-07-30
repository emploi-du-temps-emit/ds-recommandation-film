"""
Script d'import des donnees MovieLens
======================================
Importe les films et evaluations depuis les fichiers CSV de MovieLens
dans la base de donnees PostgreSQL.

Usage:
    python seed_data.py                  # Importe depuis les chemins par defaut
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
    Importe les evaluations depuis le CSV MovieLens.

    Note : les evaluations importees sont liees a des utilisateurs
    du dataset original (userId de MovieLens). Pour l'application,
    seules les evaluations faites via l'API sont utilisees.
    """
    if not os.path.exists(ratings_path):
        print(f"[Warning] Fichier non trouve : {ratings_path}")
        return 0

    print(f"[Import] Import des evaluations depuis {ratings_path}...")
    df = pd.read_csv(ratings_path)
    print(f"   {len(df)} evaluations trouvees dans le CSV")

    # === Etape 1 : Creer les utilisateurs du dataset ===
    # Les ratings referencent des userId (decales de +10000) qui
    # doivent exister dans la table users (contrainte FK).
    print("   Creation des utilisateurs du dataset...")
    unique_user_ids = df["userId"].unique()
    users_created = 0
    for uid in unique_user_ids:
        mapped_id = int(uid) + 10000
        existing = db.query(models.User).filter(models.User.id == mapped_id).first()
        if not existing:
            user = models.User(
                id=mapped_id,
                username=f"movielens_{mapped_id}",
                email=f"movielens_{mapped_id}@seed.local",
                password_hash="seed_user_not_for_login",
            )
            db.add(user)
            users_created += 1
    db.commit()
    print(f"   {users_created} utilisateurs crees pour le dataset")

    # === Etape 2 : Importer les evaluations ===
    count = 0
    for _, row in df.iterrows():
        existing = (
            db.query(models.Rating)
            .filter(
                models.Rating.user_id == row["userId"] + 10000,
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
                print(f"   {count} evaluations importees...")

    db.commit()
    print(f"[OK] {count} evaluations importees avec succes")
    return count


def clear_tables(db):
    """Vide les tables de la base de donnees."""
    print("[Delete] Suppression des donnees existantes...")
    db.query(models.Recommendation).delete()
    db.query(models.Rating).delete()
    db.query(models.Movie).delete()
    db.query(models.User).delete()
    db.commit()
    print("[OK] Tables videes avec succes")


def main():
    parser = argparse.ArgumentParser(
        description="Importe les donnees MovieLens dans la base de donnees"
    )
    # Chemin par defaut : data/ml-latest-small/ a cote du dossier backend
    default_data_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "data", "ml-latest-small"
    )
    # Alternative si lance depuis Docker (volume monte dans /app/data)
    docker_data_dir = os.path.join(os.path.dirname(__file__), "data", "ml-latest-small")
    if not os.path.exists(default_data_dir) and os.path.exists(docker_data_dir):
        default_data_dir = docker_data_dir

    parser.add_argument(
        "--movies",
        default=os.path.join(default_data_dir, "movies.csv"),
        help="Chemin vers le fichier movies.csv",
    )
    parser.add_argument(
        "--links",
        default=os.path.join(default_data_dir, "links.csv"),
        help="Chemin vers le fichier links.csv (TMDB IDs)",
    )
    parser.add_argument(
        "--ratings",
        default=os.path.join(default_data_dir, "ratings.csv"),
        help="Chemin vers le fichier ratings.csv",
    )
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Vide les tables avant d'importer",
    )
    args = parser.parse_args()

    # Creation des tables si elles n'existent pas
    print("[Setup] Creation des tables...")
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if args.clear:
            clear_tables(db)

        movies_count = bulk_import_movies(db, args.movies, links_path=args.links)
        print(f"[OK] {movies_count} films importes avec succes")

        ratings_count = import_ratings(db, args.ratings)
        print(f"[OK] {ratings_count} evaluations importees avec succes")

        total_movies = db.query(models.Movie).count()
        total_ratings = db.query(models.Rating).count()
        total_users = db.query(models.User).count()

        print("\n[Stats] Statistiques finales :")
        print(f"   Films : {total_movies}")
        print(f"   Evaluations : {total_ratings}")
        print(f"   Utilisateurs : {total_users}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
