"""
Script d'entraînement du modèle de recommandation
===================================================
Lit les fichiers CSV bruts de ml-latest-small, entraîne le modèle
de filtrage collaboratif et sauvegarde le fichier .pkl.

Usage :
    python train_model.py
"""

import pandas as pd
import os
import sys

# Ajouter backend au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
from recommender import MovieRecommender

# Chemins
DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "ml-latest-small")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MOVIES_PATH = os.path.join(DATA_DIR, "movies.csv")
RATINGS_PATH = os.path.join(DATA_DIR, "ratings.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "recommendation_model.pkl")


def main():
    print("=" * 55)
    print("ENTRAINEMENT DU MODELE DE RECOMMANDATION")
    print("=" * 55)

    # 1. Création du dossier models s'il n'existe pas
    os.makedirs(MODEL_DIR, exist_ok=True)
    print(f"\n[1/4] Dossier models pret : {MODEL_DIR}")

    # 2. Chargement des données
    print(f"\n[2/4] Chargement des donnees depuis {DATA_DIR}...")
    movies = pd.read_csv(MOVIES_PATH)
    ratings = pd.read_csv(RATINGS_PATH)
    print(f"   Films : {len(movies):,}")
    print(f"   Evaluations : {len(ratings):,}")
    print(f"   Utilisateurs : {ratings['userId'].nunique():,}")
    print(f"   Note moyenne : {ratings['rating'].mean():.2f}/5")

    # 3. Entraînement du modèle
    print(f"\n[3/4] Entrainement du modele...")
    recommender = MovieRecommender()
    recommender.fit(ratings, movies)

    # 4. Sauvegarde
    print(f"\n[4/4] Sauvegarde du modele...")
    recommender.save(MODEL_PATH)

    # Vérification
    size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
    print(f"\n{'=' * 55}")
    print(f"MODELE ENTRAINE AVEC SUCCES !")
    print(f"{'=' * 55}")
    print(f"Fichier : {MODEL_PATH}")
    print(f"Taille  : {size_mb:.2f} Mo")
    print(f"Modele  : Filtrage collaboratif (similarite cosinus)")
    print(f"Matrice : {recommender.user_movie_matrix.shape[0]} utilisateurs")
    print(f"        x {recommender.user_movie_matrix.shape[1]} films")

    # Test rapide
    print(f"\n--- Test avec l'utilisateur 1 ---")
    test_recs = recommender.recommend(user_id=1, n_recommendations=3)
    if test_recs:
        for i, m in enumerate(test_recs, 1):
            print(f"  {i}. {m['title']} (note predite : {m['predicted_rating']}/5)")
    else:
        print("  L'utilisateur 1 n'a pas assez de notes dans le dataset.")

    print(f"\nPret a l'emploi !")


if __name__ == "__main__":
    main()
