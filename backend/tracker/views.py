from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CallLog, IntelligenceReport, TargetDossier
from .serializers import CallLogSerializer, IntelligenceReportSerializer, TargetDossierSerializer
from .core.network_forensics import NetworkForensics
from .services.metadata_utils import get_metadata
from .services.network_utils import get_ip_info
from .services.tech_utils import detect_tech
from .services.intelligence_utils import TargetIntelligence
from .services.osint_utils import check_username
import os
import uuid
from django.conf import settings
# GANTI BOT: Pakai Desktop Bot
from .bots.desktop_bot import WhatsAppDesktopBot 
import threading
import time
import requests
import phonenumbers
from phonenumbers import geocoder, carrier

class IntelligenceReportViewSet(viewsets.ModelViewSet):
    queryset = IntelligenceReport.objects.all().order_by('-created_at')
    serializer_class = IntelligenceReportSerializer

class TargetDossierViewSet(viewsets.ModelViewSet):
    queryset = TargetDossier.objects.all().order_by('-created_at')
    serializer_class = TargetDossierSerializer

class CallLogViewSet(viewsets.ModelViewSet):
    queryset = CallLog.objects.all().order_by('-call_time')
    serializer_class = CallLogSerializer

    @action(detail=False, methods=['post'])
    def metadata_scan(self, request):
        """
        Endpoint untuk analisis metadata gambar (ExifTool).
        """
        uploaded_file = request.FILES.get('image')
        if not uploaded_file:
            return Response({"error": "No image provided"}, status=400)

        # 1. Simpan file sementara
        temp_dir = os.path.join(settings.BASE_DIR, 'temp_uploads')
        os.makedirs(temp_dir, exist_ok=True)
        
        ext = os.path.splitext(uploaded_file.name)[1]
        temp_filename = f"{uuid.uuid4()}{ext}"
        temp_path = os.path.join(temp_dir, temp_filename)
        
        try:
            with open(temp_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)
            
            metadata = get_metadata(temp_path)
            
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
            return Response({
                "status": "success",
                "filename": uploaded_file.name,
                "metadata": metadata
            })

        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['post'])
    def network_scan(self, request):
        """
        Endpoint for IP/Domain Intelligence (Whois, GeoIP, DNS)
        """
        target = request.data.get('target')
        if not target:
            return Response({"error": "Target (IP or Domain) is required"}, status=400)
            
        try:
            # Clean target (remove http/https/www if pasted)
            target = target.replace('https://', '').replace('http://', '').split('/')[0]
            
            data = get_ip_info(target)
            return Response({
                "status": "success",
                "data": data
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['post'])
    def tech_scan(self, request):
        """
        Endpoint for Website Tech Detection (Passive).
        """
        target = request.data.get('target')
        if not target:
            return Response({"error": "Target URL is required"}, status=400)
            
        result = detect_tech(target)
        return Response(result)

    @action(detail=False, methods=['post'])
    def osint_scan(self, request):
        """
        Endpoint for Digital Footprint / Username Search (OSINT).
        """
        username = request.data.get('username')
        if not username:
            return Response({"error": "Username is required"}, status=400)
            
        result = check_username(username)
        return Response(result)

    @action(detail=False, methods=['post'])
    def forensic_scan(self, request):
        """
        Endpoint khusus untuk memicu Network Forensics + WA Desktop Bot
        """
        phone_target = request.data.get('phone_number')
        excluded_ip = request.data.get('excluded_ip')
        
        if not phone_target:
            return Response({"error": "Phone number required"}, status=400)

        # 1. Siapkan Scanner
        scanner = NetworkForensics()
        scan_results = {}

        def run_sniffer():
            print(">>> Sniffer Thread Started")
            scan_results['data'] = scanner.start_scan(duration=20, manual_excluded_ip=excluded_ip)
            print(">>> Sniffer Thread Finished")

        # 2. Jalankan Sniffer dalam thread terpisah
        sniffer_thread = threading.Thread(target=run_sniffer)
        sniffer_thread.start()

        # 3. Jalankan Desktop Bot (Non-blocking agar sniffer tetap jalan)
        # Berikan jeda 1 detik agar sniffer benar-benar siap
        time.sleep(1) 
        def run_bot():
            try:
                print(">>> Starting WhatsApp Desktop Bot...")
                bot = WhatsAppDesktopBot()
                # Bot Desktop tidak perlu login manual di kode, karena dia pakai App yang sudah login di Windows
                bot.call(phone_target)
                print(">>> Bot Action Sequence Completed")
            except Exception as e:
                print(f">>> BOT ERROR: {str(e)}")

        bot_thread = threading.Thread(target=run_bot)
        bot_thread.start()

        # 4. Tunggu Sniffer Selesai
        sniffer_thread.join()
        
        # 5. Proses Hasil
        result = scan_results.get('data')
        scan_data = result if result else {"status": "failed", "detected_ip": None}

        # Helper to fetch GeoIP
        def fetch_geo(ip_addr):
            try:
                geo_res = requests.get(f'http://ip-api.com/json/{ip_addr}', timeout=5)
                if geo_res.status_code == 200:
                    geo = geo_res.json()
                    return {
                        'country': geo.get('country'),
                        'city': geo.get('city'),
                        'isp': geo.get('isp'),
                        'lat': geo.get('lat'),
                        'lon': geo.get('lon')
                    }
            except:
                return None
            return None

        # Enrich Main Detected IP
        if scan_data.get('detected_ip'):
            scan_data['location'] = fetch_geo(scan_data['detected_ip'])

        # Enrich Top 3 Candidates
        if scan_data.get('candidates'):
            # Ambil top 3 saja
            top_candidates = scan_data['candidates'][:3]
            for cand in top_candidates:
                if cand.get('ip') and cand['ip'] != '0.0.0.0':
                    # Jika IP kandidat sama dengan main detected_ip, pakai data yang sudah ada
                    if cand['ip'] == scan_data.get('detected_ip') and scan_data.get('location'):
                        cand['location'] = scan_data['location']
                    else:
                        cand['location'] = fetch_geo(cand['ip'])
            
            # Update list candidates di scan_data dengan yang sudah diperkaya (hanya top 3 yang punya location)
            # Kita tidak perlu replace seluruh list, karena object dict di python mutable,
            # tapi untuk aman kita assign balik jika perlu, atau biarkan reference bekerja.
            # Namun karena candidates di scan_data adalah list of dicts, modifikasi in-place 'cand' works.
            pass

        return Response(scan_data)

    @action(detail=False, methods=['post'])
    def analyze_target(self, request):
        """
        Endpoint for Intelligence Analysis (AI Logic).
        """
        target = request.data.get('target')
        if not target:
            return Response({"error": "Target identifier (Phone/IP) is required"}, status=400)
            
        intel = TargetIntelligence()
        
        # Simple heuristic to distinguish Phone vs IP
        if '.' in target and not target.startswith('+'):
            # Assume IP
            result = intel.analyze_ip(target)
        else:
            # Assume Phone
            result = intel.analyze_phone(target)
              
        return Response(result)

    @action(detail=False, methods=['get'])
    def global_fusion(self, request):
        """
        Endpoint for Global Intelligence Fusion (All Data).
        """
        intel = TargetIntelligence()
        report = intel.generate_global_intel()
        return Response(report)

    def perform_create(self, serializer):
        data = serializer.validated_data
        ip_address = data.get('ip_address')
        phone_number = data.get('phone_number')
        
        country = None
        city = None
        provider = None
        lat = None
        lon = None

        # 1. IP Lookup Logic
        if ip_address:
            try:
                response = requests.get(f'http://ip-api.com/json/{ip_address}')
                if response.status_code == 200:
                    geo_data = response.json()
                    if geo_data.get('status') == 'success':
                        country = geo_data.get('country')
                        city = geo_data.get('city')
                        provider = geo_data.get('isp')
                        lat = geo_data.get('lat')
                        lon = geo_data.get('lon')
            except Exception as e:
                print(f"Error fetching IP location: {e}")

        # 2. Phone Lookup Logic (If location/provider still missing)
        if phone_number:
            try:
                parsed_number = phonenumbers.parse(phone_number, None)
                if phonenumbers.is_valid_number(parsed_number):
                    # Get Country from Phone
                    if not country:
                        country = geocoder.description_for_number(parsed_number, "en")
                    
                    # Get Provider from Phone
                    if not provider:
                        provider = carrier.name_for_number(parsed_number, "en")
            except Exception as e:
                 print(f"Error parsing phone number: {e}")

        # Save with enriched data
        serializer.save(
            country=country,
            city=city,
            provider=provider,
            latitude=lat,
            longitude=lon
        )
