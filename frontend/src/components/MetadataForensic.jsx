import React, { useState } from 'react';
import api, { saveReportApi } from '../services/api';

const MetadataForensic = () => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!metadata || !file) return;
    setSaving(true);
    try {
        await saveReportApi({
            target: file.name,
            source_type: 'METADATA',
            data: metadata,
            risk_score: 0,
            notes: `Metadata analysis for ${file.name}`
        });
        alert('Report saved successfully!');
    } catch (err) {
        console.error("Failed to save report:", err);
        alert('Failed to save report.');
    } finally {
        setSaving(false);
    }
  };

  const isWhatsAppImage = () => {
    if (!file) return false;
    return file.name.includes('WA') || file.name.toLowerCase().includes('whatsapp');
  };

  const filteredMetadata = metadata ? Object.entries(metadata).filter(([key, value]) => {
    const term = searchTerm.toLowerCase();
    return key.toLowerCase().includes(term) || String(value).toLowerCase().includes(term);
  }) : [];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setMetadata(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/calls/metadata_scan/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMetadata(response.data.metadata);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.response?.data?.error || "Failed to analyze image. Ensure ExifTool is configured.");
    } finally {
      setLoading(false);
    }
  };

  const renderMapLink = () => {
    if (!metadata) return null;
    
    const parseCoord = (val) => {
        if (!val) return null;
        if (typeof val === 'string' && val.includes('|')) {
            return val.split('|')[0].trim();
        }
        return val;
    };

    const latRaw = metadata['GPS Latitude'] || metadata['GPS Latitude (1)'] || metadata.GPSLatitude;
    const longRaw = metadata['GPS Longitude'] || metadata['GPS Longitude (1)'] || metadata.GPSLongitude;

    const lat = parseCoord(latRaw);
    const long = parseCoord(longRaw);

    if (lat && long) {
        return (
            <div className="hud-panel success p-4 mb-4">
                <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-geo-alt-fill text-green fs-2 me-3 text-glow"></i>
                    <div>
                        <h4 className="text-green text-glow m-0 font-cyber">GPS LOCATION ACQUIRED</h4>
                        <small className="text-secondary font-cyber">COORDINATES EXTRACTED</small>
                    </div>
                </div>
                <div className="row font-monospace text-light mb-3">
                    <div className="col-6 border-end border-secondary border-opacity-25">
                        <span className="text-secondary small d-block">LATITUDE</span>
                        {lat}
                    </div>
                    <div className="col-6">
                        <span className="text-secondary small d-block">LONGITUDE</span>
                        {long}
                    </div>
                </div>
                <a 
                    href={`https://www.google.com/maps?q=${lat},${long}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-cyber w-100"
                    style={{background: 'linear-gradient(45deg, transparent 5%, var(--green-glow) 5%)', color: '#000'}}
                >
                    <i className="bi bi-map-fill me-2"></i> OPEN SATELLITE MAP
                </a>
            </div>
        );
    }
    
    // Fallback: Cek jika ada GPS Position (format: "lat, long" atau "lat long")
    const gpsPosRaw = metadata['GPS Position'] || metadata.GPSPosition;
    const gpsPos = parseCoord(gpsPosRaw);

    if (gpsPos) {
        const cleanPos = gpsPos.replace(' deg', '').replace(/"/g, ''); 
        
        return (
            <div className="hud-panel success p-4 mb-4">
                 <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-geo-alt-fill text-green fs-2 me-3 text-glow"></i>
                    <div>
                        <h4 className="text-green text-glow m-0 font-cyber">GPS LOCATION (COMPOSITE)</h4>
                        <small className="text-secondary font-cyber">RAW POSITION DATA FOUND</small>
                    </div>
                </div>
                <p className="font-monospace text-light mb-3 p-2 bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded">{gpsPos}</p>
                <a 
                    href={`https://www.google.com/maps?q=${cleanPos}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-cyber w-100"
                    style={{background: 'linear-gradient(45deg, transparent 5%, var(--green-glow) 5%)', color: '#000'}}
                >
                    <i className="bi bi-map-fill me-2"></i> OPEN SATELLITE MAP
                </a>
            </div>
        );
    }

    return (
        <div className="hud-panel p-4 mb-4 border-secondary border-opacity-25">
            <div className="d-flex align-items-center">
                <i className="bi bi-slash-circle text-secondary fs-2 me-3"></i>
                <div>
                    <h5 className="text-secondary font-cyber m-0">NO GPS DATA FOUND</h5>
                    <p className="mb-0 small text-muted">
                        This image does not contain geolocation metadata. 
                        Location might be disabled or stripped (e.g. WhatsApp/Social Media).
                    </p>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="container-fluid">
        <div className="mb-5 text-center">
            <h2 className="section-title text-info text-glow display-6 font-cyber">
                <i className="bi bi-file-earmark-binary me-3"></i>METADATA EXTRACTOR
            </h2>
            <p className="text-secondary font-cyber lead">
                FORENSIC ANALYSIS // EXIF DATA // HIDDEN INFORMATION
            </p>
        </div>

        <div className="row justify-content-center mb-5">
            <div className="col-lg-8">
                <div className="hud-panel p-4">
                    <div className="mb-3">
                         <label className="form-label text-info font-cyber">SELECT TARGET FILE</label>
                         <div className="input-group">
                            <input 
                              type="file" 
                              className="form-control bg-dark text-light border-secondary font-monospace"
                              style={{borderColor: 'var(--border-glass)', backgroundColor: 'rgba(0,0,0,0.5)'}}
                              onChange={handleFileChange} 
                              accept="image/*"
                            />
                            <button 
                              onClick={handleAnalyze} 
                              disabled={!file || loading}
                              className="btn btn-cyber"
                            >
                              {loading ? (
                                <span><span className="spinner-border spinner-border-sm me-2"></span>ANALYZING...</span>
                              ) : (
                                <span><i className="bi bi-search me-2"></i>EXTRACT DATA</span>
                              )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger text-center font-cyber" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> ERROR: {error}
        </div>
      )}

      {metadata && (
        <div className="results-container animate-pulse-glow">
            
          <div className="row">
            <div className="col-lg-4 mb-4">
                {renderMapLink()}

                {isWhatsAppImage() && (
                    <div className="hud-panel p-4 mb-4 border-warning">
                        <h4 className="text-warning text-glow font-cyber mb-3"><i className="bi bi-whatsapp"></i> WHATSAPP DETECTED</h4>
                        <p className="small mb-0 text-light opacity-75">
                            File source identified as WhatsApp. <br/>
                            <strong className="text-warning">WARNING:</strong> WhatsApp automatically strips GPS metadata for privacy. 
                            Geolocation data is likely irretrievable from this specific file.
                        </p>
                    </div>
                )}
            </div>

            <div className="col-lg-8">
                <div className="hud-panel h-100">
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
                        <h4 className="text-info text-glow font-cyber m-0">
                            <i className="bi bi-list-columns-reverse me-2"></i>METADATA TAGS
                        </h4>
                        <span className="badge bg-dark border border-info text-info font-monospace">
                            {filteredMetadata.length} TAGS FOUND
                        </span>
                    </div>

                    <div className="mb-4">
                        <div className="cyber-input-group">
                            <i className="bi bi-funnel text-secondary me-3"></i>
                            <input 
                              type="text" 
                              className="cyber-input pt-2 pb-2"
                              placeholder="FILTER TAGS (e.g. 'Model', 'Date')..." 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="table-responsive" style={{maxHeight: '600px', overflowY: 'auto'}}>
                        <table className="table table-dark table-hover table-borderless table-striped bg-transparent font-monospace small">
                            <thead className="sticky-top bg-black">
                                <tr className="border-bottom border-secondary text-secondary font-cyber">
                                    <th style={{width: '40%'}}>TAG NAME</th>
                                    <th>VALUE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMetadata.map(([key, value], idx) => (
                                    <tr key={idx}>
                                        <td className="text-info opacity-75">{key}</td>
                                        <td className="text-light text-break">{String(value)}</td>
                                    </tr>
                                ))}
                                {filteredMetadata.length === 0 && (
                                    <tr>
                                        <td colSpan="2" className="text-center text-muted py-4">
                                            No metadata tags match your filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-4 text-end">
                        <button 
                            className="btn btn-cyber-outline"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <i className="bi bi-save me-2"></i>
                            {saving ? 'SAVING REPORT...' : 'SAVE ANALYSIS REPORT'}
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetadataForensic;
