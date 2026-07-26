"""
Modèles SQLAlchemy pour la base de données
===========================================
Définit les tables users, movies, ratings et recommendations.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    """Table des utilisateurs de l'application"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship(
        "Recommendation", back_populates="user", cascade="all, delete-orphan"
    )


class Movie(Base):
    """Table des films du dataset MovieLens"""

    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)  # movieId de MovieLens
    title = Column(String(255), nullable=False)
    genres = Column(String(255), nullable=False)

    # Relations
    ratings = relationship("Rating", back_populates="movie", cascade="all, delete-orphan")
    recommendations = relationship(
        "Recommendation", back_populates="movie", cascade="all, delete-orphan"
    )


class Rating(Base):
    """Table des évaluations des utilisateurs sur les films"""

    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    movie_id = Column(
        Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=False
    )
    rating = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Contrainte : note entre 0.5 et 5.0
    __table_args__ = (
        CheckConstraint("rating >= 0.5 AND rating <= 5.0", name="check_rating_range"),
        UniqueConstraint("user_id", "movie_id", name="unique_user_movie_rating"),
    )

    # Relations
    user = relationship("User", back_populates="ratings")
    movie = relationship("Movie", back_populates="ratings")


class Recommendation(Base):
    """Table des recommandations générées par le modèle (cachée)"""

    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    movie_id = Column(
        Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=False
    )
    predicted_rating = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Contrainte : une seule recommandation par couple (user, movie)
    __table_args__ = (
        UniqueConstraint(
            "user_id", "movie_id", name="unique_user_movie_recommendation"
        ),
    )

    # Relations
    user = relationship("User", back_populates="recommendations")
    movie = relationship("Movie", back_populates="recommendations")
