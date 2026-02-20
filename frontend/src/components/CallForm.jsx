import React from 'react';
import ForensicTerminal from './ForensicTerminal';

const CallForm = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  runForensicAnalysis, 
  loading, 
  error,
  logs,
  forensicData
}) => {
  return (
    <div className="cyber-card p-4">
      <h2 className="text-cyan text-glow mb-4">Simulate Incoming Call / Manual Entry</h2>
      {error && <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger" style={{marginBottom: '10px', whiteSpace: 'pre-wrap'}}>{error}</div>}
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <input
          type="text"
          name="phone_number"
          className="form-control bg-dark text-light border-secondary"
          style={{background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(0, 243, 255, 0.2)'}}
          placeholder="Phone Number (e.g. +62812...)"
          value={formData.phone_number}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="ip_address"
          className="form-control bg-dark text-light border-secondary"
          style={{background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(0, 243, 255, 0.2)'}}
          placeholder="IP Address (Optional)"
          value={formData.ip_address}
          onChange={handleChange}
        />
        <input
          type="text"
          name="notes"
          className="form-control bg-dark text-light border-secondary"
          style={{background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(0, 243, 255, 0.2)'}}
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
        />
        <div style={{display: 'flex', gap: '10px'}}>
          <button type="submit" disabled={loading} style={{flex: 1}} className="btn btn-cyber">
            {loading ? 'Processing...' : 'Add Log & Auto Lookup'}
          </button>
          <button 
            type="button" 
            onClick={runForensicAnalysis}
            disabled={loading}
            style={{flex: 1, borderColor: '#ff2a6d', color: '#ff2a6d'}}
            className="btn btn-outline-danger"
          >
            🕵️ Forensic Scan
          </button>
        </div>
      </form>

      {/* TERMINAL UI */}
      <div className="mt-4">
        <ForensicTerminal logs={logs} forensicData={forensicData} />
      </div>
    </div>
  );
};

export default CallForm;
