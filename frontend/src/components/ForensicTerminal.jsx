import React from 'react';

const ForensicTerminal = ({ logs, forensicData }) => {
  // Calculate Max Score and find ties
  const maxScore = forensicData && forensicData.candidates && forensicData.candidates.length > 0
      ? Math.max(...forensicData.candidates.map(c => Number(c.score)))
      : 0;

  const tiedCandidates = forensicData && forensicData.candidates
      ? forensicData.candidates.filter(c => Number(c.score) === maxScore && c.ip !== '0.0.0.0')
      : [];

  if (logs.length === 0) return (
      <div className="text-center text-muted p-4">
          <small>Terminal Ready. Waiting for input...</small>
      </div>
  );

  return (
    <div className="bg-black text-success p-3 font-monospace h-100 overflow-auto border border-secondary border-opacity-25 rounded" style={{ maxHeight: '300px', background: 'rgba(0,0,0,0.8)' }}>
      {logs.map((log, i) => <div key={i} className="text-success text-opacity-75">{log}</div>)}
      
      {forensicData && (
        <div className="mt-3 border-top border-success border-opacity-50 pt-3">
          
          {/* Candidate List - Prominent Display */}
          {forensicData.candidates && forensicData.candidates.length > 0 && (
            <div className="mb-4">
               <div className="text-light bg-danger bg-opacity-25 border border-danger px-2 py-1 mb-2 d-inline-block fw-bold font-cyber">
                 ⚠️ DETECTED TRAFFIC CANDIDATES
               </div>
               <div className="table-responsive">
                 <table className="table table-dark table-sm table-bordered border-secondary font-monospace bg-transparent" style={{fontSize: '0.85rem'}}>
                   <thead>
                     <tr className="text-secondary">
                       <th>RANK</th>
                       <th>IP ADDRESS</th>
                       <th>PACKET TYPE (STATUS)</th>
                       <th>SCORE</th>
                     </tr>
                   </thead>
                   <tbody>
                   {forensicData.candidates.map((cand, idx) => {
                      const isTied = Number(cand.score) === maxScore && cand.ip !== '0.0.0.0';
                      return (
                      <React.Fragment key={idx}>
                      <tr className={isTied ? 'table-active border-warning' : ''} style={{background: 'transparent'}}>
                        <td className="text-center">{idx + 1}</td>
                        <td className={cand.ip === '0.0.0.0' ? 'text-danger fw-bold' : (isTied ? 'text-warning fw-bold' : 'text-cyan')}>
                            {cand.ip} {cand.ip === '0.0.0.0' && <i className="bi bi-x-circle ms-1" title="Invalid IP"></i>}
                        </td>
                        <td className={cand.type.includes('STUN') ? 'text-success' : 'text-secondary'}>
                          {cand.type}
                        </td>
                        <td className="text-end">{cand.score}</td>
                      </tr>
                      {/* Show Location Details for Top 3 */}
                      {idx < 3 && cand.location && (
                          <tr className={isTied ? 'table-active border-warning' : ''} style={{background: 'transparent', borderTop: 'none'}}>
                              <td></td>
                              <td colSpan="3" className="ps-3 pb-2 pt-0">
                                  <div className="d-flex align-items-center small text-secondary">
                                      <i className="bi bi-geo-alt me-1 text-primary"></i>
                                      <span className="me-3">{cand.location.city}, {cand.location.country}</span>
                                      <i className="bi bi-router me-1 text-info"></i>
                                      <span className="text-info">{cand.location.isp}</span>
                                  </div>
                              </td>
                          </tr>
                      )}
                      </React.Fragment>
                      );
                   })}
                   </tbody>
                 </table>
               </div>
               <div className="text-secondary small fst-italic border-start border-3 border-cyan ps-2">
                  <span className="text-cyan fw-bold">ANALYSIS:</span> Top ranked IP (#1) is the most likely target based on packet volume and type (STUN Binding).
               </div>
            </div>
          )}

          <div className="mt-3">
            <div className="h5 text-light border-bottom border-secondary border-opacity-50 pb-1 font-cyber">FINAL CONCLUSION</div>
            
            {tiedCandidates.length > 1 && (
                 <div className="mb-3 p-2 border border-warning bg-warning bg-opacity-10 rounded">
                     <div className="text-warning fw-bold mb-1 font-monospace"><i className="bi bi-exclamation-triangle me-2"></i>MULTIPLE HIGH-CONFIDENCE TARGETS ({tiedCandidates.length})</div>
                     {tiedCandidates.map((c, i) => (
                         <div key={i} className="text-light ms-3 font-monospace">
                             <span className="text-warning"></span> {c.ip} <span className="text-muted small">({c.type}) - SCORE: {c.score}</span>
                         </div>
                     ))}
                     <div className="mt-2 text-secondary small fst-italic ms-1">
                        *Displaying location for primary selection below.
                     </div>
                 </div>
            )}

            <div>[RESULT] IP DETECTED: <span className="text-warning fw-bold fs-5 text-glow">{forensicData.detected_ip}</span></div>
            <div>[RESULT] PROTOCOL: {forensicData.protocol}</div>

          {forensicData.location && (
            <div>
              [RESULT] GEO: {forensicData.location.city}, {forensicData.location.country} ({forensicData.location.isp})
              {forensicData.location.lat && forensicData.location.lon && (
                <div className="mt-2">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${forensicData.location.isp} ${forensicData.location.city} ${forensicData.location.country}`)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan text-decoration-none hover-glow"
                  >
                    [VIEW ISP LOCATION ON MAP]
                  </a>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForensicTerminal;
