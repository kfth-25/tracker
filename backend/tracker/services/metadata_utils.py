import subprocess
import json
import os
import sys

# Path ke executable ExifTool
# Struktur user saat ini: c:\project_ip\backend\bin\exiftool.exe\exiftool-13.48_64\exiftool(-k).exe
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Kita coba beberapa kemungkinan path karena user mengekstraknya agak dalam
POSSIBLE_PATHS = [
    os.path.join(BASE_DIR, 'bin', 'exiftool.exe'), # Path ideal
    os.path.join(BASE_DIR, 'bin', 'exiftool.exe', 'exiftool-13.48_64', 'exiftool.exe'), # Path real user (RENAME SUKSES)
    os.path.join(BASE_DIR, 'bin', 'exiftool(-k).exe'), # Fallback
]

def get_exiftool_path():
    for path in POSSIBLE_PATHS:
        # PENTING: Cek isfile, karena user mungkin punya folder dengan nama exiftool.exe
        if os.path.exists(path) and os.path.isfile(path):
            return path
    return None

def get_metadata(file_path):
    """
    Menjalankan ExifTool untuk mengambil metadata dari file gambar/video.
    Mengembalikan dictionary metadata.
    """
    
    executable = get_exiftool_path()
    
    # Jika tidak ketemu path spesifik, coba panggil command global
    if not executable:
        executable = 'exiftool'

    try:
        # Command: exiftool -a -c "%.6f" <file_path>
        # Menggunakan Text Output (bukan JSON) agar mendapatkan Label yang mudah dibaca
        # Contoh: "GPS Latitude Ref" (Label) vs "GPSLatitudeRef" (Tag Name)
        # User ingin melihat label seperti "GPS Latitude Ref", "GPS Date Stamp" dll.
        
        cmd = [executable, '-a', '-c', '%.6f', file_path]
        
        print(f">>> Running ExifTool: {cmd}") # Logging
        
        process = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=10 # PENTING: Timeout 10 detik agar tidak macet selamanya
        )
        
        if process.returncode != 0:
            print(f">>> ExifTool Error Output: {process.stderr}")
            return {"error": f"ExifTool Error: {process.stderr}"}
            
        # Parse Text Output
        metadata = {}
        for line in process.stdout.splitlines():
            line = line.strip()
            if not line: continue
            
            # Split by first colon
            # Format: "Label                    : Value"
            parts = line.split(':', 1)
            if len(parts) == 2:
                key = parts[0].strip()
                value = parts[1].strip()
                
                # Handle duplicate keys (append info with separator)
                if key in metadata:
                    if metadata[key] == value:
                        continue # Skip exact duplicates
                    metadata[key] = f"{metadata[key]} | {value}"
                else:
                    metadata[key] = value
                    
        return metadata

    except subprocess.TimeoutExpired:
        return {"error": "ExifTool analysis timed out (stuck)."}
    except FileNotFoundError:
        return {"error": f"ExifTool not found. Checked paths: {POSSIBLE_PATHS}"}
    except Exception as e:
        return {"error": str(e)}
