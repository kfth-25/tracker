import React from 'react';
import WhatsAppForensic from '../components/WhatsAppForensic';

const WhatsAppPage = () => {
    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4 text-green text-glow font-cyber">WhatsApp Forensic Unit</h2>

            {/* Tutorial Section */}
            <div className="cyber-card success mb-4">
                <div className="card-header bg-transparent border-bottom border-success border-opacity-25 d-flex align-items-center" data-bs-toggle="collapse" data-bs-target="#waTutorialCollapse" style={{cursor: 'pointer'}}>
                    <h5 className="mb-0 text-green text-glow"><i className="bi bi-info-circle me-2"></i>Panduan & Cara Ekspor Data (Klik untuk Buka/Tutup)</h5>
                </div>
                <div className="collapse show" id="waTutorialCollapse">
                    <div className="card-body">
                        <div className="row g-4">
                            <div className="col-md-6 border-end border-secondary">
                                <h6 className="text-green text-glow fw-bold mb-3">📂 Cara Ekspor Chat (Android/iOS)</h6>
                                <ol className="text-light small">
                                    <li>Buka aplikasi WhatsApp dan masuk ke percakapan target (Personal/Grup).</li>
                                    <li>Ketuk titik tiga di pojok kanan atas (Android) atau nama kontak (iOS).</li>
                                    <li>Pilih <strong>More</strong> {'>'} <strong>Export Chat</strong>.</li>
                                    <li>Pilih <strong>Without Media</strong> (Tanpa Media) agar proses cepat dan file berupa <code>.txt</code>.</li>
                                    <li>Simpan file tersebut dan upload di menu <strong>Chat Log Analyzer</strong> di bawah.</li>
                                </ol>
                            </div>
                            <div className="col-md-6">
                                <h6 className="text-green text-glow fw-bold mb-3">🔍 Apa yang dianalisis?</h6>
                                <ul className="text-light small">
                                    <li><strong>Statistik Pengirim:</strong> Mengetahui siapa yang paling aktif mengirim pesan.</li>
                                    <li><strong>Timeline:</strong> (Segera Hadir) Pola waktu komunikasi.</li>
                                    <li><strong>Link & Lokasi:</strong> Mendeteksi URL dan link Google Maps yang dibagikan.</li>
                                    <li><strong>Pesan Dihapus:</strong> Menghitung jumlah pesan yang dihapus (indikasi penyembunyian jejak).</li>
                                </ul>
                                <div className="alert alert-dark border-success p-2 small mt-3 text-light bg-opacity-25">
                                    <i className="bi bi-shield-lock-fill text-success"></i> <strong>Privasi Aman:</strong> Analisis dilakukan di browser Anda. Data chat tidak diunggah ke server kami.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <WhatsAppForensic />
        </div>
    );
};

export default WhatsAppPage;