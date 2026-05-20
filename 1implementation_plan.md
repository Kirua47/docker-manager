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

---

## Mises à jour et Corrections (UI & Volumes)

Afin de garantir que l'application fonctionne parfaitement et gère la création de containers avec des ports et des volumes, les ajouts suivants ont été implémentés :

### 1. Correction de la création de Container (Ports & Volumes)
Le formulaire de création de container ne prenait pas en compte les ports et les volumes.
- **Frontend (`CreateContainerModal.tsx`)** : Ajout de hooks `useState` pour `hostPort`, `containerPort`, `hostVolume` et `containerVolume`. Formatage du payload dans `handleSubmit` pour inclure `ports` (ex: `{"80/tcp": 8080}`) et `volumes` (ex: `{"my_vol": {"bind": "/data", "mode": "rw"}}`).
- **Frontend (`api.ts` & `ContainersPage.tsx`)** : Mise à jour des signatures de la fonction `create` pour accepter les propriétés `ports` et `volumes` et les envoyer au backend.

### 2. Gestion des Volumes Docker (Nouvelle Fonctionnalité)
Création d'une fonctionnalité complète pour lister, créer et supprimer des volumes Docker, et les lier au formulaire de création de containers.

**Backend :**
- **`serializers.py`** : Création de `VolumeSerializer` (name, driver, mountpoint) et `VolumeCreateSerializer` (name).
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

---

## Mises à jour et Corrections (UI & Volumes)

Afin de garantir que l'application fonctionne parfaitement et gère la création de containers avec des ports et des volumes, les ajouts suivants ont été implémentés :

### 1. Correction de la création de Container (Ports & Volumes)
Le formulaire de création de container ne prenait pas en compte les ports et les volumes.
- **Frontend (`CreateContainerModal.tsx`)** : Ajout de hooks `useState` pour `hostPort`, `containerPort`, `hostVolume` et `containerVolume`. Formatage du payload dans `handleSubmit` pour inclure `ports` (ex: `{"80/tcp": 8080}`) et `volumes` (ex: `{"my_vol": {"bind": "/data", "mode": "rw"}}`).
- **Frontend (`api.ts` & `ContainersPage.tsx`)** : Mise à jour des signatures de la fonction `create` pour accepter les propriétés `ports` et `volumes` et les envoyer au backend.

### 2. Gestion des Volumes Docker (Nouvelle Fonctionnalité)
Création d'une fonctionnalité complète pour lister, créer et supprimer des volumes Docker, et les lier au formulaire de création de containers.

**Backend :**
- **`serializers.py`** : Création de `VolumeSerializer` (name, driver, mountpoint) et `VolumeCreateSerializer` (name).
- **`views.py`** : Création de `VolumeViewSet` avec les actions `list`, `create`, et `destroy` s'appuyant sur l'API Docker (`client.volumes.list()`, `client.volumes.create(name)`, `volume.remove()`).
- **`urls.py`** : Enregistrement de la route `/api/volumes/` via le routeur.

**Frontend :**
- **`api.ts`** : Ajout de l'objet `volumeService` avec les méthodes `list()`, `create(name)`, et `delete(id)`.
- **Nouvelle Page (`volumes/page.tsx`)** : Création d'une page listant tous les volumes avec leurs détails (driver, mountpoint), incluant un bouton pour créer un nouveau volume et une icône pour les supprimer.
- **`Sidebar.tsx`** : Ajout du lien de navigation vers `/volumes` utilisant l'icône `HardDrive` de lucide-react.
- **`CreateContainerModal.tsx` (Amélioration)** : Utilisation d'un `useEffect` pour charger la liste des volumes disponibles à l'ouverture de la modale. L'input texte pour `hostVolume` a été remplacé par un `<select>` déroulant, empêchant l'utilisateur de saisir un nom de volume invalide et facilitant la liaison d'un volume au nouveau container.

### 3. Gestion Dynamique des Images
La page des images affichait initialement des fausses données (mock). Elle a été modifiée pour récupérer les vraies images locales depuis le backend et afficher des détails précis.
- **Frontend (`app/images/page.tsx`)** :
  - **Récupération des données** : Utilisation de `imageService.list()` via un `useEffect` pour interroger le backend `/api/images/`.
  - **Formatage des informations** :
    - *Nom & Tag* : Extraction depuis le champ `tags` de l'image (ex: `nginx:latest` devient Nom:`nginx` et Tag:`latest`).
    - *ID Court* : Nettoyage de l'identifiant complet `sha256:...` pour ne garder que les 12 premiers caractères.
    - *Date de création* : Conversion de la date ISO renvoyée par Docker en date lisible (format local).
    - *Taille* : Conversion de la taille en octets vers un format lisible (Ko, Mo, Go).
  - **Interface Utilisateur** : Affichage d'un loader pendant la récupération des données et ajout des nouveaux détails (ID, Date, Taille convertie) dans les cartes de la liste des images locales.
  - **Correction du Téléchargement (Pull)** : Ajout de la fonction `handlePull` attachée au bouton "Pull Image". Cette fonction récupère la valeur saisie dans la barre de recherche, invoque `imageService.pull()` pour demander au backend de télécharger l'image depuis Docker Hub, affiche un spinner de chargement pendant l'opération, puis rafraîchit automatiquement la liste des images locales une fois terminé.

### 4. Amélioration de la Gestion de l'Expiration de Session (401 Unauthorized)
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

---

## Mises à jour et Corrections (UI & Volumes)

Afin de garantir que l'application fonctionne parfaitement et gère la création de containers avec des ports et des volumes, les ajouts suivants ont été implémentés :

### 1. Correction de la création de Container (Ports & Volumes)
Le formulaire de création de container ne prenait pas en compte les ports et les volumes.
- **Frontend (`CreateContainerModal.tsx`)** : Ajout de hooks `useState` pour `hostPort`, `containerPort`, `hostVolume` et `containerVolume`. Formatage du payload dans `handleSubmit` pour inclure `ports` (ex: `{"80/tcp": 8080}`) et `volumes` (ex: `{"my_vol": {"bind": "/data", "mode": "rw"}}`).
- **Frontend (`api.ts` & `ContainersPage.tsx`)** : Mise à jour des signatures de la fonction `create` pour accepter les propriétés `ports` et `volumes` et les envoyer au backend.

### 2. Gestion des Volumes Docker (Nouvelle Fonctionnalité)
Création d'une fonctionnalité complète pour lister, créer et supprimer des volumes Docker, et les lier au formulaire de création de containers.

**Backend :**
- **`serializers.py`** : Création de `VolumeSerializer` (name, driver, mountpoint) et `VolumeCreateSerializer` (name).
- **`views.py`** : Création de `VolumeViewSet` avec les actions `list`, `create`, et `destroy` s'appuyant sur l'API Docker (`client.volumes.list()`, `client.volumes.create(name)`, `volume.remove()`).
- **`urls.py`** : Enregistrement de la route `/api/volumes/` via le routeur.

**Frontend :**
- **`api.ts`** : Ajout de l'objet `volumeService` avec les méthodes `list()`, `create(name)`, et `delete(id)`.
- **Nouvelle Page (`volumes/page.tsx`)** : Création d'une page listant tous les volumes avec leurs détails (driver, mountpoint), incluant un bouton pour créer un nouveau volume et une icône pour les supprimer.
- **`Sidebar.tsx`** : Ajout du lien de navigation vers `/volumes` utilisant l'icône `HardDrive` de lucide-react.
- **`CreateContainerModal.tsx` (Amélioration)** : Utilisation d'un `useEffect` pour charger la liste des volumes disponibles à l'ouverture de la modale. L'input texte pour `hostVolume` a été remplacé par un `<select>` déroulant, empêchant l'utilisateur de saisir un nom de volume invalide et facilitant la liaison d'un volume au nouveau container.

### 3. Gestion Dynamique des Images
La page des images affichait initialement des fausses données (mock). Elle a été modifiée pour récupérer les vraies images locales depuis le backend et afficher des détails précis.
- **Frontend (`app/images/page.tsx`)** :
  - **Récupération des données** : Utilisation de `imageService.list()` via un `useEffect` pour interroger le backend `/api/images/`.
  - **Formatage des informations** :
    - *Nom & Tag* : Extraction depuis le champ `tags` de l'image (ex: `nginx:latest` devient Nom:`nginx` et Tag:`latest`).
    - *ID Court* : Nettoyage de l'identifiant complet `sha256:...` pour ne garder que les 12 premiers caractères.
    - *Date de création* : Conversion de la date ISO renvoyée par Docker en date lisible (format local).
    - *Taille* : Conversion de la taille en octets vers un format lisible (Ko, Mo, Go).
  - **Interface Utilisateur** : Affichage d'un loader pendant la récupération des données et ajout des nouveaux détails (ID, Date, Taille convertie) dans les cartes de la liste des images locales.
  - **Correction du Téléchargement (Pull)** : Ajout de la fonction `handlePull` attachée au bouton "Pull Image". Cette fonction récupère la valeur saisie dans la barre de recherche, invoque `imageService.pull()` pour demander au backend de télécharger l'image depuis Docker Hub, affiche un spinner de chargement pendant l'opération, puis rafraîchit automatiquement la liste des images locales une fois terminé.

### 4. Amélioration de la Gestion de l'Expiration de Session (401 Unauthorized)
Lorsque le token d'authentification est manquant ou expiré, l'application tente de rediriger l'utilisateur vers la page de connexion (`/login`). Cependant, un bug subsistait : avant que le navigateur n'ait eu le temps de s'exécuter, une erreur ("Failed to fetch containers") était levée et interceptée par Next.js, affichant un écran d'erreur bloquant.
- **Frontend (`api.ts`)** : Modification de la fonction `apiFetch`. Désormais, si la réponse de l'API est un statut `401`, la fonction initie la redirection `window.location.href` puis retourne une Promise qui ne se résout jamais (`return new Promise(() => {})`). Cela fige l'exécution de l'appel asynchrone, empêchant le code en aval de jeter des erreurs intempestives et garantissant une transition fluide vers la page de login.

### 5. Fonctionnalité de Déconnexion (Logout)
- **Frontend (`Sidebar.tsx`)** : Ajout du module `useRouter` depuis `next/navigation`. La fonction `handleLogout` a été créée pour vider le token du `localStorage` et rediriger l'utilisateur vers `/login` via `router.push('/login')`. Cette fonction a été rattachée à l'événement `onClick` du bouton Logout du menu latéral.

### 6. Correction de l'Affichage des Logs des Containers
L'affichage des logs des containers posait problème car la requête frontend restait bloquée indéfiniment en attente, et la page des logs utilisait des données factices.
- **Backend (`containers/views.py`)** : L'action `@action(detail=True, methods=['get']) def logs(self, request, pk=None)` utilisait `container.logs(stream=True, follow=True)` et renvoyait une `StreamingHttpResponse`. Le fait de suivre le flux empêchait la requête de se terminer. Ceci a été modifié pour récupérer statiquement les 500 dernières lignes (`tail=500`) sans mode "stream". L'API renvoie désormais directement un `HttpResponse` avec le texte pur (`text/plain`), ce qui permet au frontend de recevoir la réponse instantanément et d'afficher les logs réels du container dans la modale.
- **Frontend (`LogsModal.tsx`)** : Un plantage (TypeError: Cannot read properties of undefined (reading 'split')) se produisait car la propriété `logs` n'était pas passée par la page des logs virtuels. J'ai rendu la propriété `logs` optionnelle (`logs?: string`) et ajouté une valeur par défaut (`logs = ""`) pour éviter l'erreur.
- **Frontend (`app/logs/page.tsx`)** : Les fausses données `MOCK_CONTAINERS` ont été totalement supprimées. La page utilise désormais `containerService.list()` via un `useEffect` pour récupérer les vrais containers actifs/inactifs, et gère un état de chargement avec un spinner. Au clic sur un container, `containerService.getLogs(id)` est appelé pour alimenter la modale avec le vrai flux de logs. Un champ de recherche fonctionnel permet aussi de filtrer ces containers.

### 5. Refonte Complète de l'Interface Utilisateur (UI Overhaul)
L'intégralité du design Frontend a été refaite pour correspondre aux maquettes générées par Stitch AI (Google Material Design).
- **Thème CSS Global** : Mise à jour de `frontend/src/app/globals.css` avec les variables Tailwind v4 (`@theme inline`) incluant le nouveau système de couleurs (Primary, Surface Container, Tertiary, etc.), les espacements personnalisés (`--spacing-sidebar_width`), et les polices (Inter, JetBrains Mono).
- **Icons & Fonts (CDN)** : Mise à jour de `layout.tsx` pour charger Google Fonts (Inter, JetBrains Mono) et Material Symbols Outlined directement depuis les CDN.
- **Layout & Navigation** :
  - Création de `components/layout/Header.tsx` (TopAppBar) intégrant un champ de recherche, des icônes d'actions et l'avatar utilisateur.
  - Réécriture de `components/layout/Sidebar.tsx` (SideNavBar) avec les nouveaux liens et indicateurs visuels du menu actif (utilisation de `usePathname`).
  - Le `RootLayout` gère désormais la grille principale (Sidebar à gauche fixe, Header en haut, Main au centre).
- **Dashboard (`app/dashboard/page.tsx`)** : Reconstruction avec des cartes de statistiques (Containers actifs, CPU, Images) et un tableau intégré des "Récents Containers".
- **Containers (`app/containers/page.tsx`)** : Remplacement des cartes individuelles par une vue liste/tableau (Data Table) détaillée affichant les ID courts, images, statuts (pastilles colorées), et ports. Actions (Start, Stop, Delete, Logs) en fin de ligne.
- **Images (`app/images/page.tsx`)** : Nouvelle disposition en tableau avec une carte distincte (Widget Bento) en haut pour le "Pull Remote Image" qui simplifie le téléchargement d'images.
- **Volumes (`app/volumes/page.tsx`)** : Transition vers un tableau. L'interface de création d'un volume n'est plus une modale mais un formulaire en accordéon (inline form) s'affichant au clic.
- **Unified Logs (`app/logs/page.tsx`)** : Création d'une vraie page pleine au lieu d'une modale. Sélection d'un container via `<select>` pour "streamer" les logs dans un terminal simulé (`bg-[#1A1C1E]`).
- **Create Container (`app/containers/create/page.tsx`)** : Conversion de l'ancienne modale de déploiement en une page dédiée (full page route). Formulaire structuré en 3 sections (General, Port Mapping, Volumes) avec redirection propre (`useRouter`) vers la liste après création. Suppression de `CreateContainerModal.tsx`.
