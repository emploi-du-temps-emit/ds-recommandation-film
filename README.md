# MovieReco - Systeme de Recommandation de Films

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100-green)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![License](https://img.shields.io/badge/Licence-MIT-yellow)](LICENSE)

## Description

**MovieReco** est un systeme de recommandation de films base sur le **Machine Learning**. Il utilise le **filtrage collaboratif** avec **similarite cosinus** pour analyser les gouts des utilisateurs et leur suggerer des films personnalises.

> *"Les personnes qui aiment les memes films ont probablement les memes gouts."*

### Fonctionnalites

- **Inscription et Connexion** - Creez votre compte
- **Notation de films** - Notez les films de 0.5 a 5 etoiles
- **Recommandations IA** - Suggestions basees sur vos gouts
- **Recherche** - Trouvez des films par titre
- **Analyse de donnees** - Visualisations et statistiques

---

## Architecture

```
+--------------+     +--------------+     +--------------+
|   Frontend   |---->|   Backend    |---->|  Base de     |
|   Next.js    |     |   FastAPI    |     |  donnees     |
|   React/TS   |<----|   Python     |<----|  PostgreSQL  |
+--------------+     +------+-------+     +--------------+
                            |
                            v
                     +--------------+
                     |   Modele IA  |
                     |  Filtrage    |
                     |  Collaboratif|
                     +--------------+
```

---

## Structure du projet

```
movie-recommendation/
|
+-- backend/           # API FastAPI
|   +-- main.py        # Point d'entree
|   +-- database.py    # Connexion PostgreSQL
|   +-- models.py      # Modeles SQLAlchemy
|   +-- schemas.py     # Schemas Pydantic
|   +-- crud.py        # Operations CRUD
|   +-- recommender.py # Modele IA
|   +-- Dockerfile
|   +-- requirements.txt
|
+-- frontend/          # Application Next.js
|   +-- app/           # Pages App Router
|   +-- components/    # Composants React
|   +-- services/      # Service API
|   +-- Dockerfile
|
+-- data/              # Dataset MovieLens
+-- models/            # Modeles .pkl
+-- notebooks/         # Jupyter Notebooks
|   +-- 01_importation.ipynb
|   +-- 02_nettoyage.ipynb
|   +-- 03_analyse.ipynb
|   +-- 04_preparation.ipynb
|   +-- 05_modelisation.ipynb
|   +-- 06_evaluation.ipynb
|
+-- img-lecon/         # Visuels pour LinkedIn
|   +-- 01-architecture.svg
|   +-- 02-recommandation.svg
|   +-- 03-fastapi.svg
|   +-- 04-frontend.svg
|   +-- 05-docker.svg
|   +-- 06-data-science.svg
|
+-- desc.md            # Descriptions LinkedIn
+-- docker-compose.yml
+-- requirements.txt
+-- .env.example
+-- README.md
```

---

## Installation

### Pre-requis

- Python 3.10+
- Node.js 18+
- PostgreSQL 15+ (optionnel)
- Docker (optionnel)

### 1. Cloner et configurer

```bash
git clone https://github.com/votre-username/movie-recommender.git
cd movie-recommender

# Environnement virtuel Python
python -m venv venv
source venv/bin/activate  # Mac/Linux
# ou
venv\Scripts\activate     # Windows

# Dependances Python
pip install -r requirements.txt
```

### 2. Telecharger le dataset

```bash
cd data
curl -O https://files.grouplens.org/datasets/movielens/ml-latest-small.zip
unzip ml-latest-small.zip
cd ..
```

### 3. Entrainer le modele

```bash
jupyter notebook notebooks/05_modelisation.ipynb
```

### 4. Lancer le backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Lancer le frontend

```bash
cd frontend
npm install
npm run dev
```

### 6. Acceder a l'application

| Service    | URL                              |
|------------|----------------------------------|
| Frontend   | http://localhost:3000             |
| Backend    | http://localhost:8000             |
| API Docs   | http://localhost:8000/docs        |

---

## Version Docker

```bash
docker-compose up --build
```

---

## Resultats

Le modele atteint les performances suivantes :

| Metrique    | Valeur | Interpretation                     |
|-------------|--------|------------------------------------|
| Precision   | ~72%   | 72% des recommandations pertinentes |
| Recall      | ~45%   | 45% des films apprecies retrouves   |
| F1-Score    | ~56%   | Bon equilibre precision/rappel      |
| RMSE        | ~0.87  | Erreur moyenne de 0.87 point        |

---

## Technologies

| Technologie         | Utilisation                    |
|---------------------|--------------------------------|
| Python              | Langage principal Data Science |
| Pandas / NumPy      | Manipulation des donnees       |
| Scikit-learn        | Algorithme de recommandation   |
| FastAPI             | API REST backend               |
| PostgreSQL          | Base de donnees                |
| SQLAlchemy          | ORM Python                     |
| Next.js / React     | Frontend web                   |
| TypeScript          | Typage frontend                |
| Tailwind CSS        | Styles et animations           |
| Docker              | Conteneurisation               |

---

## 📱 Post LinkedIn - Carrousel 6 slides

Des visuels illustres pour presenter le projet sur LinkedIn (format carrousel 1200 × 628 px) :

| Slide | Sujet | Apercu |
|-------|-------|--------|
| 1 | **Architecture** | Diagramme 3-tiers : Navigateur → Frontend → Backend → DB + Docker |
| 2 | **Algorithme** | Flow filtrage collaboratif : Users → Matrice → Cosinus → Prediction |
| 3 | **API REST** | Endpoints GET/POST/DEL + Concepts FastAPI appris |
| 4 | **Frontend** | Maquette UI + Composants React + Animations CSS |
| 5 | **Docker** | 3 conteneurs illustres + docker-compose + commandes |
| 6 | **Data Science** | Stats dataset + Pipeline 5 etapes + Librairies |

Les visuels sont dans le dossier [`img-lecon/`](img-lecon/), les descriptions dans [`desc.md`](desc.md).

---

## Licence

Ce projet est sous licence MIT.

## Auteurs

Projet realise dans le cadre d'un cours de Data Science / Machine Learning.
