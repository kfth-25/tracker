# Setup Fitur Metadata Forensic (ExifTool)

Fitur ini membutuhkan aplikasi eksternal bernama **ExifTool** agar bisa bekerja. Karena ini adalah aplikasi sistem (bukan library Python biasa), Anda perlu mendownloadnya secara manual.

## Langkah 1: Download ExifTool

1.  Buka website resmi ExifTool: [https://exiftool.org/](https://exiftool.org/)
2.  Download versi **Windows Executable** (biasanya bernama `exiftool-12.xx.zip`).
3.  Extract file ZIP tersebut.
4.  Anda akan melihat file bernama `exiftool(-k).exe`.
5.  **Rename (Ubah Nama)** file tersebut menjadi `exiftool.exe` (hilangkan `(-k)`).

## Langkah 2: Pindahkan ke Folder Project

1.  Buka folder project Anda: `c:\project_ip\backend\`
2.  Di dalam folder `backend`, cari folder bernama `bin` (sudah saya buatkan).
    *   Jika belum ada, buat folder baru bernama `bin`.
3.  Masukkan file `exiftool.exe` yang sudah di-rename tadi ke dalam folder `bin` tersebut.

**Struktur folder harus seperti ini:**
```
c:\project_ip\
└── backend\
    ├── manage.py
    ├── tracker\
    └── bin\
        └── exiftool.exe  <-- PASTIKAN ADA DI SINI
```

## Langkah 3: Test Fitur

1.  Jalankan server Django: `python manage.py runserver`
2.  Jalankan frontend React: `npm run dev`
3.  Buka Web Browser, Anda akan melihat bagian baru **"📸 Image Metadata Forensic"**.
4.  Upload foto asli (hasil jepretan kamera/HP yang belum dikirim lewat WA).
5.  Klik "Analyze Metadata".

---

**Catatan Penting:**
*   Foto yang sudah dikirim via WhatsApp/Instagram/Facebook biasanya metadatanya **sudah dihapus otomatis** oleh aplikasi tersebut (privasi).
*   Gunakan foto asli dari file manager HP atau kamera digital untuk melihat hasil maksimal (GPS, Tanggal Asli, Tipe HP).
