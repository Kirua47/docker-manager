from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
import docker

class ImageTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='password123')
        self.client.force_authenticate(user=self.user)
        self.search_url = reverse('image-search')
        self.pull_url = reverse('image-pull')

    @patch('docker.from_env')
    def test_search_docker_hub_images(self, mock_docker):
        """Doit retourner une liste de résultats correspondant au terme de recherche."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        mock_client.images.search.return_value = [
            {'name': 'nginx', 'description': 'Official build of Nginx.'},
            {'name': 'bitnami/nginx', 'description': 'Bitnami nginx Docker Image'}
        ]

        response = self.client.get(self.search_url, {'term': 'nginx'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['name'], 'nginx')

    @patch('docker.from_env')
    def test_pull_image_success(self, mock_docker):
        """Initier le téléchargement d'une image existante doit retourner un statut de succès ou un flux de progression."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        mock_client.images.pull.return_value = MagicMock()

        data = {'image': 'nginx:latest'}
        response = self.client.post(self.pull_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    @patch('docker.from_env')
    def test_pull_image_not_found(self, mock_docker):
        """Tenter de pull une image qui n'existe pas doit retourner une erreur 404."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        mock_client.images.pull.side_effect = docker.errors.ImageNotFound("Image not found")

        data = {'image': 'nonexistent-image:latest'}
        response = self.client.post(self.pull_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
