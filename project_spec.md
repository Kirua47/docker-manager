# Spécifications du Projet : Orchestrateur Docker Personnel

Ce document sert de cahier des charges technique complet (Prompt Système). En fournissant ce fichier à une Intelligence Artificielle, elle possèdera tout le contexte nécessaire pour recréer le projet de zéro en respectant l'architecture, les technologies et la méthodologie imposées.

---

## 1. Concept Global
L'objectif est de concevoir et de déployer un orchestrateur Docker personnel hébergé à domicile. Cet outil prend la forme d'une application web légère agissant comme un "Mini VPS" privé. Il permet de piloter l'intégralité du cycle de vie des containers Docker locaux sans utiliser la ligne de commande.

---

## 2. Fonctionnalités Principales Attendues
1. **Gestion du Cycle de Vie** : Interface pour lister tous les containers présents sur le serveur (start, stop, restart, delete en un clic).
2. **Création Dynamique** : Déploiement via un formulaire web pour créer de nouveaux containers (spécification de l'image, mapping de ports, volumes de stockage).
3. **Monitoring en Temps Réel** : Tableau de bord indiquant l'état de santé (actif/arrêté) via des indicateurs colorés et statistiques (CPU/RAM).
4. **Accès aux Logs** : Console intégrée à la page web pour visualiser le flux de données (logs) de chaque container en direct.
5. **Gestion des Images** : Capacité de rechercher et de télécharger (pull) des images directement depuis le Docker Hub via l'interface.

---

## 3. Architecture Technique

Le projet repose sur une séparation stricte entre le moteur de contrôle (Backend) et l'interface utilisateur (Frontend).

### 3.1. Le Cœur (Backend)
- **Framework** : Python avec **Django** et **Django REST Framework (DRF)**.
- **Rôle** : Exposer une API REST qui communique directement avec le Docker Daemon de l'hôte via le socket Unix (`/var/run/docker.sock`).
- **Librairie** : Utilisation du SDK officiel Python pour Docker (`docker`).
- **Sécurité** : 
  - API protégée par une authentification via Tokens JWT (utilisation de `djangorestframework-simplejwt`).
  - L'accès est strictement limité au propriétaire.

### 3.2. L'Interface (Frontend)
- **Framework** : React (initialisé de préférence via Vite).
- **Styling** : Tailwind CSS (Vanillla CSS autorisé pour des effets spécifiques).
- **Design UI/UX** : 
  - Esthétique riche, moderne, "premium" (Glassmorphism, dark mode soigné).
  - Micro-animations, transitions fluides, et aucune couleur générique basique.
  - Expérience utilisateur dynamique (statuts en temps réel).

### 3.3. L'Infrastructure
- L'ensemble du projet (Backend + Frontend) est encapsulé dans des containers Docker (via un `docker-compose.yml`), ce qui lui permet de se surveiller lui-même et de s'auto-déployer sur n'importe quel VPS.

---

## 4. Méthodologie : Test-Driven Development (TDD)
L'intégralité du développement doit se faire selon l'approche TDD. Aucun code de production ne doit être écrit sans qu'un test n'ait été écrit au préalable pour valider son comportement.

### 4.1. Cycle TDD Imposé
1. **Red** : Écrire un test unitaire décrivant le comportement (il échoue).
2. **Green** : Écrire le code minimal (Django/React) pour faire passer le test.
3. **Refactor** : Optimiser le code tout en gardant le test au vert.

### 4.2. Plan de Tests (Résumé)
#### Backend (Pytest-django / APITestCase)
- Les appels au socket Docker **doivent être mockés** lors des tests.
- **Auth** : Login valid (200 + JWT), Login invalid (401), Route protégée sans token (401).
- **Containers** : List (200), Start/Stop/Restart (200), Delete (204), Action sur ID inexistant (404).
- **Création** : Payload valide (201), Payload invalide (422), Conflit de ports (409).
- **Images** : Search, Pull (Mock des appels Docker Hub).

#### Frontend (Jest / React Testing Library)
- Les appels API vers le Backend **doivent être mockés**.
- **Auth** : Affichage formulaire, soumission ok (redirection + stockage token), soumission ko (message erreur).
- **Tableau de bord** : Liste des containers avec pastilles de statut de couleur.
- **Interactions** : Clics sur les boutons (Start, Stop, Delete avec confirmation).
- **Formulaire de création** : Validation des champs obligatoires, envoi du bon JSON.
- **Logs** : Ouverture modale, affichage correct des flux textes.

---

## 5. Instruction pour l'IA (Si donnée à une IA)
Si une IA lit ce document pour la première fois, elle doit :
1. Analyser l'arborescence actuelle du projet.
2. Comprendre qu'elle doit mettre en place le backend (Django) et le frontend (React).
3. Ne **jamais** implémenter une vue Django ou un composant React sans avoir d'abord écrit le test correspondant (TDD).
4. S'assurer que le design de l'application React est visuellement impressionnant ("Wow effect").
