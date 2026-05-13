# Plan de Tests Unitaires TDD - Orchestrateur Docker

Ce document recense l'ensemble des tests unitaires à implémenter pour le projet d'orchestrateur Docker personnel. Dans le cadre d'une approche TDD (Test-Driven Development), ces tests devront être écrits *avant* l'implémentation des fonctionnalités correspondantes.

## 1. Backend (FastAPI + Pytest)

Les tests backend simuleront (mock) les interactions avec le socket Unix `/var/run/docker.sock` pour ne pas impacter le système hôte lors de l'exécution des tests.

### 1.1. Authentification (JWT)
- `test_login_success` : Soumettre des identifiants valides doit retourner un token JWT et un code 200.
- `test_login_failure` : Soumettre des identifiants invalides doit retourner une erreur 401 Unauthorized.
- `test_access_protected_route_without_token` : Appeler une route protégée sans token doit retourner une erreur 401.
- `test_access_protected_route_with_invalid_token` : Appeler une route protégée avec un token expiré ou malformé doit retourner une erreur 401.

### 1.2. Gestion du Cycle de Vie des Containers
- `test_list_containers` : Doit retourner une liste formatée des containers (id, nom, image, statut) avec un code 200.
- `test_start_container_success` : Démarrer un container existant et arrêté doit retourner un succès (code 200).
- `test_stop_container_success` : Arrêter un container en cours d'exécution doit retourner un succès (code 200).
- `test_restart_container_success` : Redémarrer un container doit retourner un succès (code 200).
- `test_delete_container_success` : Supprimer un container doit retourner un code 204 (No Content).
- `test_container_action_not_found` : Tenter une action (start/stop/delete) sur un ID de container inexistant doit retourner une erreur 404.

### 1.3. Création Dynamique de Containers
- `test_create_container_success` : L'envoi d'un payload valide (image, ports, volumes) doit déclencher la création et retourner l'ID du container (code 201).
- `test_create_container_invalid_payload` : L'envoi de données incomplètes (ex: nom d'image manquant) doit retourner une erreur de validation 422 (Unprocessable Entity).
- `test_create_container_port_conflict` : Tenter de mapper un port déjà utilisé doit retourner une erreur 409 (Conflict).

### 1.4. Monitoring et Logs
- `test_get_container_logs` : Doit retourner les logs bruts d'un container spécifique.
- `test_get_container_stats` : Doit retourner les métriques (CPU, RAM) d'un container en cours d'exécution.

### 1.5. Gestion des Images
- `test_search_docker_hub_images` : Doit retourner une liste de résultats correspondant au terme de recherche.
- `test_pull_image_success` : Initier le téléchargement d'une image existante doit retourner un statut de succès ou un flux de progression.
- `test_pull_image_not_found` : Tenter de pull une image qui n'existe pas doit retourner une erreur 404.

---

## 2. Frontend (React + Tailwind CSS + Jest/React Testing Library)

Les tests frontend vérifieront le rendu des composants et les interactions utilisateur, en simulant (mock) les appels API vers le backend.

### 2.1. Authentification
- `test_render_login_form` : Le formulaire de connexion (email, mot de passe, bouton) s'affiche correctement.
- `test_login_submission_success` : Une soumission réussie stocke le token JWT et redirige vers le tableau de bord.
- `test_login_submission_failure` : Une soumission échouée affiche un message d'erreur à l'utilisateur sans rediriger.

### 2.2. Tableau de Bord (Dashboard)
- `test_render_container_list` : La liste des containers récupérés depuis l'API s'affiche correctement sous forme de tableau ou de cartes.
- `test_container_status_indicators` : Les indicateurs visuels correspondent au statut (pastille verte pour actif, rouge pour arrêté).
- `test_dashboard_empty_state` : Un message pertinent s'affiche si aucun container n'est présent.

### 2.3. Actions sur les Containers
- `test_click_start_button` : Cliquer sur "Démarrer" appelle l'API correspondante et met à jour le statut du container à l'écran.
- `test_click_stop_button` : Cliquer sur "Arrêter" appelle l'API correspondante et met à jour le statut.
- `test_click_delete_button_shows_confirmation` : Cliquer sur "Supprimer" ouvre une modale de confirmation avant d'appeler l'API.

### 2.4. Formulaire de Création
- `test_render_creation_form` : Le formulaire de déploiement (image, ports, volumes) s'affiche avec tous ses champs.
- `test_creation_form_validation` : Le formulaire affiche des erreurs si les champs obligatoires sont vides avant la soumission.
- `test_creation_form_submission` : Une soumission valide appelle l'API avec le bon payload (JSON formaté correctement) et affiche un message de succès.

### 2.5. Accès aux Logs
- `test_open_logs_modal` : Cliquer sur le bouton "Logs" d'un container ouvre une modale ou une vue console.
- `test_render_logs_content` : Les lignes de logs reçues de l'API s'affichent correctement dans l'interface.

### 2.6. Gestion des Images
- `test_image_search_input` : Taper dans la barre de recherche déclenche un appel API et affiche les résultats.
- `test_click_pull_image_button` : Cliquer sur "Télécharger" sur un résultat de recherche appelle l'API et affiche un indicateur de chargement.

---

## 3. Workflow TDD Recommandé

Pour chaque fonctionnalité (ex: Lister les containers) :
1. **Red** : Écrire le test unitaire (Backend ou Frontend) qui décrit le comportement attendu. Lancer le test, il doit échouer.
2. **Green** : Écrire le code minimal nécessaire (FastAPI ou React) pour faire passer le test.
3. **Refactor** : Nettoyer le code, optimiser (gestion d'erreurs, typage avec Pydantic/TypeScript, styles Tailwind) tout en s'assurant que le test reste vert.
