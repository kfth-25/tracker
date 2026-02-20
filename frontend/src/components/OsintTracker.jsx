import React, { useState } from 'react';
import axios from 'axios';

const OsintTracker = () => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/calls/osint_scan/', {
                username: username
            });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Terjadi kesalahan saat melakukan scanning.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="mb-5 text-center">
                <h2 className="section-title text-warning text-glow display-6 font-cyber">
                    <i className="bi bi-fingerprint me-3"></i>DIGITAL FOOTPRINT
                </h2>
                <p className="text-secondary font-cyber lead">
                    OSINT TRACKER // SOCIAL MEDIA RECONNAISSANCE // USERNAME ENUMERATION
                </p>
            </div>

            <div className="row justify-content-center mb-5">
                <div className="col-lg-8">
                    <div className="hud-panel p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="cyber-input-group">
                                <span className="input-group-text bg-transparent border-0 text-warning fs-4">@</span>
                                <input
                                    type="text"
                                    className="cyber-input ps-0"
                                    placeholder="ENTER USERNAME (e.g. budi123)"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                <button 
                                    className="btn btn-cyber ms-3" 
                                    type="submit" 
                                    disabled={loading}
                                    style={{background: 'linear-gradient(45deg, transparent 5%, var(--yellow-glow) 5%)', color: '#000'}}
                                >
                                    {loading ? (
                                        <span><span className="spinner-border spinner-border-sm me-2"></span>SCANNING...</span>
                                    ) : (
                                        'INITIATE SCAN'
                                    )}
                                </button>
                            </div>
                            <div className="form-text text-secondary mt-3 font-cyber">
                                <i className="bi bi-exclamation-triangle me-1 text-warning"></i>
                                SCAN DURATION: 5-10 SECONDS // PUBLIC DATA ONLY
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger text-center font-cyber" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> ERROR: {error}
                </div>
            )}

            {result && (
                <div className="results-container animate-pulse-glow">
                    <div className="hud-panel d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center gap-4">
                            <div className="display-4 text-warning"><i className="bi bi-person-bounding-box"></i></div>
                            <div>
                                <h6 className="text-secondary font-cyber mb-1">TARGET USERNAME</h6>
                                <h2 className="m-0 text-white text-glow font-cyber">@{result.username}</h2>
                            </div>
                            <div className="border-start border-secondary ps-4 ms-2">
                                <h6 className="text-secondary font-cyber mb-1">MATCHES FOUND</h6>
                                <span className="badge bg-transparent border border-warning text-warning font-monospace fs-5">
                                    {result.found_count} ACCOUNTS
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        {result.results.length > 0 ? (
                            result.results.map((item, index) => (
                                <div key={index} className="col-md-6 col-lg-4">
                                    <div className="hud-panel h-100 p-3 hover-effect">
                                        <div className="d-flex align-items-center">
                                            <div className="me-3">
                                                <i className={`bi bi-${getIconName(item.platform)} fs-1 text-warning`}></i>
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <h5 className="text-light font-cyber mb-1 text-uppercase">{item.platform}</h5>
                                                <a 
                                                    href={item.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="small text-decoration-none text-info text-truncate d-block font-monospace"
                                                >
                                                    OPEN PROFILE <i className="bi bi-box-arrow-up-right ms-1"></i>
                                                </a>
                                            </div>
                                            <div className="ms-2">
                                                <i className="bi bi-check-circle-fill text-success fs-4"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <div className="hud-panel text-center py-5">
                                    <i className="bi bi-emoji-frown fs-1 text-secondary d-block mb-3"></i>
                                    <p className="lead text-secondary font-cyber">NO ACCOUNTS FOUND WITH THIS USERNAME ON POPULAR PLATFORMS.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper for icons
const getIconName = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return 'instagram';
    if (p.includes('facebook')) return 'facebook';
    if (p.includes('twitter') || p.includes('x')) return 'twitter-x';
    if (p.includes('github')) return 'github';
    if (p.includes('tiktok')) return 'tiktok';
    if (p.includes('youtube')) return 'youtube';
    if (p.includes('telegram')) return 'telegram';
    if (p.includes('pinterest')) return 'pinterest';
    if (p.includes('reddit')) return 'reddit';
    return 'globe'; // Default
};

export default OsintTracker;
