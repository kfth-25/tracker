import React from 'react';
import MetadataForensic from '../components/MetadataForensic';

const MetadataPage = () => {
    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4 text-green text-glow font-cyber">METADATA EXTRACTOR & FORENSIC</h2>

            {/* Tutorial Section */}
            <div className="cyber-card success mb-4">
                <div className="card-header bg-transparent border-bottom border-success border-opacity-25 d-flex align-items-center" data-bs-toggle="collapse" data-bs-target="#metadataTutorialCollapse" style={{cursor: 'pointer'}}>
                    <h5 className="mb-0 text-green text-glow"><i className="bi bi-info-circle me-2"></i>Panduan & Cara Validasi (Klik untuk Buka/Tutup)</h5>
                </div>
                <div className="collapse show" id="metadataTutorialCollapse">
                    <div className="card-body">
                        <div className="row g-4">
                            <div className="col-md-6 border-end border-secondary">
                                <h6 className="text-green text-glow fw-bold mb-3">📸 Cara Penggunaan</h6>
                                <ol className="text-light small">
                                    <li>Klik tombol <strong>Choose File</strong> dan pilih gambar target (JPG/JPEG/PNG).</li>
                                    <li>Klik tombol <strong>Analyze Metadata</strong>.</li>
                                    <li>Tunggu proses ekstraksi data selesai.</li>
                                    <li>Hasil akan muncul di bawah:
                                        <ul>
                                            <li><strong>GPS:</strong> Koordinat lokasi pengambilan foto.</li>
                                            <li><strong>Device:</strong> Model HP/Kamera yang digunakan.</li>
                                            <li><strong>Date:</strong> Tanggal & Jam asli pengambilan gambar.</li>
                                        </ul>
                                    </li>
                                </ol>
                            </div>
                            <div className="col-md-6">
                                <h6 className="text-yellow text-glow fw-bold mb-3">⚠️ Cara Validasi (Test Fungsi)</h6>
                                <p className="text-light small">Agar Anda yakin alat ini berfungsi, ikuti langkah ini:</p>
                                <ul className="text-light small">
                                    <li><strong>Gunakan Foto Asli:</strong> Ambil foto baru dengan HP Anda sekarang. Pastikan GPS/Lokasi HP aktif.</li>
                                    <li><strong>Transfer via File/Kabel:</strong> Kirim ke laptop via Kabel USB, Email (Attach File), atau Bluetooth. <br/><span className="text-danger">JANGAN kirim via WhatsApp/IG</span> (karena metadata akan dihapus otomatis oleh mereka).</li>
                                    <li><strong>Upload:</strong> Masukkan foto tersebut ke sini.</li>
                                    <li><strong>Cek Hasil:</strong> Jika muncul peta lokasi dan merk HP Anda, berarti alat ini <strong>100% Berfungsi</strong>.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="cyber-card success">
                <div className="card-body">
                    <MetadataForensic />
                </div>
            </div>
        </div>
    );
};

export default MetadataPage;
