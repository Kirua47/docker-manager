from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContainerViewSet, ImageViewSet, VolumeViewSet, SystemStatsView

router = DefaultRouter()
router.register(r'containers', ContainerViewSet, basename='container')
router.register(r'images', ImageViewSet, basename='image')
router.register(r'volumes', VolumeViewSet, basename='volume')

urlpatterns = [
    path('system/stats/', SystemStatsView.as_view(), name='system-stats'),
    path('', include(router.urls)),
]
