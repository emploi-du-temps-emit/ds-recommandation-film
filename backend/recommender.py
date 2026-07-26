"""
Système de recommandation de films
===================================
Algorithme de filtrage collaboratif basé sur la similarité cosinus.

Principe :
    "Les personnes qui aiment les mêmes films ont probablement les mêmes goûts."

Méthode :
    1. Créer une matrice utilisateur-film
    2. Calculer la similarité cosinus entre tous les utilisateurs
    3. Pour un utilisateur donné, trouver ses voisins les plus proches
    4. Prédire les notes des films non notés par moyenne pondérée
    5. Recommander les films avec les meilleures prédictions
"""

import pandas as pd
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity
import joblib
from typing import List, Dict, Optional


class MovieRecommender:
    """
    Système de recommandation de films basé sur le filtrage collaboratif.

    Attributes:
        user_movie_matrix (pd.DataFrame): Matrice utilisateur-film
        similarity_matrix (np.ndarray): Matrice de similarité entre utilisateurs
        movies_df (pd.DataFrame): DataFrame des films
        users_ids (pd.Index): Liste des IDs utilisateurs
        movie_ids (pd.Index): Liste des IDs films
    """

    def __init__(self):
        self.user_movie_matrix = None
        self.similarity_matrix = None
        self.movies_df = None
        self.users_ids = None
        self.movie_ids = None

    def fit(self, ratings_df: pd.DataFrame, movies_df: pd.DataFrame) -> None:
        """
        Entraîne le modèle à partir des données d'évaluation.

        Étapes :
        1. Création de la matrice pivot utilisateur-film
        2. Remplissage des valeurs manquantes par 0
        3. Calcul de la matrice de similarité cosinus

        Args:
            ratings_df: DataFrame avec colonnes [userId, movieId, rating]
            movies_df: DataFrame avec colonnes [movieId, title, genres]
        """
        print("📦 Création de la matrice utilisateur-film...")

        # Créer la matrice pivot
        self.user_movie_matrix = ratings_df.pivot_table(
            index="userId", columns="movieId", values="rating"
        ).fillna(0)

        self.movies_df = movies_df
        self.users_ids = self.user_movie_matrix.index
        self.movie_ids = self.user_movie_matrix.columns

        print(
            f"✅ Matrice créée : {self.user_movie_matrix.shape[0]} "
            f"utilisateurs × {self.user_movie_matrix.shape[1]} films"
        )

        print("🔗 Calcul de la matrice de similarité...")

        # Conversion en matrice sparse pour le calcul
        sparse_matrix = csr_matrix(self.user_movie_matrix.values)

        # Calcul de la similarité cosinus entre tous les utilisateurs
        self.similarity_matrix = cosine_similarity(sparse_matrix)

        print(f"✅ Matrice de similarité calculée : {self.similarity_matrix.shape}")

    def recommend(
        self, user_id: int, n_recommendations: int = 5
    ) -> List[Dict]:
        """
        Génère des recommandations pour un utilisateur donné.

        Algorithme :
        1. Trouver les 10 utilisateurs les plus similaires
        2. Pour chaque film non noté par l'utilisateur cible :
           - Récupérer les notes des utilisateurs similaires
           - Calculer une moyenne pondérée par la similarité
        3. Retourner les N films avec les meilleures prédictions

        Args:
            user_id: ID de l'utilisateur
            n_recommendations: Nombre de films à recommander

        Returns:
            Liste de dictionnaires avec les clés :
            - movieId, title, genres, predicted_rating
        """
        if user_id not in self.users_ids.tolist():
            return []

        # Index de l'utilisateur dans la matrice
        user_idx = self.users_ids.tolist().index(user_id)

        # Notes de l'utilisateur
        user_ratings = self.user_movie_matrix.iloc[user_idx].values

        # Films déjà notés
        rated_movie_indices = np.where(user_ratings > 0)[0]

        # Similarités avec les autres utilisateurs
        user_similarities = self.similarity_matrix[user_idx]

        # Top 10 des utilisateurs les plus similaires (exclure l'utilisateur lui-même)
        similar_users = np.argsort(user_similarities)[::-1][1:11]

        # Prédire les notes pour chaque film non noté
        predictions = []

        for movie_idx in range(len(user_ratings)):
            if movie_idx in rated_movie_indices:
                continue  # Déjà noté

            # Notes des utilisateurs similaires pour ce film
            similar_ratings = self.user_movie_matrix.iloc[
                similar_users, movie_idx
            ].values

            # Filtrer les notes valides (> 0)
            valid = similar_ratings > 0

            if valid.sum() >= 2:  # Au moins 2 utilisateurs similaires ont noté
                weights = user_similarities[similar_users][valid]
                ratings = similar_ratings[valid]

                # Moyenne pondérée
                predicted = np.average(ratings, weights=weights)
                movie_id = self.movie_ids[movie_idx]

                # Récupérer les infos du film
                movie_info = self.movies_df[
                    self.movies_df["movieId"] == movie_id
                ]
                if len(movie_info) > 0:
                    predictions.append(
                        {
                            "movieId": movie_id,
                            "title": movie_info["title"].values[0],
                            "genres": movie_info["genres"].values[0],
                            "predicted_rating": round(predicted, 2),
                        }
                    )

        # Trier par note prédite décroissante
        predictions = sorted(
            predictions, key=lambda x: x["predicted_rating"], reverse=True
        )

        return predictions[:n_recommendations]

    def get_user_ratings(self, user_id: int) -> List[Dict]:
        """
        Récupère les films notés par un utilisateur avec leurs notes.

        Args:
            user_id: ID de l'utilisateur

        Returns:
            Liste des films notés avec leurs notes
        """
        if user_id not in self.users_ids.tolist():
            return []

        user_ratings = self.user_movie_matrix.loc[user_id]
        rated_movies = user_ratings[user_ratings > 0]

        result = []
        for movie_id, rating in rated_movies.items():
            movie_info = self.movies_df[
                self.movies_df["movieId"] == movie_id
            ]
            if len(movie_info) > 0:
                result.append(
                    {
                        "title": movie_info["title"].values[0],
                        "rating": rating,
                    }
                )

        return sorted(result, key=lambda x: x["rating"], reverse=True)

    def save(self, filepath: str) -> None:
        """
        Sauvegarde le modèle entraîné au format .pkl

        Args:
            filepath: Chemin du fichier de sauvegarde
        """
        joblib.dump(self, filepath)
        print(f"✅ Modèle sauvegardé dans {filepath}")

    @staticmethod
    def load(filepath: str) -> "MovieRecommender":
        """
        Charge un modèle entraîné depuis un fichier .pkl

        Args:
            filepath: Chemin du fichier à charger

        Returns:
            Instance du modèle chargé
        """
        return joblib.load(filepath)
