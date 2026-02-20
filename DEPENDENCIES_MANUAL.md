# Dokumentasi Dependensi Project Call Tracker & Forensic

Dokumen ini berisi daftar paket (package) yang digunakan dalam proyek ini beserta kegunaannya masing-masing. Proyek ini dibagi menjadi dua bagian utama: **Backend (Python/Django)** dan **Frontend (React/Vite)**.

---

## 🐍 Backend (Python)

Berikut adalah library Python utama yang digunakan di `C:\project_ip\backend`:

### 1. Framework & API
- **`Django`**: Framework web utama yang menangani struktur proyek, database (ORM), dan routing URL.
- **`djangorestframework`**: Toolkit untuk membuat Web API (REST API) di atas Django. Digunakan agar frontend React bisa berkomunikasi dengan backend.
- **`django-cors-headers`**: Middleware untuk mengizinkan Cross-Origin Resource Sharing (CORS). Ini penting agar frontend (port 5173) bisa mengakses backend (port 8000).

### 2. Networking & Forensik
- **`scapy`**: Library manipulasi paket jaringan yang sangat powerful.
  - **Kegunaan**: Digunakan di `utils.py` untuk melakukan sniffing (penyadapan) paket UDP dan mendeteksi IP target dari trafik WhatsApp.
- **`requests`**: Library HTTP untuk Python.
  - **Kegunaan**: Mengirim request ke API eksternal (seperti `ip-api.com`) untuk mendapatkan lokasi geografis dari IP yang terdeteksi.

### 3. Otomasi Desktop & WhatsApp
- **`PyAutoGUI`**: Library untuk mengontrol mouse dan keyboard secara programatis.
  - **Kegunaan**: Digunakan di `desktop_bot.py` untuk menekan tombol shortcut (`Ctrl+Shift+C`) atau mengetik di aplikasi WhatsApp Desktop.
- **`webbrowser`** (Bawaan Python):
  - **Kegunaan**: Membuka deep link `whatsapp://` untuk memicu panggilan otomatis.
- **`phonenumbers`**: Library porting dari Google libphonenumber.
  - **Kegunaan**: Memvalidasi, memformat, dan mengekstrak informasi provider/negara dari nomor telepon yang diinput.

### 4. Utilitas Lain
- **`pillow`** (PIL Fork): Library pemrosesan gambar. (Dependency dari PyAutoGUI untuk screenshot/image recognition).
- **`sqlparse`**: Dependency Django untuk formatting query SQL.
- **`asgiref`**: Dependency Django untuk dukungan Async (Asynchronous).

---

## ⚛️ Frontend (JavaScript/React)

Berikut adalah library JavaScript yang digunakan di `C:\project_ip\frontend`:

### 1. Core Framework
- **`react`**: Library utama untuk membangun antarmuka pengguna (UI) berbasis komponen.
- **`react-dom`**: Penghubung antara React dan DOM browser.
- **`vite`**: Build tool generasi baru yang sangat cepat untuk development server dan bundling aplikasi.

### 2. Komunikasi Data
- **`axios`**: HTTP Client berbasis Promise.
  - **Kegunaan**: Digunakan di `services/api.js` untuk mengirim data form ke backend Django dan mengambil riwayat panggilan. Lebih mudah digunakan dibanding `fetch` bawaan.

### 3. Development Tools
- **`eslint`**: Linter untuk menjaga kualitas kode JavaScript dan mencegah error umum.
- **`@vitejs/plugin-react`**: Plugin agar Vite bisa memproses kode React (JSX).

---

## 🛠️ Cara Install Ulang

Jika Anda memindahkan proyek ini ke komputer lain, gunakan perintah berikut untuk menginstall semua dependensi:

**Backend:**
```bash
cd backend
pip install Django djangorestframework django-cors-headers scapy requests phonenumbers PyAutoGUI
```

**Frontend:**
```bash
cd frontend
npm install
```
