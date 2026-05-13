from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class MonitoringTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='password123')
        self.client.force_authenticate(user=self.user)

    @patch('docker.from_env')
    def test_get_container_logs(self, mock_docker):
        """Doit retourner les logs bruts d'un container spécifique."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        mock_container = MagicMock()
        mock_container.logs.return_value = b"tail -f logs output\nline 2"
        mock_client.containers.get.return_value = mock_container

        url = reverse('container-logs', args=['123456'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(b"tail -f logs output", response.content)

    @patch('docker.from_env')
    def test_get_container_stats(self, mock_docker):
        """Doit retourner les métriques (CPU, RAM) d'un container en cours d'exécution."""
        mock_client = MagicMock()
        mock_docker.return_value = mock_client
        mock_container = MagicMock()
        # Stats usually returns a stream, we simulate a single dictionary for simplicity in unit test
        mock_container.stats.return_value = {'cpu_stats': {}, 'memory_stats': {}}
        mock_client.containers.get.return_value = mock_container

        url = reverse('container-stats', args=['123456'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('cpu_stats', response.data)
