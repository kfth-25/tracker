import React, { useState } from 'react';
import { runTechScanApi, saveReportApi } from '../services/api';

const TechDetector = () => {
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
                target: target,
                source_type: 'TECH',
                data: data,
                risk_score: 0,
                notes: `Tech stack detection for ${target}`
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
            const response = await runTechScanApi(target);
            if (response.status === 'success') {
                setData(response.data);
            } else {
                setError(response.error || "Scan failed");
            }
        } catch (err) {
            console.error("Tech scan failed:", err);
            setError(err.response?.data?.error || "Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="mb-5 text-center">
                <h2 className="section-title text-yellow text-glow display-6 font-cyber">
                    <i className="bi bi-cpu me-3"></i>TECH STACK HOLDER
                </h2>
                <p className="text-secondary font-cyber lead">
                    PASSIVE RECONNAISSANCE // DETECT CMS, SERVER, FRAMEWORKS
                </p>
            </div>

            <div className="row justify-content-center mb-5">
                <div className="col-lg-8">
                    <div className="hud-panel p-4">
                        <form onSubmit={handleScan}>
                            <div className="cyber-input-group">
                                <i className="bi bi-link-45deg text-yellow fs-4 me-3"></i>
                                <input
                                    type="text"
                                    className="cyber-input"
                                    placeholder="ENTER WEBSITE URL (e.g. example.com)"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    disabled={loading}
                                />
                                <button type="submit" className="btn btn-cyber ms-3" disabled={loading || !target} style={{background: 'linear-gradient(45deg, transparent 5%, var(--yellow-glow) 5%)', color: '#000'}}>
                                    {loading ? (
                                        <span><span className="spinner-border spinner-border-sm me-2"></span>SCANNING...</span>
                                    ) : (
                                        'DETECT TECH'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger text-center font-cyber" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i> ERROR: {error}
                </div>
            )}

            {data && (
                <div className="results-container animate-pulse-glow">
                    {/* Header Summary */}
                    <div className="hud-panel d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center gap-4">
                            <div className="display-4 text-yellow"><i className="bi bi-layers"></i></div>
                            <div>
                                <h6 className="text-secondary font-cyber mb-1">TARGET WEBSITE</h6>
                                <h2 className="m-0 text-white text-glow font-cyber">{target}</h2>
                            </div>
                            <div className="border-start border-secondary ps-4 ms-2">
                                <h6 className="text-secondary font-cyber mb-1">SCAN TYPE</h6>
                                <span className="badge bg-transparent border border-yellow text-yellow font-monospace">PASSIVE</span>
                            </div>
                        </div>
                        <button 
                            className="btn btn-cyber-outline"
                            style={{borderColor: 'var(--yellow-glow)', color: 'var(--yellow-glow)'}}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <i className="bi bi-save me-2"></i>
                            {saving ? 'SAVING...' : 'SAVE REPORT'}
                        </button>
                    </div>

                    <div className="row g-4">
                        {/* IP & Location Info */}
                        {data.ip_info && (
                            <div className="col-12">
                                <div className="hud-panel p-4">
                                    <div className="row align-items-center font-cyber">
                                        <div className="col-md-4 mb-3 mb-md-0">
                                            <span className="text-secondary d-block small mb-1">IP ADDRESS</span>
                                            <span className="text-cyan fs-4 font-monospace">{data.ip_info.ip || 'UNKNOWN'}</span>
                                        </div>
                                        <div className="col-md-4 mb-3 mb-md-0 border-start border-secondary ps-md-4">
                                            <span className="text-secondary d-block small mb-1">LOCATION</span>
                                            <span className="text-light fs-5">
                                                {data.ip_info.country ? (
                                                    <><i className="bi bi-geo-alt me-2 text-danger"></i>{data.ip_info.city && `${data.ip_info.city}, `}{data.ip_info.country}</>
                                                ) : 'UNKNOWN'}
                                            </span>
                                        </div>
                                        {data.ip_info.isp && (
                                            <div className="col-md-4 border-start border-secondary ps-md-4">
                                                <span className="text-secondary d-block small mb-1">ISP / ORGANIZATION</span>
                                                <span className="text-light fs-5">{data.ip_info.isp}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Server Info */}
                        <div className="col-md-6">
                            <div className="hud-panel h-100">
                                <h4 className="mb-4 text-yellow font-cyber border-bottom border-secondary border-opacity-25 pb-2">
                                    <i className="bi bi-hdd-rack me-2"></i>SERVER & BACKEND
                                </h4>
                                <div className="card-body font-cyber">
                                    <div className="mb-3 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-2">
                                        <span className="text-secondary">WEB SERVER</span>
                                        <span className="text-light fs-5 font-monospace">{data.server || 'UNKNOWN'}</span>
                                    </div>
                                    <div className="mb-3 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-2">
                                        <span className="text-secondary">LANGUAGE</span>
                                        <span className="text-light fs-5 font-monospace">{data.programming_language || 'UNKNOWN'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-secondary">CMS</span>
                                        <span className={`fs-5 font-monospace fw-bold ${data.cms ? 'text-success' : 'text-muted'}`}>
                                            {data.cms || 'NOT DETECTED'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Frontend Info */}
                        <div className="col-md-6">
                            <div className="hud-panel h-100">
                                <h4 className="mb-4 text-yellow font-cyber border-bottom border-secondary border-opacity-25 pb-2">
                                    <i className="bi bi-code-square me-2"></i>FRONTEND & CDN
                                </h4>
                                <div className="card-body font-cyber">
                                    <div className="mb-4">
                                        <span className="text-secondary d-block small mb-2">JS FRAMEWORKS</span>
                                        <div className="d-flex flex-wrap gap-2">
                                            {data.javascript_frameworks && data.javascript_frameworks.length > 0 ? (
                                                data.javascript_frameworks.map((fw, i) => (
                                                    <span key={i} className="badge bg-transparent border border-cyan text-cyan p-2">
                                                        {fw}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-muted small">NONE DETECTED</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center border-top border-secondary border-opacity-25 pt-3">
                                        <span className="text-secondary">CDN / PROXY</span>
                                        <span className="text-light fs-5 font-monospace">{data.cdn || 'NONE'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Others */}
                        {data.others && data.others.length > 0 && (
                            <div className="col-12">
                                <div className="hud-panel">
                                    <h4 className="mb-4 text-muted font-cyber border-bottom border-secondary border-opacity-25 pb-2">
                                        <i className="bi bi-info-circle me-2"></i>OTHER INFORMATION
                                    </h4>
                                    <div className="card-body">
                                        <div className="row">
                                            {data.others.map((item, i) => (
                                                <div key={i} className="col-md-4 mb-2 font-cyber text-secondary">
                                                    <i className="bi bi-caret-right-fill me-2 small"></i>{item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechDetector;
