# Plan d'Implémentation - Backend Django & Premier Cycle TDD

Ce document détaille la démarche pour l'initialisation du backend avec Django et la mise en place de notre première fonctionnalité (Lister les containers) en respectant la méthode TDD.

## Objectif

1. Configurer l'environnement Django existant avec les bons outils pour créer une API REST (Django REST Framework).
2. Mettre en place l'authentification par Token JWT.
3. Créer notre première application Django (`containers`) et appliquer la méthode TDD pour la fonctionnalité "Lister les containers".

## Open Questions

> [!WARNING]
> **Version Python & Docker SDK** : Es-tu sur une version spécifique de Python que je dois prendre en compte ? Par défaut, j'utiliserai la librairie `docker` (le SDK officiel Python pour Docker) pour interagir avec le socket. Est-ce que cela te convient ?

## Proposed Changes

Nous allons d'abord configurer le projet principal, puis créer une application dédiée aux containers.

### Configuration du Projet (Backend)
- **Dépendances** : Installation de `djangorestframework`, `djangorestframework-simplejwt`, `pytest-django`, et `docker`.
- **Settings** : Ajout de DRF et SimpleJWT dans `INSTALLED_APPS`, configuration des classes d'authentification par défaut.

#### [MODIFY] `backend/core/settings.py`
- Ajout de `rest_framework` et `rest_framework_simplejwt`.
- Configuration des règles d'authentification JWT.

#### [MODIFY] `backend/core/urls.py`
- Ajout des routes pour obtenir (`TokenObtainPairView`) et rafraîchir (`TokenRefreshView`) les tokens JWT.

---

### Application `containers`

Création d'une nouvelle application Django nommée `containers`.

#### [NEW] `backend/containers/tests/test_list_containers.py`
- **Phase RED (TDD)** : Création du test unitaire qui simule une requête GET sur `/api/containers/`. Le test vérifiera qu'on obtient bien un code 200 et une liste d'objets (avec `id`, `name`, `status`).

#### [NEW] `backend/containers/views.py`
- **Phase GREEN (TDD)** : Implémentation de la vue (View/ViewSet) qui utilise le SDK `docker` pour se connecter au daemon local et lister les containers.

#### [NEW] `backend/containers/urls.py`
- Enregistrement de la route `/api/containers/`.

## Verification Plan

### Automated Tests
1. Exécuter `pytest` (qui va détecter la configuration Django via un `pytest.ini`).
2. Le test de listing de containers devra d'abord échouer (route inexistante).
3. Après implémentation, le test passera au vert en utilisant un mock du SDK Docker.

### Manual Verification
1. Lancer le serveur de développement Django (`python manage.py runserver`).
2. Appeler l'API `/api/token/` via un outil comme curl, Postman ou l'interface de test à venir, pour vérifier que le JWT est bien délivré.
3. Appeler l'API `/api/containers/` avec le Token pour voir les vrais containers de la machine.
