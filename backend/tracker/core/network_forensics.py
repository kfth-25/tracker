import time
import socket
from collections import Counter
from scapy.all import sniff, IP, UDP

class NetworkForensics:
    def __init__(self):
        self.packet_counts = Counter()
        self.candidate_details = {}  # Store detail info per IP
        self.is_scanning = False
        self.binding_response_count = 0  # Track STUN Binding Responses (0x0101)
        
        # 1. IP PRIVATE (Lokal)
        self.ignored_prefixes = ['192.168.', '10.', '172.16.', '127.', '224.', '239.']
        
        # 1b. AUTO-DETECT SELF IP (Dynamic Exclusion)
        self.ignored_ips = self._get_local_ips()
        print(f"[FORENSIC] Auto-Excluding Host IPs: {self.ignored_ips}")

        # 2. IP SERVER RAKSASA (Cloudflare, Google, Facebook/Meta, Microsoft)
        # Kita blacklist ini karena kita cari IP PERUMAHAN (ISP), bukan IP Server.
        self.server_prefixes = [
            '104.', '172.', '162.', # Cloudflare
            '31.', '157.', '69.', '66.', # Meta / Facebook / WhatsApp Server
            '142.', '8.', '34.', # Google
            '20.', '52.' # Microsoft
        ]

    def start_scan(self, duration=15, manual_excluded_ip=None):
        """
        Melakukan sniffing paket UDP.
        """
        self.packet_counts.clear()
        self.candidate_details.clear()
        self.binding_response_count = 0
        self.is_scanning = True
        
        # Add manual IP if provided
        if manual_excluded_ip:
             self.ignored_ips.add(manual_excluded_ip)
             print(f"[FORENSIC] Manual Excluded IP: {manual_excluded_ip}")

        print(f"[FORENSIC] Sniffing started for {duration}s...")
        
        try:
            # Filter UDP
            sniff(filter="udp", prn=self._process_packet, timeout=duration, store=0)
        except Exception as e:
            print(f"[ERROR] Sniffing failed: {e}")
            return {"status": "error", "message": "Admin/Root privilege required"}
        
        self.is_scanning = False
        return self._analyze_results()

    def _process_packet(self, packet):
        if IP in packet and UDP in packet:
            src_ip = packet[IP].src
            
            # Ambil payload mentah
            try:
                payload = bytes(packet[UDP].payload)
            except Exception:
                return

            # === DEEP PACKET INSPECTION (DPI) ===
            is_binding_request = False
            is_binding_response = False
            packet_type = "UDP Traffic"
            
            if len(payload) >= 20: # Header STUN minimal 20 bytes
                # Cek 2 byte pertama: 0x00 (Class=Request) 0x01 (Method=Binding)
                if payload[0] == 0x00 and payload[1] == 0x01:
                    is_binding_request = True
                    packet_type = "STUN Binding Request"
                # Cek 2 byte pertama: 0x01 (Class=Success Response) 0x01 (Method=Binding)
                elif payload[0] == 0x01 and payload[1] == 0x01:
                    self.binding_response_count += 1
                    is_binding_response = True
                    packet_type = f"STUN Binding Response (Len={len(payload)})"

            # Filter Tahap 1: Buang IP Lokal (Device Anda)
            if src_ip in self.ignored_ips:
                # print(f"[DEBUG] Skipping local device IP: {src_ip}")
                return
            if any(src_ip.startswith(prefix) for prefix in self.ignored_prefixes):
                # print(f"[DEBUG] Skipping private network IP: {src_ip}")
                return

            # Filter Tahap 2: Buang IP Server (Meta/WA/Google/Cloudflare)
            # Kita hanya mencari IP 'Residential' (P2P)
            is_server = False
            for prefix in self.server_prefixes:
                if src_ip.startswith(prefix):
                    is_server = True
                    break
            
            if is_server:
                # print(f"[DEBUG] Skipping server IP: {src_ip}")
                return
            
            # === SCORING SYSTEM ===
            # Jika lolos filter di atas, berarti ini adalah IP EXTERNAL NON-SERVER (Target)
            # Binding Request/Response dari IP ini adalah indikasi kuat koneksi P2P langsung.
            
            score = 1000 if (is_binding_request or is_binding_response) else 1
            self.packet_counts[src_ip] += score
            
            # Simpan detail terakhir yang paling signifikan
            if src_ip not in self.candidate_details:
                self.candidate_details[src_ip] = packet_type
            else:
                # Update jika tipe sekarang lebih signifikan (STUN > UDP)
                if "STUN" in packet_type:
                    self.candidate_details[src_ip] = packet_type

    def _analyze_results(self):
        """
        Logika Baru: Cari IP Non-Server yang muncul saat call.
        """
        if not self.packet_counts:
            if self.binding_response_count == 0:
                msg = "Response tidak ditemukan (No STUN Binding Response). Pastikan Target MENGANGKAT telepon."
            else:
                msg = "No candidate IP found (All packets filtered as Server/Local IP)"
                
            return {"status": "failed", "detected_ip": None, "message": msg}

        print("[FORENSIC] Candidate IPs (Filtered):", self.packet_counts)

        # Ambil 5 IP teratas
        most_common = self.packet_counts.most_common(5)
        
        # Buat list lengkap kandidat untuk dikirim ke frontend
        candidates_list = []
        for ip, score in most_common:
            candidates_list.append({
                "ip": ip,
                "score": score,
                "type": self.candidate_details.get(ip, "Unknown")
            })

        if not most_common:
             return {"status": "failed", "detected_ip": None}

        # Ambil kandidat pertama sebagai detected_ip utama
        target_ip = most_common[0][0]
        
        # VALIDASI: Jika ada Binding Response (0x0101) dari IP kandidat, berarti telpon DIANGKAT
        # Jika hanya ada Binding Request (0x0001), berarti hanya berdering/mencoba koneksi.
        is_answered = self.binding_response_count > 0
        call_status = "ANSWERED / P2P ESTABLISHED" if is_answered else "RINGING / NO P2P RESPONSE"

        return {
            "status": "success",
            "detected_ip": target_ip,
            "is_answered": is_answered,
            "call_status": call_status,
            "packet_count": self.packet_counts[target_ip],
            "protocol": self.candidate_details.get(target_ip, "UDP/STUN"),
            "candidates": candidates_list # Kirim list detail ke frontend
        }

    def _get_local_ips(self):
        """
        Dapatkan semua IP lokal di interface host untuk di-exclude.
        """
        local_ips = set(['127.0.0.1', '0.0.0.0'])
        try:
            # Cara cepat ambil IP utama
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ips.add(s.getsockname()[0])
            s.close()
            
            # Ambil semua interface
            hostname = socket.gethostname()
            all_ips = socket.gethostbyname_ex(hostname)[2]
            for ip in all_ips:
                local_ips.add(ip)
        except:
            pass
        return local_ips
