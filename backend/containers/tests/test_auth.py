from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='password123')
        # On suppose que les routes suivront les conventions standards de SimpleJWT
        self.login_url = reverse('token_obtain_pair')
        self.protected_url = reverse('container-list')

    def test_login_success(self):
        """Soumettre des identifiants valides doit retourner un token JWT et un code 200."""
        data = {
            'username': 'admin',
            'password': 'password123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_failure(self):
        """Soumettre des identifiants invalides doit retourner une erreur 401 Unauthorized."""
        data = {
            'username': 'admin',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_access_protected_route_without_token(self):
        """Appeler une route protégée sans token doit retourner une erreur 401."""
        response = self.client.get(self.protected_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_access_protected_route_with_invalid_token(self):
        """Appeler une route protégée avec un token expiré ou malformé doit retourner une erreur 401."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        response = self.client.get(self.protected_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
