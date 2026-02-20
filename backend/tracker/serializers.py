from rest_framework import serializers
from .models import CallLog, IntelligenceReport, TargetDossier

class CallLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallLog
        fields = '__all__'
        extra_kwargs = {
            'ip_address': {'required': False, 'allow_null': True}
        }

class IntelligenceReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntelligenceReport
        fields = '__all__'

class TargetDossierSerializer(serializers.ModelSerializer):
    class Meta:
        model = TargetDossier
        fields = '__all__'
