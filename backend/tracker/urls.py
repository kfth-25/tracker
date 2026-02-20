from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CallLogViewSet, IntelligenceReportViewSet, TargetDossierViewSet

router = DefaultRouter()
router.register(r'calls', CallLogViewSet)
router.register(r'reports', IntelligenceReportViewSet)
router.register(r'dossiers', TargetDossierViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
