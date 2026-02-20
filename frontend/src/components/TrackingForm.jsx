import React from 'react';

const TrackingForm = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  runForensicAnalysis, 
  loading, 
  error 
}) => {
  return (
    <div>
      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger text-center font-cyber" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <div className="form-group">
          <input
            type="text"
            className="cyber-input text-cyan border-cyan fw-bold"
            name="phone_number"
            placeholder="PHONE NUMBER (e.g. +62812...)"
            value={formData.phone_number}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="cyber-input text-light border-secondary"
            name="ip_address"
            placeholder="IP ADDRESS (Optional)"
            value={formData.ip_address}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="cyber-input text-light border-secondary"
            name="notes"
            placeholder="MISSION NOTES"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
        <div className="form-group border-top border-secondary border-opacity-25 pt-2">
           <small className="text-secondary mb-1 d-block font-monospace" style={{fontSize: '0.75rem'}}>ADVANCED: EXCLUDE LOCAL IP (OPTIONAL)</small>
           <input
            type="text"
            className="cyber-input text-warning border-secondary font-monospace"
            name="excluded_ip"
            placeholder="ENTER YOUR IP TO EXCLUDE (e.g. 192.168.1.5)"
            value={formData.excluded_ip || ''}
            onChange={handleChange}
            style={{fontSize: '0.85rem'}}
          />
        </div>

        {formData.phone_number && (
          <div className="mb-2">
            <a 
              href={`https://wa.me/${formData.phone_number.replace(/\D/g, '').startsWith('0') ? '62' + formData.phone_number.replace(/\D/g, '').substring(1) : formData.phone_number.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-decoration-none small text-success font-monospace"
            >
              <i className="bi bi-whatsapp me-1"></i> Open WhatsApp Chat Manually
            </a>
          </div>
        )}

        <div className="d-flex gap-2">
          <button type="submit" disabled={loading} className="btn btn-cyber flex-grow-1" style={{background: 'linear-gradient(45deg, transparent 5%, var(--cyan-dim) 5%)', color: '#fff'}}>
            <i className="bi bi-plus-lg me-2"></i>
            {loading ? 'PROCESSING...' : 'ADD LOG & AUTO LOOKUP'}
          </button>
          <button 
            type="button" 
            onClick={runForensicAnalysis}
            disabled={loading}
            className="btn btn-cyber flex-grow-1"
            style={{background: 'linear-gradient(45deg, transparent 5%, var(--bs-danger) 5%)', color: '#fff', borderColor: 'var(--bs-danger)'}}
          >
            <span className="me-2">🕵️</span> FORENSIC SCAN
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrackingForm;
