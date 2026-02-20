from django.db import models

class CallLog(models.Model):
    phone_number = models.CharField(max_length=50)
    call_time = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    provider = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Added to fix filtering sort error
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.phone_number} - {self.call_time}"

class IntelligenceReport(models.Model):
    SOURCE_CHOICES = [
        ('NETWORK', 'Network Intelligence'),
        ('TECH', 'Tech Stack Detector'),
        ('METADATA', 'Metadata Extractor'),
        ('WHATSAPP', 'WhatsApp Monitor'),
        ('CALL', 'Signal Interceptor'),
    ]
    
    target = models.CharField(max_length=255) # Phone, IP, URL
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    data = models.JSONField() # Store the full result object
    risk_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.source_type} - {self.target}"

# --- NEW: Target Dossier (Portofolio Target) ---
class TargetDossier(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active Monitoring'),
        ('DORMANT', 'Dormant/Inactive'),
        ('HIGH_PRIORITY', 'High Priority Target'),
        ('NEUTRALIZED', 'Neutralized/Safe'),
    ]

    # Identitas Utama
    codename = models.CharField(max_length=100, unique=True) # e.g., "RED_BARON"
    full_name = models.CharField(max_length=200, blank=True, null=True)
    alias = models.CharField(max_length=200, blank=True, null=True)
    
    # Detail Fisik & Personal
    dob = models.DateField(blank=True, null=True) # Date of Birth
    nationality = models.CharField(max_length=100, blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    
    # Kontak
    phone_primary = models.CharField(max_length=50, blank=True, null=True)
    email_primary = models.EmailField(blank=True, null=True)
    
    # Intelligence Data (Untuk Grafik)
    threat_level = models.IntegerField(default=0) # 0-100
    influence_score = models.IntegerField(default=0) # 0-100 (Seberapa berpengaruh)
    technical_skill = models.IntegerField(default=0) # 0-100 (Skill teknis)
    
    # Status & Meta
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    photo_url = models.URLField(blank=True, null=True) # Bisa diisi link gambar placeholder
    notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    last_active = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.codename} ({self.status})"
