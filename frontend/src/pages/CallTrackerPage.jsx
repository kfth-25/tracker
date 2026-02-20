import React from 'react';
import TrackingForm from '../components/TrackingForm';
import ForensicTerminal from '../components/ForensicTerminal';
import CallList from '../components/CallList';
import { useTracker } from '../hooks/useTracker';

const CallTrackerPage = () => {
  const {
    calls,
    formData,
    error,
    loading,
    forensicData,
    logs,
    handleChange,
    handleSubmit,
    runForensicAnalysis,
    handleDelete
  } = useTracker();

  return (
    <div className="container-fluid mt-4">
      <div className="mb-5 text-center">
          <h2 className="section-title text-cyan text-glow display-6 font-cyber">
              <i className="bi bi-broadcast me-3"></i>SIGNAL INTERCEPTOR
          </h2>
          <p className="text-secondary font-cyber lead">
              SURVEILLANCE // TRACKING SYSTEM // ACTIVE MONITORING
          </p>
      </div>
      
      {/* Tutorial Section */}
      <div className="hud-panel mb-4 p-0">
        <div className="d-flex align-items-center p-3 border-bottom border-secondary border-opacity-25" 
             data-bs-toggle="collapse" 
             data-bs-target="#tutorialCollapse" 
             style={{cursor: 'pointer', background: 'rgba(0,0,0,0.2)'}}>
          <i className="bi bi-info-circle text-cyan fs-4 me-3"></i>
          <h5 className="mb-0 text-cyan font-cyber text-uppercase">Operational Guide // Signal Tracking</h5>
          <i className="bi bi-chevron-down ms-auto text-secondary"></i>
        </div>
        <div className="collapse show" id="tutorialCollapse">
          <div className="p-4">
            <div className="row">
              <div className="col-md-6 border-end border-secondary border-opacity-25">
                <h6 className="text-light font-cyber fw-bold mb-3 text-uppercase">
                    <i className="bi bi-broadcast-pin me-2 text-cyan"></i>Target Acquisition
                </h6>
                <ol className="small text-secondary font-monospace">
                  <li className="mb-2">INPUT TARGET <strong>PHONE NUMBER</strong> (Format: <code>+62812...</code>).</li>
                  <li className="mb-2">OPTIONAL: ADD <strong>IP ADDRESS</strong> OR <strong>MISSION NOTES</strong>.</li>
                  <li className="mb-2">EXECUTE <span className="text-danger fw-bold">FORENSIC SCAN</span> FOR DEEP ANALYSIS (HLR/Location).</li>
                  <li>MONITOR REAL-TIME DATA IN <strong>FORENSIC TERMINAL</strong>.</li>
                </ol>
              </div>
              <div className="col-md-6 ps-md-4">
                <h6 className="text-light font-cyber fw-bold mb-3 text-uppercase">
                    <i className="bi bi-sliders me-2 text-cyan"></i>System Capabilities
                </h6>
                <ul className="small text-secondary font-monospace list-unstyled">
                  <li className="mb-2"><strong className="text-cyan">[ADD LOG]</strong>: DISCREET DATABASE ENTRY (PASSIVE).</li>
                  <li className="mb-2"><strong className="text-cyan">[OPEN MAP]</strong>: VISUALIZE GEOLOCATION DATA.</li>
                  <li><strong className="text-cyan">[LOGS]</strong>: PERSISTENT INTERCEPTION HISTORY.</li>
                </ul>
              </div>
              
              <div className="col-12 mt-3 border-top border-secondary border-opacity-25 pt-3">
                <h6 className="text-warning font-cyber text-uppercase"><i className="bi bi-shield-lock me-2"></i>Dynamic IP Advisory</h6>
                <p className="small text-secondary mb-2 font-monospace">
                  DETECTED IP ADDRESSES MAY VARY DUE TO CARRIER NAT/DYNAMIC ALLOCATION.
                </p>
                <div className="row small text-secondary font-monospace">
                  <div className="col-md-4">
                    <strong className="text-cyan">:: DYNAMIC ALLOCATION ::</strong><br/>
                    ISP ROTATES PUBLIC IP ON SESSION RESET.
                  </div>
                  <div className="col-md-4">
                    <strong className="text-cyan">:: NAT GATEWAY ::</strong><br/>
                    CONNECTION ROUTING VARIES BY NETWORK LOAD.
                  </div>
                  <div className="col-md-4">
                    <strong className="text-success">:: VALIDATION ::</strong><br/>
                    PROVIDER & GEO-LOCATION REMAIN CONSISTENT.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
            <div className="hud-panel h-100">
                <div className="d-flex align-items-center mb-4 border-bottom border-cyan border-opacity-50 pb-3">
                    <i className="bi bi-input-cursor-text text-cyan fs-3 me-3"></i>
                    <div>
                        <h4 className="text-cyan text-glow font-cyber m-0">TRACKING MODULE</h4>
                        <small className="text-secondary font-monospace">MANUAL DATA ENTRY // SCAN INITIATION</small>
                    </div>
                </div>
                <div className="card-body">
                    <TrackingForm 
                        formData={formData}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        runForensicAnalysis={runForensicAnalysis}
                        loading={loading}
                        error={error}
                    />
                </div>
            </div>
        </div>
        
        <div className="col-lg-6 mb-4">
            <div className="hud-panel h-100">
                <div className="d-flex align-items-center mb-4 border-bottom border-cyan border-opacity-50 pb-3">
                    <i className="bi bi-terminal text-cyan fs-3 me-3"></i>
                    <div>
                        <h4 className="text-cyan text-glow font-cyber m-0">FORENSIC TERMINAL</h4>
                        <small className="text-secondary font-monospace">REAL-TIME OUTPUT // SYSTEM LOGS</small> 
                    </div>
                </div>
                <div className="card-body p-0">
                    <ForensicTerminal 
                        logs={logs}
                        forensicData={forensicData}
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="hud-panel mt-4">
        <div className="d-flex align-items-center mb-4 border-bottom border-cyan border-opacity-50 pb-3">
            <i className="bi bi-list-columns-reverse text-cyan fs-3 me-3"></i>
            <div>
                <h4 className="text-cyan text-glow font-cyber m-0">INTERCEPTION LOGS</h4>
                <small className="text-secondary font-monospace">HISTORICAL DATA // SECURE ARCHIVE</small>
            </div>
        </div>
        <div className="card-body p-0">
            <div className="table-responsive">
                <CallList calls={calls} onDelete={handleDelete} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default CallTrackerPage;
