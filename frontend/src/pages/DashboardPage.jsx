import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { runAnalyzeTargetApi, runGlobalFusionApi, fetchReportsApi } from '../services/api';

const DashboardPage = () => {
    const [targetInput, setTargetInput] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [globalReport, setGlobalReport] = useState(null);
    const [savedReports, setSavedReports] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSavedReports();
    }, []);

    const loadSavedReports = async () => {
        try {
            const reports = await fetchReportsApi();
            setSavedReports(reports);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        }
    };

    const handleGlobalFusion = async () => {
        setLoading(true);
        setGlobalReport(null);
        setAnalysisResult(null); 
        try {
            const result = await runGlobalFusionApi();
            setGlobalReport(result);
        } catch (error) {
            setAnalysisResult({ error: "Global Fusion failed." });
        }
        setLoading(false);
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!targetInput) return;
        
        setLoading(true);
        setAnalysisResult(null);
        setGlobalReport(null); 
        try {
            const result = await runAnalyzeTargetApi(targetInput);
            setAnalysisResult(result);
        } catch (error) {
            setAnalysisResult({ error: "Analysis failed or target not found." });
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid py-4 animate-fade-in">
            {/* HERO SECTION */}
            <div className="row justify-content-center mb-5">
                <div className="col-lg-8 text-center">
                    <h1 className="display-2 fw-bold mb-2 font-cyber" style={{ letterSpacing: '4px' }}>
                        <span className="text-danger text-glow">CYBER</span><span className="text-cyan text-glow">INTEL</span> OPS
                    </h1>
                    <p className="lead text-secondary font-cyber mb-4">
                        INTEGRATED TACTICAL INTELLIGENCE PLATFORM // INDONESIA REGION
                    </p>
                    <div className="d-inline-block px-4 py-2 border border-danger text-danger font-monospace rounded-pill bg-danger bg-opacity-10 animate-pulse-glow">
                        <i className="bi bi-shield-lock-fill me-2"></i>SECURE ENCRYPTED CONNECTION
                    </div>
                </div>
            </div>

            {/* TARGET ANALYSIS SECTION */}
            <div className="row justify-content-center mb-5">
                <div className="col-lg-10">
                    <div className="cyber-card rounded-3 p-4">
                        <h4 className="text-cyan mb-4 font-cyber"><i className="bi bi-crosshair me-2"></i>TARGET ANALYSIS</h4>
                        <form onSubmit={handleAnalyze} className="mb-4">
                            <div className="input-group">
                                <span className="input-group-text bg-dark border-secondary text-cyan"><i className="bi bi-search"></i></span>
                                <input 
                                    type="text" 
                                    className="form-control bg-dark text-light border-secondary font-monospace" 
                                    placeholder="ENTER TARGET IDENTIFIER (IP, DOMAIN, PHONE, USERNAME)..."
                                    value={targetInput}
                                    onChange={(e) => setTargetInput(e.target.value)}
                                />
                                <button type="submit" className="btn btn-cyber" disabled={loading}>
                                    {loading ? 'SCANNING...' : 'INITIATE SCAN'}
                                </button>
                            </div>
                        </form>

                        {/* Analysis Result Display */}
                        {analysisResult && (
                            <div className="mt-4 text-start bg-black bg-opacity-50 p-4 rounded border border-secondary border-opacity-25 font-monospace">
                                {analysisResult.error ? (
                                    <div className="text-danger"><i className="bi bi-exclamation-triangle me-2"></i>{analysisResult.error}</div>
                                ) : (
                                    <>
                                        <div className="d-flex justify-content-between text-warning mb-3 border-bottom border-secondary pb-2">
                                            <span>CONFIDENCE: {analysisResult.intelligence_insight?.score}%</span>
                                            <span>STATUS: {analysisResult.intelligence_insight?.movement_detected ? 'MOVING' : 'STATIC'}</span>
                                        </div>
                                        <div className="mb-3">
                                            <span className="text-cyan">PRIMARY LOC:</span> {analysisResult.profile?.primary_location} <br/>
                                            <span className="text-cyan">ISP:</span> {analysisResult.profile?.primary_isp}
                                        </div>
                                        <div className="text-light fst-italic border-start border-3 border-info ps-3">
                                            "{analysisResult.intelligence_insight?.summary}"
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PHASE 1: RECONNAISSANCE */}
            <div className="row mb-5">
                <div className="col-12 mb-4">
                    <div className="d-flex align-items-center border-bottom border-cyan border-opacity-50 pb-2">
                        <i className="bi bi-binoculars text-cyan fs-2 me-3 text-glow"></i>
                        <div>
                            <h4 className="text-cyan text-glow font-cyber m-0">PHASE 1 // RECONNAISSANCE</h4>
                            <small className="text-secondary font-monospace">INITIAL DATA GATHERING & ENUMERATION</small>
                        </div>
                    </div>
                </div>
                
                {/* Network Intelligence */}
                <div className="col-md-6">
                    <Link to="/network" className="text-decoration-none">
                        <div className="cyber-card rounded-3 h-100 p-4 hover-effect">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="display-5 text-cyan"><i className="bi bi-globe2"></i></div>
                                <span className="badge bg-transparent border border-cyan text-cyan font-monospace">NET-INT</span>
                            </div>
                            <h5 className="fw-bold text-light mb-2 font-cyber">NETWORK INTELLIGENCE</h5>
                            <p className="text-secondary small mb-3 font-monospace">
                                Domain Ownership & Lifecycle Analysis. WHOIS Data, Creation Date, Expiry.
                            </p>
                            <div className="p-2 border-start border-3 border-cyan bg-black bg-opacity-25">
                                <small className="text-cyan fst-italic d-block">
                                    <i className="bi bi-lightbulb me-2"></i>
                                    Forensic: Sinkholing dead domains for traffic interception.
                                </small>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Tech Stack Analysis */}
                <div className="col-md-6">
                    <Link to="/tech-detect" className="text-decoration-none">
                        <div className="cyber-card rounded-3 h-100 p-4 hover-effect">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="display-5 text-cyan"><i className="bi bi-code-square"></i></div>
                                <span className="badge bg-transparent border border-cyan text-cyan font-monospace">TECH-SCAN</span>
                            </div>
                            <h5 className="fw-bold text-light mb-2 font-cyber">TECH STACK DETECTOR</h5>
                            <p className="text-secondary small mb-3 font-monospace">
                                Technology Fingerprinting. Server Detection, CMS, Frameworks, Security Headers.
                            </p>
                            <div className="p-2 border-start border-3 border-cyan bg-black bg-opacity-25">
                                <small className="text-cyan fst-italic d-block">
                                    <i className="bi bi-lightbulb me-2"></i>
                                    Forensic: Mapping system vulnerabilities & attack surface.
                                </small>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* PHASE 2: SURVEILLANCE */}
            <div className="row mb-5">
                <div className="col-12 mb-4">
                    <div className="d-flex align-items-center border-bottom border-warning border-opacity-50 pb-2">
                        <i className="bi bi-radar text-warning fs-2 me-3 text-glow"></i>
                        <div>
                            <h4 className="text-warning text-glow font-cyber m-0">PHASE 2 // SURVEILLANCE</h4>
                            <small className="text-secondary font-monospace">ACTIVE MONITORING & INTERCEPTION</small>
                        </div>
                    </div>
                </div>

                {/* Signal Interception */}
                <div className="col-md-6">
                    <Link to="/call-tracker" className="text-decoration-none">
                        <div className="cyber-card rounded-3 h-100 p-4 hover-effect border-warning" style={{boxShadow: '0 0 10px rgba(255, 193, 7, 0.1)'}}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="display-5 text-warning"><i className="bi bi-telephone-inbound"></i></div>
                                <span className="badge bg-transparent border border-warning text-warning font-monospace">SIG-INT</span>
                            </div>
                            <h5 className="fw-bold text-light mb-2 font-cyber">SIGNAL INTERCEPTOR</h5>
                            <p className="text-secondary small mb-3 font-monospace">
                                Cellular Network Tracking (HLR/CNAM). Real-time Provider & Location Analysis.
                            </p>
                            <div className="p-2 border-start border-3 border-warning bg-black bg-opacity-25">
                                <small className="text-warning fst-italic d-block">
                                    <i className="bi bi-lightbulb me-2"></i>
                                    Forensic: Identify BTS location & operational area.
                                </small>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* WhatsApp Monitor */}
                <div className="col-md-6">
                    <Link to="/whatsapp" className="text-decoration-none">
                        <div className="cyber-card rounded-3 h-100 p-4 hover-effect border-warning" style={{boxShadow: '0 0 10px rgba(255, 193, 7, 0.1)'}}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="display-5 text-warning"><i className="bi bi-whatsapp"></i></div>
                                <span className="badge bg-transparent border border-warning text-warning font-monospace">SOC-INT</span>
                            </div>
                            <h5 className="fw-bold text-light mb-2 font-cyber">WHATSAPP MONITOR</h5>
                            <p className="text-secondary small mb-3 font-monospace">
                                Real-time Online Status & Activity Pattern Analysis.
                            </p>
                            <div className="p-2 border-start border-3 border-warning bg-black bg-opacity-25">
                                <small className="text-warning fst-italic d-block">
                                    <i className="bi bi-lightbulb me-2"></i>
                                    Forensic: Pattern of Life (POL) analysis.
                                </small>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* PHASE 3: FORENSICS */}
            <div className="row mb-5">
                <div className="col-12 mb-4">
                    <div className="d-flex align-items-center border-bottom border-success border-opacity-50 pb-2">
                        <i className="bi bi-search text-success fs-2 me-3 text-glow"></i>
                        <div>
                            <h4 className="text-success text-glow font-cyber m-0">PHASE 3 // DIGITAL FORENSICS</h4>
                            <small className="text-secondary font-monospace">EVIDENCE EXTRACTION & PROFILING</small>
                        </div>
                    </div>
                </div>

                {/* Metadata Extractor */}
                <div className="col-md-6">
                    <Link to="/metadata" className="text-decoration-none">
                        <div className="cyber-card rounded-3 h-100 p-4 hover-effect border-success" style={{boxShadow: '0 0 10px rgba(25, 135, 84, 0.1)'}}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="display-5 text-success"><i className="bi bi-file-earmark-image"></i></div>
                                <span className="badge bg-transparent border border-success text-success font-monospace">META-DATA</span>
                            </div>
                            <h5 className="fw-bold text-light mb-2 font-cyber">METADATA EXTRACTOR</h5>
                            <p className="text-secondary small mb-3 font-monospace">
                                EXIF Extraction: GPS, Device Model, Timestamps from digital files.
                            </p>
                            <div className="p-2 border-start border-3 border-success bg-black bg-opacity-25">
                                <small className="text-success fst-italic d-block">
                                    <i className="bi bi-lightbulb me-2"></i>
                                    Forensic: Determine "Who, When, Where" of digital evidence.
                                </small>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* OSINT Tracker */}
                <div className="col-md-6">
                    <Link to="/osint" className="text-decoration-none">
                        <div className="cyber-card rounded-3 h-100 p-4 hover-effect border-success" style={{boxShadow: '0 0 10px rgba(25, 135, 84, 0.1)'}}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="display-5 text-success"><i className="bi bi-person-badge"></i></div>
                                <span className="badge bg-transparent border border-success text-success font-monospace">OSINT-SCAN</span>
                            </div>
                            <h5 className="fw-bold text-light mb-2 font-cyber">DIGITAL FOOTPRINT</h5>
                            <p className="text-secondary small mb-3 font-monospace">
                                Social Media Account Enumeration via Username (Sherlock Engine).
                            </p>
                            <div className="p-2 border-start border-3 border-success bg-black bg-opacity-25">
                                <small className="text-success fst-italic d-block">
                                    <i className="bi bi-lightbulb me-2"></i>
                                    Forensic: Target profiling via public digital footprint.
                                </small>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* PHASE 4: INTELLIGENCE FUSION */}
            <div className="row mb-5">
                <div className="col-12">
                    <div className="cyber-card rounded-3 p-0 overflow-hidden border-danger" style={{boxShadow: '0 0 20px rgba(220, 53, 69, 0.2)'}}>
                        <div className="bg-danger bg-opacity-10 p-3 border-bottom border-danger border-opacity-25 d-flex align-items-center">
                            <i className="bi bi-cpu-fill text-danger me-3 fs-4 animate-pulse-glow"></i>
                            <h5 className="m-0 text-danger font-cyber text-glow">PHASE 4 // AI INTELLIGENCE FUSION</h5>
                        </div>
                        <div className="p-5 text-center">
                            <h3 className="text-light fw-bold mb-3 font-cyber">GLOBAL DATA CORRELATION CENTER</h3>
                            <p className="text-secondary mb-4 mx-auto font-monospace" style={{maxWidth: '700px'}}>
                                Synthesize data from all investigation phases to generate risk profiles and predictive target movements.
                            </p>
                            
                            <button 
                                className="btn btn-cyber px-5 py-3 fw-bold" 
                                style={{background: 'linear-gradient(45deg, transparent 5%, var(--bs-danger) 5%)', borderColor: 'var(--bs-danger)', color: '#fff'}}
                                onClick={handleGlobalFusion}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span><span className="spinner-border spinner-border-sm me-2"></span> PROCESSING...</span>
                                ) : (
                                    <span><i className="bi bi-radioactive me-2"></i> INITIATE GLOBAL FUSION</span>
                                )}
                            </button>

                            {/* GLOBAL REPORT TABLE */}
                            {globalReport && (
                                <div className="mt-5 animate-fade-in text-start">
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover border-secondary font-monospace small bg-transparent">
                                            <thead className="border-bottom border-secondary">
                                                <tr className="text-secondary">
                                                    <th>RISK</th>
                                                    <th>TARGET</th>
                                                    <th>STATUS</th>
                                                    <th>LOCATION</th>
                                                    <th>ISP</th>
                                                    <th>INTERCEPTS</th>
                                                    <th>LAST SEEN</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {globalReport.map((item, idx) => (
                                                    <tr key={idx} className="align-middle">
                                                        <td className={`fw-bold text-center ${item.score > 70 ? 'text-danger' : 'text-warning'}`}>
                                                            {item.score}%
                                                        </td>
                                                        <td className="text-cyan">{item.target}</td>
                                                        <td>
                                                            <span className={`badge ${item.status === 'MOVING' ? 'bg-danger' : 'bg-success'} bg-opacity-10 text-${item.status === 'MOVING' ? 'danger' : 'success'} border border-${item.status === 'MOVING' ? 'danger' : 'success'}`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td>{item.primary_location}</td>
                                                        <td>{item.isp}</td>
                                                        <td className="text-center">{item.total_intercepts}</td>
                                                        <td className="text-secondary">{new Date(item.last_seen).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                {globalReport.length === 0 && (
                                                    <tr>
                                                        <td colSpan="7" className="text-center text-secondary py-4">
                                                            NO INTELLIGENCE DATA FOUND.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* SAVED REPORTS SECTION */}
            <div className="row mb-5">
                <div className="col-12">
                    <div className="d-flex align-items-center mb-4 border-bottom border-secondary border-opacity-50 pb-2">
                        <i className="bi bi-archive-fill text-secondary me-3 fs-3"></i>
                        <h4 className="text-light text-uppercase m-0 font-cyber">ARCHIVED INTELLIGENCE</h4>
                    </div>
                    
                    <div className="cyber-card rounded-3 p-0 overflow-hidden">
                        <div className="table-responsive">
                            <table className="table table-dark table-hover mb-0 font-monospace small bg-transparent">
                                <thead className="bg-black text-secondary">
                                    <tr>
                                        <th className="py-3 ps-4">TIMESTAMP</th>
                                        <th className="py-3">SOURCE</th>
                                        <th className="py-3">TARGET ID</th>
                                        <th className="py-3">NOTES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {savedReports.length > 0 ? (
                                        savedReports.map((report) => (
                                            <tr key={report.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                                <td className="ps-4 text-secondary">{new Date(report.created_at).toLocaleString()}</td>
                                                <td><span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">{report.source_type}</span></td>
                                                <td className="text-warning">{report.target}</td>
                                                <td className="text-light opacity-75">{report.notes}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center text-secondary py-5">
                                                <i className="bi bi-inbox fs-1 d-block mb-3 opacity-25"></i>
                                                ARCHIVE EMPTY.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="text-center text-secondary opacity-50 small mt-5 font-monospace">
                SYSTEM STATUS: ONLINE | SECURE CONNECTION ESTABLISHED <br/>
                CyberIntel Dashboard v2.0 - Indonesia Region
            </div>
        </div>
    );
};

export default DashboardPage;