from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
import docker

class ContainerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='password123')
        self.client.force_authenticate(user=self.user)
        self.list_url = reverse('container-list')

    @patch('docker.from_env')
    def test_list_containers(self, mock_docker):
        """Doit retourner une liste formatée des containers (id, nom, image, statut) avec un code 200."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        
        mock_container = MagicMock()
        mock_container.id = '123456'
        mock_container.name = 'test_container'
        mock_container.image.tags = ['nginx:latest']
        mock_container.status = 'running'
        mock_client.containers.list.return_value = [mock_container]

        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], '123456')
        self.assertEqual(response.data[0]['name'], 'test_container')

    @patch('docker.from_env')
    def test_start_container_success(self, mock_docker):
        """Démarrer un container existant et arrêté doit retourner un succès (code 200)."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        url = reverse('container-start', args=['123456'])
        
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('docker.from_env')
    def test_stop_container_success(self, mock_docker):
        """Arrêter un container en cours d'exécution doit retourner un succès (code 200)."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        url = reverse('container-stop', args=['123456'])
        
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('docker.from_env')
    def test_restart_container_success(self, mock_docker):
        """Redémarrer un container doit retourner un succès (code 200)."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        url = reverse('container-restart', args=['123456'])
        
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('docker.from_env')
    def test_delete_container_success(self, mock_docker):
        """Supprimer un container doit retourner un code 204 (No Content)."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        url = reverse('container-detail', args=['123456'])
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    @patch('docker.from_env')
    def test_container_action_not_found(self, mock_docker):
        """Tenter une action (start/stop/delete) sur un ID de container inexistant doit retourner une erreur 404."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        mock_client.containers.get.side_effect = docker.errors.NotFound("Not Found")
        
        url = reverse('container-start', args=['nonexistent'])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch('docker.from_env')
    def test_create_container_success(self, mock_docker):
        """L'envoi d'un payload valide (image, ports, volumes) doit déclencher la création et retourner l'ID du container (code 201)."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        mock_container = MagicMock()
        mock_container.id = 'new_id_789'
        mock_client.containers.run.return_value = mock_container

        data = {
            'image': 'nginx',
            'ports': {'80/tcp': 8080},
            'volumes': {'/my/path': {'bind': '/app', 'mode': 'rw'}}
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['id'], 'new_id_789')

    def test_create_container_invalid_payload(self):
        """L'envoi de données incomplètes (ex: nom d'image manquant) doit retourner une erreur de validation 422 (Unprocessable Entity)."""
        data = {'ports': {'80/tcp': 8080}}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

    @patch('docker.from_env')
    def test_create_container_port_conflict(self, mock_docker):
        """Tenter de mapper un port déjà utilisé doit retourner une erreur 409 (Conflict)."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        mock_client.containers.run.side_effect = docker.errors.APIError("port is already allocated")
        
        data = {
            'image': 'nginx',
            'ports': {'80/tcp': 80}
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
