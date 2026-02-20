import React from 'react';

const CallList = ({ calls, onDelete }) => {
  return (
    <table className="table table-dark table-hover mb-0" style={{background: 'transparent'}}>
      <thead>
        <tr className="border-bottom border-secondary border-opacity-50">
          <th className="text-cyan text-glow">Phone Number</th>
          <th className="text-cyan text-glow">Time</th>
          <th className="text-cyan text-glow">IP Address</th>
          <th className="text-cyan text-glow">Location</th>
          <th className="text-cyan text-glow">Provider</th>
          <th className="text-cyan text-glow">Notes</th>
          <th className="text-cyan text-glow">Action</th>
        </tr>
      </thead>
      <tbody>
        {calls.map((call) => (
          <tr key={call.id} style={{borderColor: 'rgba(255,255,255,0.1)'}}>
            <td className="font-monospace text-light">{call.phone_number}</td>
            <td className="small text-secondary">{new Date(call.call_time).toLocaleString()}</td>
            <td className="font-monospace text-info">{call.ip_address || '-'}</td>
            <td>
              <span className="text-light">{call.city && call.country ? `${call.city}, ${call.country}` : (call.country || call.city || '-')}</span>
              {call.latitude && call.longitude && (
                  <div style={{ marginTop: '4px', fontSize: '0.85em' }}>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${call.provider || ''} ${call.city || ''} ${call.country || ''}`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan text-decoration-none hover-glow"
                    >
                      <i className="bi bi-geo-alt-fill me-1"></i> View ISP Map
                    </a>
                  </div>
               )}
            </td>
            <td><span className="badge bg-dark border border-secondary text-info">{call.provider || '-'}</span></td>
            <td className="text-secondary small">{call.notes || '-'}</td>
            <td>
              <button 
                onClick={() => onDelete(call.id)}
                className="btn btn-sm btn-outline-danger"
                style={{borderColor: '#ff2a6d', color: '#ff2a6d'}}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
        {calls.length === 0 && (
            <tr>
                <td colSpan="7" className="text-center text-secondary py-4 fst-italic">No call logs found in the secure archive.</td>
            </tr>
        )}
      </tbody>
    </table>
  );
};

export default CallList;
