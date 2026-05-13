from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContainerViewSet, ImageViewSet

router = DefaultRouter()
router.register(r'containers', ContainerViewSet, basename='container')
router.register(r'images', ImageViewSet, basename='image')

urlpatterns = [
    path('', include(router.urls)),
]
