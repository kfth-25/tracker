# Dokumentasi Fitur WhatsApp Forensic Call Tracker

Dokumen ini menjelaskan alur kerja, dependensi, dan struktur kode dari fitur **WhatsApp Forensic** yang telah diimplementasikan. Fitur ini memungkinkan pengguna untuk melakukan panggilan otomatis via WhatsApp Desktop dan menangkap IP Address target menggunakan analisis lalu lintas jaringan (Packet Sniffing).

---

## 1. Alur Kerja (Workflow)

Berikut adalah urutan proses dari input pengguna hingga mendapatkan hasil IP:

1.  **User Input**:
    *   Pengguna memasukkan nomor telepon target di Dashboard Web (Frontend).
    *   Frontend mengirim request `POST` ke endpoint API `/api/calls/forensic_scan/`.

2.  **Backend Processing (Parallel Execution)**:
    *   Django menerima request.
    *   **Thread 1 (Mata-mata/Sniffer)**: Mulai memantau lalu lintas jaringan (UDP) di background.
    *   **Thread 2 (Robot/Bot)**: Mulai menjalankan skrip otomatisasi WhatsApp Desktop.

3.  **Bot Action (`desktop_bot.py`)**:
    *   Memformat nomor telepon (ubah `08xxx` menjadi `62xxx`).
    *   Membuka *Deep Link* `whatsapp://send?phone=62xxx` untuk membuka chat target di aplikasi WhatsApp Desktop.
    *   Menunggu aplikasi loading (5 detik).
    *   Mengirim simulasi tombol keyboard `Ctrl + Shift + C` untuk memicu panggilan suara.

4.  **Sniffer Action (`utils.py`)**:
    *   Menangkap semua paket UDP yang keluar-masuk selama 20 detik (durasi panggilan awal).
    *   **Filtering**:
        *   Membuang IP Lokal (`192.168.x.x`, dll).
        *   Membuang IP Server Raksasa (WhatsApp/Meta, Cloudflare, Google) yang tersimpan di *blacklist*.
    *   **Detection**: Mencari paket dengan header **STUN Binding Request** (tanda koneksi Peer-to-Peer).
    *   Mengambil IP non-server yang paling aktif berkomunikasi.

5.  **Result**:
    *   Backend menggabungkan hasil Sniffer.
    *   Melakukan Geo-Location Lookup (Negara, Kota, ISP) berdasarkan IP yang ditemukan.
    *   Mengirim data JSON kembali ke Frontend untuk ditampilkan.

---

## 2. Package & Library yang Digunakan

Berikut adalah daftar library python yang wajib diinstall agar fitur ini berjalan:

| Package | Kegunaan Utama | Lokasi Penggunaan |
| :--- | :--- | :--- |
| **`django`** | Framework utama web server. | Seluruh Backend |
| **`djangorestframework`** | Membuat API Endpoint untuk komunikasi dengan Frontend. | `views.py` |
| **`scapy`** | **[INTI]** Melakukan packet sniffing (menangkap IP). Wajib install Npcap di Windows. | `utils.py` |
| **`pyautogui`** | **[INTI]** Menggerakkan mouse/keyboard untuk mengontrol WhatsApp Desktop. | `desktop_bot.py` |
| **`requests`** | Melakukan HTTP Request ke API Geolocation (`ip-api.com`). | `views.py` |
| **`phonenumbers`** | Memvalidasi dan memformat nomor telepon. | `views.py` |

---

## 3. Peta Kode (Code Mapping)

Penjelasan bagaimana file-file saling terhubung:

### A. Frontend (React)
*   **File**: `src/components/CallForm.jsx` (atau komponen pemanggil).
*   **Fungsi**: Mengambil input user dan memanggil API.
    ```javascript
    axios.post(`${API_URL}/calls/forensic_scan/`, { phone_number: ... })
    ```

### B. Backend API (Django)
*   **File**: `backend/tracker/views.py`
*   **Class**: `CallLogViewSet` -> Method `forensic_scan`
*   **Fungsi**: "Otak" yang mengatur orkestrasi. Ia memanggil `NetworkForensics` dan `WhatsAppDesktopBot` secara bersamaan.

### C. Modul Sniffer (Mata-mata)
*   **File**: `backend/tracker/utils.py`
*   **Class**: `NetworkForensics`
*   **Logic**:
    *   `start_scan()`: Memulai `scapy.sniff()`.
    *   `_process_packet()`: Memfilter paket. Disini logika "Blacklist IP Server" bekerja.
    *   `ignored_prefixes`: Daftar IP Lokal.
    *   `server_prefixes`: Daftar IP Server Meta/Cloudflare yang harus diabaikan.

### D. Modul Bot (Robot)
*   **File**: `backend/tracker/desktop_bot.py`
*   **Class**: `WhatsAppDesktopBot`
*   **Logic**:
    *   `call()`: Fungsi utama.
    *   `webbrowser.open(uri)`: Trik membuka chat tanpa menyimpan kontak.
    *   `pyautogui.hotkey('ctrl', 'shift', 'c')`: Shortcut rahasia untuk menelpon di WA Desktop.

---

## 4. Troubleshooting Umum

1.  **Bot tidak menelpon?**
    *   Pastikan WhatsApp Desktop sudah login.
    *   Pastikan keyboard shortcut tidak bentrok dengan aplikasi lain.
2.  **IP yang didapat milik Cloudflare/Facebook?**
    *   Update list `server_prefixes` di `utils.py`. IP Server WA sering berubah.
3.  **Error "Admin Privilege Required"?**
    *   `scapy` butuh akses Administrator untuk mengakses kartu jaringan. Jalankan terminal/CMD sebagai Administrator.
