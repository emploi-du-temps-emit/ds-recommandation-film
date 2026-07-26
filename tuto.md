# Tuto Docker - Demarrage du projet

## 1. Installer Docker Desktop

1. Aller sur : https://docs.docker.com/desktop/setup/install/windows-install/
2. Cliquer sur **"Download for Windows"**
3. Lancer l'installateur (`Docker Desktop Installer.exe`)
4. Cocher **"Use WSL 2 instead of Hyper-V"** (recommande)
5. Cliquer sur **OK** (installation : 2-3 min)
6. **Redemarrer le PC**

---

## 2. Verifier l'installation

Ouvrir un terminal et taper :

```bash
docker --version
docker compose version
```

Resultat attendu :
```
Docker version 27.x.x
Docker Compose version v2.x.x
```

---

## 3. Lancer le projet

```bash
cd D:\DATA-SCIENCE
docker compose up --build
```

**Que fait cette commande ?**
- Telecharge PostgreSQL automatiquement
- Construit le backend FastAPI (Python + dependances)
- Construit le frontend Next.js (Node.js + npm)
- Connecte les 3 services
- Demarre tout !

> 1er lancement : 5-10 min (telechargement)
> Lancements suivants : 30 sec

---

## 4. Importer les donnees dans la BDD

Dans un **nouveau terminal** (laisser Docker tourner) :

```bash
cd D:\DATA-SCIENCE
docker exec -it movie-recommender-api python seed_data.py --clear
```

---

## 5. Tester l'application

Ouvrir ces liens dans le navigateur :

| Lien | Quoi |
|------|------|
| http://localhost:8000 | API - page d'accueil |
| http://localhost:8000/docs | Documentation Swagger (tester les endpoints) |
| http://localhost:8000/health | Verifier que tout est OK |
| http://localhost:3000 | Frontend - application complete |

---

## 6. Tester l'application (frontend)

1. Ouvrir **http://localhost:3000**
2. Cliquer sur **S'inscrire** -> creer un compte
3. Parcourir le catalogue de films
4. Noter **3-4 films** (cliquer sur une etoile)
5. Aller dans **Recommandations** -> le modele IA suggere des films
6. Consulter le **Profil** pour voir ses notes

---

## 7. Tester l'API (avec Swagger)

Ouvrir **http://localhost:8000/docs** et tester :

1. `POST /users` -> creer un compte
2. `POST /login` -> obtenir un token JWT
3. `GET /movies` -> lister les films
4. `GET /movies/search?q=batman` -> rechercher un film
5. `POST /ratings` -> noter un film (coller le token JWT)
6. `GET /recommendations` -> obtenir des recommandations

---

## 8. Commandes Docker utiles

```bash
# Voir les logs en direct
docker compose logs -f

# Arreter les services
docker compose down

# Redemarrer
docker compose restart

# Supprimer la BDD et repartir de zero
docker compose down -v
docker compose up --build

# Voir les conteneurs en cours
docker ps

# Executer une commande dans un conteneur
docker exec -it movie-recommender-api python seed_data.py --clear
```

---

## 9. En cas de probleme

**Port deja utilise (8000 ou 3000 ou 5432)**
```bash
# Trouver le processus qui utilise le port
netstat -ano | findstr :8000
# Tuer le processus (remplacer PID par le numero)
taskkill /PID 1234 /F
```

**Erreur de build**
```bash
# Reconstruire depuis zero
docker compose down
docker compose build --no-cache
docker compose up
```

**La BDD est vide**
```bash
docker exec -it movie-recommender-api python seed_data.py --clear
```

---

## 10. Sans Docker (alternative)

Si Docker ne fonctionne pas, lancer manuellement :

**Terminal 1 - Backend :**
```bash
cd D:\DATA-SCIENCE
set PYTHONIOENCODING=utf-8
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend :**
```bash
cd D:\DATA-SCIENCE\frontend
npm install
npm run dev
```
