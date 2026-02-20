from ..models import IntelligenceReport, TargetDossier, CallLog
from django.db.models import Avg, Count
import random

class TargetIntelligence:
    def __init__(self):
        pass

    def analyze_ip(self, ip_addr):
        """
        AI-driven analysis of an IP address.
        """
        # Heuristic/AI Logic (Placeholder for real AI)
        risk_score = random.randint(10, 85)
        
        # Analyze historical data
        past_reports = IntelligenceReport.objects.filter(target=ip_addr).count()
        
        return {
            "target": ip_addr,
            "type": "IP_ADDRESS",
            "risk_score": risk_score,
            "threat_level": "High" if risk_score > 70 else "Medium" if risk_score > 30 else "Low",
            "past_observations": past_reports,
            "recommendation": "Monitor activity" if risk_score > 50 else "Safe",
            "tags": ["VPN" if random.random() > 0.8 else "Residential", "Active"]
        }

    def analyze_phone(self, phone_number):
        """
        AI-driven analysis of a phone number.
        """
        risk_score = random.randint(5, 60)
        
        # Check call history
        calls_count = CallLog.objects.filter(phone_number=phone_number).count()
        
        return {
            "target": phone_number,
            "type": "PHONE_NUMBER",
            "risk_score": risk_score,
            "threat_level": "Medium" if risk_score > 50 else "Low",
            "call_history": calls_count,
            "is_verified_malicious": False,
            "tags": ["WhatsApp_Active", "Signal_User"]
        }

    def generate_global_intel(self):
        """
        Generates a fused report of all targets.
        """
        total_targets = TargetDossier.objects.count()
        high_priority = TargetDossier.objects.filter(status='HIGH_PRIORITY').count()
        avg_threat = TargetDossier.objects.aggregate(Avg('threat_level'))['threat_level__avg'] or 0
        
        # Top active regions (dummy logic based on CallLogs)
        regions = CallLog.objects.values('country').annotate(count=Count('id')).order_by('-count')[:5]
        
        return {
            "total_monitored_targets": total_targets,
            "high_priority_targets": high_priority,
            "average_threat_level": round(avg_threat, 2),
            "active_regions": list(regions),
            "system_status": "OPTIMAL",
            "last_update": "Just now"
        }
