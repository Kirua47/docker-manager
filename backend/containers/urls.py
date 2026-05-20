from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContainerViewSet, ImageViewSet, VolumeViewSet

router = DefaultRouter()
router.register(r'containers', ContainerViewSet, basename='container')
router.register(r'images', ImageViewSet, basename='image')
router.register(r'volumes', VolumeViewSet, basename='volume')

urlpatterns = [
    path('', include(router.urls)),
]
