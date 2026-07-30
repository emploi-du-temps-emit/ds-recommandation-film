# 📱 Post LinkedIn — Carrousel 6 slides

## Titre du post
**De l'idée au déploiement : Comment j'ai construit un système de recommandation de films avec Python, FastAPI et Docker 🚀**

---

## Slide 1 — Architecture du Projet

**Texte du slide :**
Architecture 3-tiers : Next.js (frontend) → FastAPI (backend) → PostgreSQL (base de données), orchestré avec Docker Compose.

**Légende :**
Leçon #1 : Séparez toujours vos couches. Frontend, backend et base de données dans des conteneurs indépendants = maintenabilité, scalabilité, et développement parallèle. Les volumes bind-mount en dev permettent le hot-reload sans rebuild.

---

## Slide 2 — Algorithme de Recommandation

**Texte du slide :**
Filtrage collaboratif par similarité cosinus : matrice utilisateur-film → top 10 voisins → prédiction pondérée.

**Légende :**
Leçon #2 : Le filtrage collaboratif est puissant car il ne nécessite AUCUNE métadonnée sur les films. Il suffit des notes des utilisateurs. La matrice creuse (csr_matrix de scipy.sparse) est essentielle pour gérer les 100 000+ évaluations sans exploser la mémoire.

---

## Slide 3 — API REST avec FastAPI

**Texte du slide :**
6 endpoints REST, validation Pydantic, ORM SQLAlchemy, authentification JWT, et injection de dépendances.

**Légende :**
Leçon #3 : FastAPI est incroyablement productif. La validation automatique des schémas, la documentation interactive Swagger, et l'injection de dépendances rendent le backend à la fois robuste et facile à maintenir. Le hachage des mots de passe avec bcrypt est non-négociable.

---

## Slide 4 — Frontend Next.js + Tailwind CSS

**Texte du slide :**
Interface cyberpunk jaune/noir avec React 19, Next.js 16, Tailwind CSS v4, et des animations CSS personnalisées.

**Légende :**
Leçon #4 : Un thème visuel fort crée une identité mémorable. Les Context API (ToastContext, ThemeContext) évitent le prop drilling. Les variables CSS permettent un changement de thème instantané. Les icônes lucide-react remplacent avantageusement les émojis.

---

## Slide 5 — Docker : Conteneurisation

**Texte du slide :**
3 conteneurs (PostgreSQL + Backend Python + Frontend Node), multi-stage build, et volumes persistants.

**Légende :**
Leçon #5 : Docker résout le problème "ça marche sur ma machine". Le multi-stage build réduit la taille des images de production. Les volumes bind-mount sont indispensables en dev. Les chemins de fichiers diffèrent entre local et conteneur — un piège classique !

---

## Slide 6 — Data Science & Machine Learning

**Texte du slide :**
Dataset MovieLens : 9 742 films, 100 836 évaluations, 610 utilisateurs. Pipeline complet de l'importation à l'évaluation.

**Légende :**
Leçon #6 : Le pipeline data science (importation → nettoyage → analyse → modélisation → évaluation) est universel. Joblib serialise le modèle entraîné pour un chargement ultra-rapide en production. La compatibilité des versions entre environnements (local, Docker, prod) est un défi constant — les notebooks Jupyter sont vos meilleurs alliés pour l'exploration.

---

## Hashtags communs (ajouter à chaque slide)

#DataScience #MachineLearning #FastAPI #Python #NextJS #Docker #WebDevelopment #CollaborativeFiltering #DevOps

---

## Conseils de publication LinkedIn

1. **Publier chaque slide séparément** dans un carrousel PDF (6 slides = 6 images)
2. **Premier slide :** accroche visuelle forte (titre + nombre 1)
3. **Dernier slide :** appel à l'action — "Quelle est votre plus grande leçon en data science ? Commentez ! 💬"
4. **Publier le mardi/mercredi matin** pour un meilleur engagement
5. **Taguer** @FastAPI @Python @Docker @NextJS dans le post
