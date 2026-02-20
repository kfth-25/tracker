import React from 'react';
import OsintTracker from '../components/OsintTracker';

const OsintPage = () => {
    return (
        <div className="container-fluid mt-4">
            
            {/* Tutorial Section */}
            <div className="hud-panel mb-4 p-0">
                <div className="d-flex align-items-center p-3 border-bottom border-secondary border-opacity-25" 
                     data-bs-toggle="collapse" 
                     data-bs-target="#osintTutorialCollapse" 
                     style={{cursor: 'pointer', background: 'rgba(0,0,0,0.2)'}}>
                    <i className="bi bi-info-circle text-warning fs-4 me-3"></i>
                    <h5 className="mb-0 text-warning font-cyber text-uppercase">Operational Guide // Digital Footprint</h5>
                    <i className="bi bi-chevron-down ms-auto text-secondary"></i>
                </div>
                <div className="collapse show" id="osintTutorialCollapse">
                    <div className="p-4">
                        <div className="row">
                            <div className="col-md-6 border-end border-secondary border-opacity-25">
                                <h6 className="text-warning font-cyber fw-bold mb-3 text-uppercase">
                                    <i className="bi bi-search me-2"></i>Target Acquisition
                                </h6>
                                <ol className="small text-secondary font-monospace">
                                    <li className="mb-2">INPUT TARGET <strong>USERNAME</strong> (e.g. <code>target_user</code>).</li>
                                    <li className="mb-2">INITIATE <strong>SCAN SEQUENCE</strong>.</li>
                                    <li className="mb-2">SYSTEM PERFORMS CROSS-PLATFORM ENUMERATION (5-10s).</li>
                                    <li>VERIFY MATCHES VIA DIRECT LINK ACCESS.</li>
                                </ol>
                            </div>
                            <div className="col-md-6 ps-md-4">
                                <h6 className="text-warning font-cyber fw-bold mb-3 text-uppercase">
                                    <i className="bi bi-shield-exclamation me-2"></i>Mission Constraints
                                </h6>
                                <ul className="small text-secondary font-monospace list-unstyled">
                                    <li className="mb-2"><i className="bi bi-check2-square text-success me-2"></i><strong>LEGAL:</strong> OPEN SOURCE INTELLIGENCE (OSINT) ONLY.</li>
                                    <li className="mb-2"><i className="bi bi-exclamation-triangle text-warning me-2"></i><strong>VALIDATION:</strong> MANUAL VERIFICATION REQUIRED.</li>
                                    <li><i className="bi bi-incognito text-info me-2"></i><strong>PRIVACY:</strong> NO DATA PERSISTENCE.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tracker Component */}
            <OsintTracker />
        </div>
    );
};

export default OsintPage;
