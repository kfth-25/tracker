import React from 'react';
import NetworkForensic from '../components/NetworkForensic';

const NetworkPage = () => {
    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4 text-cyan text-glow font-cyber">NETWORK INTEL & SCANNER</h2>

            {/* Tutorial Section */}
            <div className="cyber-card mb-4">
                <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 d-flex align-items-center" data-bs-toggle="collapse" data-bs-target="#networkTutorialCollapse" style={{cursor: 'pointer'}}>
                    <h5 className="mb-0 text-cyan"><i className="bi bi-info-circle me-2"></i>Panduan Network Scan (Klik untuk Buka/Tutup)</h5>
                </div>
                <div className="collapse show" id="networkTutorialCollapse">
                    <div className="card-body">
                        <div className="row g-4">
                            <div className="col-md-6 border-end border-secondary border-opacity-25">
                                <h6 className="text-cyan fw-bold mb-3">🛠️ Cara Penggunaan</h6>
                                <div className="table-responsive">
                                    <table className="table table-dark table-sm table-bordered border-secondary small bg-transparent">
                                        <thead>
                                            <tr>
                                                <th className="text-cyan">Tipe Target</th>
                                                <th className="text-cyan">Contoh Input</th>
                                                <th className="text-cyan">Keterangan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>IP Public</td>
                                                <td><code className="text-light">8.8.8.8</code></td>
                                                <td>Geo-Location & ISP Check</td>
                                            </tr>
                                            <tr>
                                                <td>Domain</td>
                                                <td><code className="text-light">google.com</code></td>
                                                <td>DNS & Whois Lookup</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-secondary small mt-2">
                                    Masukkan target di kolom input di bawah dan tekan tombol <span className="text-cyan fw-bold">Analyze Network</span>.
                                </p>
                            </div>

                            <div className="col-md-6">
                                <h6 className="text-cyan fw-bold mb-3">🔍 Kapabilitas Scan</h6>
                                <ul className="small text-secondary">
                                    <li><strong className="text-light">Geo-Location:</strong> Negara, Kota, ISP, dan Koordinat Peta.</li>
                                    <li><strong className="text-light">WHOIS/RDAP:</strong> Informasi kepemilikan domain dan registrar.</li>
                                    <li><strong className="text-light">DNS:</strong> Hostname dan Aliases.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="cyber-card">
                <div className="card-body">
                    <NetworkForensic />
                </div>
            </div>
        </div>
    );
};

export default NetworkPage;
