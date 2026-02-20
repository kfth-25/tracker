import React, { useState } from 'react';
import api, { saveReportApi } from '../services/api';

const NetworkForensic = () => {
    const [target, setTarget] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!data) return;
        setSaving(true);
        try {
            await saveReportApi({
                target: data.target,
                source_type: 'NETWORK',
                data: data,
                risk_score: 0, // Default risk score
                notes: `Network scan for ${data.target}`
            });
            alert('Report saved successfully!');
        } catch (err) {
            console.error("Failed to save report:", err);
            alert('Failed to save report.');
        } finally {
            setSaving(false);
        }
    };

    const handleScan = async (e) => {
        e.preventDefault();
        if (!target) return;

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await api.post('/calls/network_scan/', { target });
            setData(response.data.data);
        } catch (err) {
            console.error("Network scan failed:", err);
            setError(err.response?.data?.error || "Failed to scan target.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="mb-5 text-center">
                <h2 className="section-title text-cyan display-6 font-cyber">
                    <i className="bi bi-globe me-3"></i>NETWORK INTELLIGENCE
                </h2>
                <p className="text-secondary font-cyber lead">
                    ANALYZE IP ADDRESSES & DOMAINS // GATHER WHOIS, GEOIP, DNS DATA
                </p>
            </div>

            <div className="row justify-content-center mb-5">
                <div className="col-lg-8">
                    <div className="hud-panel p-4">
                        <form onSubmit={handleScan}>
                            <div className="cyber-input-group">
                                <i className="bi bi-search text-cyan fs-4 me-3"></i>
                                <input
                                    type="text"
                                    className="cyber-input"
                                    placeholder="ENTER TARGET IP (e.g. 8.8.8.8) OR DOMAIN (e.g. google.com)"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    disabled={loading}
                                />
                                <button type="submit" className="btn btn-cyber ms-3" disabled={loading || !target}>
                                    {loading ? (
                                        <span><span className="spinner-border spinner-border-sm me-2"></span>SCANNING...</span>
                                    ) : (
                                        'INITIATE SCAN'
                                    )}
                                </button>
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

            {data && (
                <div className="results-container animate-pulse-glow">
                    
                    {/* Header Summary */}
                    <div className="hud-panel d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center gap-4">
                            <div className="display-4 text-cyan"><i className="bi bi-bullseye"></i></div>
                            <div>
                                <h6 className="text-secondary font-cyber mb-1">TARGET ACQUIRED</h6>
                                <h2 className="m-0 text-white text-glow font-cyber">{data.target}</h2>
                            </div>
                            <div className="border-start border-secondary ps-4 ms-2">
                                <h6 className="text-secondary font-cyber mb-1">TYPE</h6>
                                <span className="badge bg-transparent border border-cyan text-cyan font-monospace">{data.type}</span>
                            </div>
                        </div>
                        <button 
                            className="btn btn-cyber-outline"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <i className="bi bi-save me-2"></i>
                            {saving ? 'SAVING...' : 'SAVE REPORT'}
                        </button>
                    </div>

                    <div className="row g-4">
                        
                        {/* 1. DNS Info */}
                        <div className="col-md-6">
                            <div className="hud-panel h-100">
                                <h4 className="mb-4 text-cyan font-cyber border-bottom border-secondary border-opacity-25 pb-2">
                                    <i className="bi bi-diagram-3 me-2"></i>DNS / HOSTNAME
                                </h4>
                                <div className="card-body">
                                    {data.dns.error ? (
                                        <p className="text-red font-cyber">{data.dns.error}</p>
                                    ) : (
                                        <ul className="list-unstyled mb-0 font-cyber">
                                            {data.dns.hostname && (
                                                <li className="mb-3">
                                                    <span className="text-secondary d-block small">HOSTNAME</span>
                                                    <span className="text-success fs-5">{data.dns.hostname}</span>
                                                </li>
                                            )}
                                            {data.dns.resolved_ip && (
                                                <li className="mb-3">
                                                    <span className="text-secondary d-block small">RESOLVED IP</span>
                                                    <span className="text-success fs-5">{data.dns.resolved_ip}</span>
                                                </li>
                                            )}
                                            {data.dns.aliases && data.dns.aliases.length > 0 && (
                                                <li className="mt-3">
                                                    <span className="text-secondary d-block small">ALIASES</span>
                                                    <span className="text-light">{data.dns.aliases.join(', ')}</span>
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. GeoIP Info */}
                        <div className="col-md-6">
                            <div className="hud-panel h-100">
                                <h4 className="mb-4 text-cyan font-cyber border-bottom border-secondary border-opacity-25 pb-2">
                                    <i className="bi bi-geo-alt me-2"></i>GEO LOCATION
                                </h4>
                                <div className="card-body">
                                    {data.geoip.error ? (
                                        <p className="text-red font-cyber">{data.geoip.error}</p>
                                    ) : (
                                        <div className="row font-cyber">
                                            <div className="col-6 mb-3">
                                                <span className="text-secondary d-block small">COUNTRY</span>
                                                <span className="text-light fs-5">{data.geoip.country} <span className="text-muted small">({data.geoip.countryCode})</span></span>
                                            </div>
                                            <div className="col-6 mb-3">
                                                <span className="text-secondary d-block small">REGION</span>
                                                <span className="text-light fs-5">{data.geoip.regionName}</span>
                                            </div>
                                            <div className="col-6 mb-3">
                                                <span className="text-secondary d-block small">CITY</span>
                                                <span className="text-light fs-5">{data.geoip.city}</span>
                                            </div>
                                            <div className="col-6 mb-3">
                                                <span className="text-secondary d-block small">ISP</span>
                                                <span className="text-light">{data.geoip.isp}</span>
                                            </div>
                                            <div className="col-12">
                                                <span className="text-secondary d-block small">ORGANIZATION</span>
                                                <span className="text-light">{data.geoip.org}</span>
                                            </div>
                                            
                                            {data.geoip.lat && data.geoip.lon && (
                                                <div className="col-12 mt-4">
                                                    <a 
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.geoip.isp || ''} ${data.geoip.city || ''} ${data.geoip.country || ''}`)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-cyber-outline w-100"
                                                    >
                                                        <i className="bi bi-map-fill me-2"></i> OPEN SATELLITE VIEW
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. Whois Info */}
                        <div className="col-12">
                            <div className="hud-panel">
                                <h4 className="mb-4 text-cyan font-cyber border-bottom border-secondary border-opacity-25 pb-2">
                                    <i className="bi bi-person-lines-fill me-2"></i>REGISTRATION (RDAP/WHOIS)
                                </h4>
                                <div className="card-body">
                                    {data.whois.error ? (
                                        <p className="text-red font-cyber">{data.whois.error}</p>
                                    ) : (
                                        <div className="font-cyber">
                                            <div className="row mb-4">
                                                <div className="col-md-6 mb-2">
                                                    <span className="text-secondary d-block small">REGISTRANT NAME</span>
                                                    <span className="text-light fs-5">{data.whois.name || 'N/A'}</span>
                                                </div>
                                                <div className="col-md-6 mb-2">
                                                    <span className="text-secondary d-block small">HANDLE ID</span>
                                                    <span className="text-light fs-5">{data.whois.handle || 'N/A'}</span>
                                                </div>
                                            </div>
                                            
                                            {data.whois.entities && data.whois.entities.length > 0 && (
                                                <div className="mb-4">
                                                    <span className="text-secondary d-block small mb-2">ENTITIES</span>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {data.whois.entities.map((entity, idx) => (
                                                            <span key={idx} className="badge bg-dark border border-secondary text-secondary fw-normal p-2">
                                                                {entity}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {data.whois.events && (
                                                <div className="mb-4">
                                                    <span className="text-secondary d-block small mb-2">TIMELINE</span>
                                                    <div className="table-responsive">
                                                        <table className="table table-dark table-hover table-sm bg-transparent">
                                                            <tbody>
                                                                {data.whois.events.map((evt, idx) => (
                                                                    <tr key={idx}>
                                                                        <td className="text-cyan text-uppercase">{evt.eventAction}</td>
                                                                        <td className="text-end font-monospace text-muted">{new Date(evt.eventDate).toLocaleString()}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="mt-3 text-end">
                                                <span className="text-secondary small me-2">DATA SOURCE:</span>
                                                <a href={data.whois.raw_source} target="_blank" rel="noopener noreferrer" className="text-cyan text-decoration-none border-bottom border-cyan small">
                                                    {data.whois.raw_source} <i className="bi bi-box-arrow-up-right ms-1"></i>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NetworkForensic;
