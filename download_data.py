"""
Script de téléchargement du dataset MovieLens ml-latest-small
=============================================================
Télécharge et extrait les fichiers movies.csv et ratings.csv
nécessaires à l'entraînement du modèle de recommandation.

Usage:
    python download_data.py
"""

import os
import zipfile
import urllib.request
import sys

URL = "https://files.grouplens.org/datasets/movielens/ml-latest-small.zip"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "ml-latest-small")
ZIP_PATH = os.path.join(os.path.dirname(__file__), "ml-latest-small.zip")


def download_progress(count, block_size, total_size):
    """Affiche une barre de progression basique."""
    percent = min(count * block_size * 100 / total_size, 100)
    bar = "#" * int(percent / 5) + "-" * (20 - int(percent / 5))
    sys.stdout.write(f"\r[{bar}] {percent:.0f}%")
    sys.stdout.flush()


def main():
    print("=" * 55)
    print("TELECHARGEMENT DU DATASET MOVIELENS")
    print("=" * 55)

    # 1. Création du dossier
    os.makedirs(DATA_DIR, exist_ok=True)
    print(f"\n[1/3] Dossier cree : {DATA_DIR}")

    # 2. Téléchargement
    print(f"\n[2/3] Telechargement depuis {URL}...")
    urllib.request.urlretrieve(URL, ZIP_PATH, download_progress)
    print(f"\n      Fichier zip telecharge : {ZIP_PATH}")

    # 3. Extraction
    print(f"\n[3/3] Extraction dans {DATA_DIR}...")
    with zipfile.ZipFile(ZIP_PATH, "r") as zip_ref:
        zip_ref.extractall(os.path.dirname(DATA_DIR))

    # Les fichiers sont extraits dans data/ml-latest-small/ (car le zip
    # contient un dossier ml-latest-small/ à la racine)
    movies_path = os.path.join(DATA_DIR, "movies.csv")
    ratings_path = os.path.join(DATA_DIR, "ratings.csv")

    if os.path.exists(movies_path) and os.path.exists(ratings_path):
        print(f"\n{'=' * 55}")
        print("TELECHARGEMENT REUSSI !")
        print(f"{'=' * 55}")
        print(f"  movies.csv  : {movies_path}")
        print(f"  ratings.csv : {ratings_path}")
        print(f"\nVous pouvez maintenant lancer :")
        print(f"  python train_model.py")
    else:
        print(f"\n[Erreur] Fichiers non trouves apres extraction.")
        print(f"Contenu du dossier : {os.listdir(DATA_DIR)}")

    # Nettoyage du zip
    os.remove(ZIP_PATH)
    print(f"\nNettoyage : fichier zip supprime.")


if __name__ == "__main__":
    main()
