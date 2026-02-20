import React from 'react';
import TechDetector from '../components/TechDetector';

const TechDetectPage = () => {
    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4 text-yellow text-glow font-cyber">TECH STACK HOLDER & DETECTOR</h2>
            
            {/* Tutorial Section */}
            <div className="cyber-card mb-4">
                <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 d-flex align-items-center" data-bs-toggle="collapse" data-bs-target="#techTutorialCollapse" style={{cursor: 'pointer'}}>
                    <h5 className="mb-0 text-yellow"><i className="bi bi-info-circle me-2"></i>Panduan / Tutorial (Klik untuk Buka/Tutup)</h5>
                </div>
                <div className="collapse show" id="techTutorialCollapse">
                    <div className="card-body">
                        <h6 className="text-yellow fw-bold">🛠️ Cara Menggunakan Tech Detector:</h6>
                        <ol className="small text-secondary">
                            <li>Masukkan URL website target (contoh: <code className="text-light">google.com</code> atau <code className="text-light">https://example.com</code>).</li>
                            <li>Klik tombol <span className="text-yellow fw-bold">🔍 Detect Technology</span>.</li>
                            <li>Sistem akan melakukan <strong className="text-cyan">Passive Reconnaissance</strong> untuk mendeteksi:
                                <ul className="mt-2">
                                    <li><strong className="text-light">Server Info:</strong> Web Server (Nginx, Apache, IIS).</li>
                                    <li><strong className="text-light">CMS:</strong> Content Management System (WordPress, Joomla, Drupal).</li>
                                    <li><strong className="text-light">Frameworks:</strong> Bahasa pemrograman & Framework JS (React, Vue, PHP).</li>
                                    <li><strong className="text-light">Security Headers:</strong> X-Powered-By dan header lainnya.</li>
                                </ul>
                            </li>
                        </ol>
                        <p className="small text-secondary mb-0 fst-italic">
                            <i className="bi bi-shield-check me-1"></i>
                            Note: Metode ini aman (Passive) dan tidak melakukan serangan atau scanning intrusif.
                        </p>
                    </div>
                </div>
            </div>

            <div className="cyber-card">
                <div className="card-body">
                    <TechDetector />
                </div>
            </div>
        </div>
    );
};

export default TechDetectPage;
