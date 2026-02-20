import React, { useState, useEffect } from 'react';
import { fetchDossiersApi, createDossierApi, updateDossierApi, deleteDossierApi } from '../services/api';

const IntelligenceDashboard = () => {
    const [dossiers, setDossiers] = useState([]);
    const [selectedDossier, setSelectedDossier] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadDossiers();
    }, []);

    const loadDossiers = async () => {
        setLoading(true);
        try {
            const data = await fetchDossiersApi();
            setDossiers(data);
        } catch (err) {
            console.error("Failed to load dossiers", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('PERMANENTLY DELETE TARGET DOSSIER? This action cannot be undone.')) return;
        try {
            await deleteDossierApi(id);
            if (selectedDossier && selectedDossier.id === id) setSelectedDossier(null);
            loadDossiers();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleUpdate = async (id, data) => {
        try {
            const updated = await updateDossierApi(id, data);
            setSelectedDossier(updated);
            loadDossiers();
        } catch (err) {
            console.error(err);
        }
    };

    // --- COMPONENT: WIZARD FORM (NEW) ---
    const DossierWizard = ({ onClose, onSuccess }) => {
        const [step, setStep] = useState(1);
        const [data, setData] = useState({
            codename: '',
            full_name: '',
            alias: '',
            dob: '',
            nationality: '',
            occupation: '',
            phone_primary: '',
            email_primary: '',
            status: 'ACTIVE',
            threat_level: 10,
            influence_score: 10,
            technical_skill: 10,
            notes: ''
        });

        // Assessment Logic
        const [assessment, setAssessment] = useState({
            isArmed: false,
            isHacker: false,
            isLeader: false,
            hasCriminalRecord: false,
            usesEncryption: false,
            isRich: false
        });

        // Auto-calculate scores when assessment changes
        useEffect(() => {
            let t = 10, i = 10, s = 10;
            if (assessment.isArmed) t += 40;
            if (assessment.hasCriminalRecord) t += 30;
            
            if (assessment.isHacker) { s += 60; t += 10; }
            if (assessment.usesEncryption) s += 30;
            
            if (assessment.isLeader) i += 50;
            if (assessment.isRich) i += 30;

            // Cap at 100
            setData(prev => ({
                ...prev,
                threat_level: Math.min(100, t),
                technical_skill: Math.min(100, s),
                influence_score: Math.min(100, i)
            }));
        }, [assessment]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                // Sanitize Payload
                const payload = { ...data };
                if (payload.dob === '') payload.dob = null;

                await createDossierApi(payload);
                onSuccess();
            } catch (err) {
                console.error(err);
                alert('Creation failed: ' + (err.response?.data?.detail || err.message));
            }
        };

        return (
            <div className="cyber-card p-0 mb-4 border border-success animate__animated animate__fadeInDown position-relative">
                <button className="btn btn-sm btn-link text-secondary position-absolute top-0 end-0 m-2" onClick={onClose}><i className="bi bi-x-lg"></i></button>
                
                {/* Wizard Header */}
                <div className="bg-dark p-3 border-bottom border-success border-opacity-25 d-flex justify-content-between align-items-center">
                    <h5 className="text-success m-0 font-monospace"><i className="bi bi-person-plus-fill me-2"></i>NEW TARGET PROTOCOL</h5>
                    <div className="small text-muted">STEP {step} / 3</div>
                </div>

                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        {/* STEP 1: IDENTITY */}
                        {step === 1 && (
                            <div className="animate__animated animate__fadeIn">
                                <h6 className="text-light border-bottom border-secondary pb-2 mb-3">1. IDENTITY PROFILE</h6>
                                
                                <div className="mb-3">
                                    <label className="form-label text-success small fw-bold">CODENAME (REQUIRED)</label>
                                    <input type="text" className="form-control bg-black text-light border-success" 
                                        placeholder="e.g. RED_BARON" 
                                        value={data.codename} 
                                        onChange={e => setData({...data, codename: e.target.value.toUpperCase()})}
                                        required 
                                    />
                                    <div className="form-text text-muted small fst-italic">
                                        *Unique identifier used for encrypted database references. Use ALL CAPS.
                                    </div>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label text-secondary small">FULL NAME</label>
                                        <input type="text" className="form-control bg-dark text-light border-secondary" 
                                            placeholder="Real Identity" 
                                            value={data.full_name} 
                                            onChange={e => setData({...data, full_name: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-secondary small">ALIAS / AKA</label>
                                        <input type="text" className="form-control bg-dark text-light border-secondary" 
                                            placeholder="Known Aliases" 
                                            value={data.alias} 
                                            onChange={e => setData({...data, alias: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-secondary small">DATE OF BIRTH</label>
                                        <input type="date" className="form-control bg-dark text-light border-secondary" 
                                            value={data.dob} 
                                            onChange={e => setData({...data, dob: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-secondary small">NATIONALITY</label>
                                        <input type="text" className="form-control bg-dark text-light border-secondary" 
                                            placeholder="Country of Origin" 
                                            value={data.nationality} 
                                            onChange={e => setData({...data, nationality: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-secondary small">OCCUPATION</label>
                                        <input type="text" className="form-control bg-dark text-light border-secondary" 
                                            placeholder="Cover or Real Job" 
                                            value={data.occupation} 
                                            onChange={e => setData({...data, occupation: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: ASSESSMENT */}
                        {step === 2 && (
                            <div className="animate__animated animate__fadeIn">
                                <h6 className="text-light border-bottom border-secondary pb-2 mb-3">2. THREAT ASSESSMENT (AI ASSISTED)</h6>
                                <p className="small text-muted mb-4">
                                    Select all attributes that apply. The system will calculate the initial capability matrix automatically.
                                </p>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="form-check form-switch mb-2">
                                            <input className="form-check-input" type="checkbox" checked={assessment.isArmed} onChange={e => setAssessment({...assessment, isArmed: e.target.checked})} />
                                            <label className="form-check-label text-light small">Military Training / Armed (+Threat)</label>
                                        </div>
                                        <div className="form-check form-switch mb-2">
                                            <input className="form-check-input" type="checkbox" checked={assessment.hasCriminalRecord} onChange={e => setAssessment({...assessment, hasCriminalRecord: e.target.checked})} />
                                            <label className="form-check-label text-light small">Criminal Record / Violent History (+Threat)</label>
                                        </div>
                                        <div className="form-check form-switch mb-2">
                                            <input className="form-check-input" type="checkbox" checked={assessment.isHacker} onChange={e => setAssessment({...assessment, isHacker: e.target.checked})} />
                                            <label className="form-check-label text-light small">Advanced Hacker / Developer (+Tech)</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-check form-switch mb-2">
                                            <input className="form-check-input" type="checkbox" checked={assessment.usesEncryption} onChange={e => setAssessment({...assessment, usesEncryption: e.target.checked})} />
                                            <label className="form-check-label text-light small">Uses Dark Web / Encryption (+Tech)</label>
                                        </div>
                                        <div className="form-check form-switch mb-2">
                                            <input className="form-check-input" type="checkbox" checked={assessment.isLeader} onChange={e => setAssessment({...assessment, isLeader: e.target.checked})} />
                                            <label className="form-check-label text-light small">Political/Org Leader (+Influence)</label>
                                        </div>
                                        <div className="form-check form-switch mb-2">
                                            <input className="form-check-input" type="checkbox" checked={assessment.isRich} onChange={e => setAssessment({...assessment, isRich: e.target.checked})} />
                                            <label className="form-check-label text-light small">High Net Worth (+Influence)</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="cyber-card bg-black p-3 border-secondary">
                                    <h6 className="text-cyan small mb-3">CALCULATED MATRIX PREVIEW</h6>
                                    <div className="d-flex justify-content-between text-center">
                                        <div><div className="h4 text-danger mb-0">{data.threat_level}</div><small className="text-muted">THREAT</small></div>
                                        <div><div className="h4 text-success mb-0">{data.technical_skill}</div><small className="text-muted">TECH</small></div>
                                        <div><div className="h4 text-warning mb-0">{data.influence_score}</div><small className="text-muted">INFLUENCE</small></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: CONTACT & NOTES */}
                        {step === 3 && (
                            <div className="animate__animated animate__fadeIn">
                                <h6 className="text-light border-bottom border-secondary pb-2 mb-3">3. CONTACT & INITIAL INTEL</h6>
                                
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label text-secondary small">PRIMARY PHONE</label>
                                        <input type="text" className="form-control bg-dark text-light border-secondary" 
                                            value={data.phone_primary} 
                                            onChange={e => setData({...data, phone_primary: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-secondary small">PRIMARY EMAIL</label>
                                        <input type="email" className="form-control bg-dark text-light border-secondary" 
                                            value={data.email_primary} 
                                            onChange={e => setData({...data, email_primary: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small">INITIAL INTELLIGENCE NOTES</label>
                                    <textarea className="form-control bg-dark text-light border-secondary font-monospace" rows="4"
                                        placeholder="Enter summary of initial findings..."
                                        value={data.notes}
                                        onChange={e => setData({...data, notes: e.target.value})}
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small">INITIAL STATUS</label>
                                    <select className="form-select bg-dark text-light border-secondary"
                                        value={data.status}
                                        onChange={e => setData({...data, status: e.target.value})}
                                    >
                                        <option value="ACTIVE">ACTIVE MONITORING</option>
                                        <option value="HIGH_PRIORITY">HIGH PRIORITY</option>
                                        <option value="DORMANT">DORMANT / INACTIVE</option>
                                        <option value="NEUTRALIZED">NEUTRALIZED</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="d-flex justify-content-between mt-4 border-top border-secondary pt-3">
                            {step > 1 ? (
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(step - 1)}>BACK</button>
                            ) : (
                                <div></div>
                            )}
                            
                            {step < 3 ? (
                                <button type="button" className="btn btn-success" onClick={() => setStep(step + 1)}>NEXT STEP <i className="bi bi-arrow-right"></i></button>
                            ) : (
                                <button type="submit" className="btn btn-success text-glow fw-bold">CREATE DOSSIER <i className="bi bi-check-lg"></i></button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // --- COMPONENT: DOSSIER CARD (LIST VIEW) ---
    const DossierCard = ({ dossier, onClick }) => (
        <div className="col-md-4 mb-4">
            <div 
                className="card bg-black border border-success border-opacity-50 h-100 shadow-lg" 
                style={{cursor: 'pointer', transition: 'all 0.3s'}}
                onClick={onClick}
                onMouseEnter={(e) => e.currentTarget.classList.add('border-warning')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('border-warning')}
            >
                <div className="card-header bg-transparent border-bottom border-success border-opacity-25 d-flex justify-content-between align-items-center">
                    <span className="font-monospace text-success fw-bold">{dossier.codename}</span>
                    <span className={`badge ${dossier.status === 'ACTIVE' || dossier.status === 'HIGH_PRIORITY' ? 'bg-danger animate__animated animate__flash animate__infinite animate__slower' : 'bg-secondary'}`}>
                        {dossier.status.replace('_', ' ')}
                    </span>
                </div>
                <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle border border-success p-1 me-3 position-relative" style={{width: '60px', height: '60px'}}>
                            <img 
                                src={dossier.photo_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                                alt="Profile" 
                                className="w-100 h-100 rounded-circle"
                                style={{filter: 'grayscale(100%) contrast(120%)'}}
                            />
                        </div>
                        <div className="overflow-hidden">
                            <h6 className="text-light mb-0 text-truncate">{dossier.full_name || 'Unknown Subject'}</h6>
                            <small className="text-secondary font-monospace d-block text-truncate">AKA: {dossier.alias || 'N/A'}</small>
                        </div>
                    </div>
                    
                    {/* Mini Stats */}
                    <div className="row g-1 text-center small font-monospace">
                        <div className="col-4">
                            <div className="border border-secondary rounded p-1">
                                <div className="text-danger">{dossier.threat_level}</div>
                                <div className="text-muted" style={{fontSize: '10px'}}>THREAT</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="border border-secondary rounded p-1">
                                <div className="text-success">{dossier.technical_skill}</div>
                                <div className="text-muted" style={{fontSize: '10px'}}>TECH</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="border border-secondary rounded p-1">
                                <div className="text-warning">{dossier.influence_score}</div>
                                <div className="text-muted" style={{fontSize: '10px'}}>INFL</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- COMPONENT: DOSSIER DETAIL (FULL VIEW) ---
    const DossierDetail = ({ dossier }) => {
        // SVG Radar Chart Logic
        const cX = 100;
        const cY = 100;
        const r = 80;
        
        const threatY = cY - (r * (dossier.threat_level / 100));
        const techX = cX + (r * Math.cos(30 * Math.PI / 180) * (dossier.technical_skill / 100));
        const techY = cY + (r * Math.sin(30 * Math.PI / 180) * (dossier.technical_skill / 100));
        const infX = cX - (r * Math.cos(30 * Math.PI / 180) * (dossier.influence_score / 100));
        const infY = cY + (r * Math.sin(30 * Math.PI / 180) * (dossier.influence_score / 100));

        return (
            <div className="animate__animated animate__fadeIn">
                <div className="d-flex align-items-center mb-4">
                    <button onClick={() => setSelectedDossier(null)} className="btn btn-outline-secondary me-3">
                        <i className="bi bi-arrow-left me-2"></i>DATABASE
                    </button>
                    <h3 className="text-success text-glow font-monospace m-0">
                        CONFIDENTIAL FILE: {dossier.codename}
                    </h3>
                </div>
                
                <div className="row g-4">
                    {/* Left Col: Identity Card */}
                    <div className="col-lg-4">
                        <div className="cyber-card p-4 border border-success h-100 bg-black bg-opacity-50">
                            <div className="text-center mb-4">
                                <div className="d-inline-block p-2 border border-2 border-success rounded-circle position-relative shadow-lg">
                                    <img 
                                        src={dossier.photo_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                                        alt="Target" 
                                        className="rounded-circle"
                                        style={{width: '150px', height: '150px', filter: 'grayscale(100%) sepia(50%) hue-rotate(90deg)'}} 
                                    />
                                    <div className="position-absolute bottom-0 end-0 bg-black border border-success rounded-circle p-2">
                                        <div className="spinner-grow spinner-grow-sm text-danger" role="status"></div>
                                    </div>
                                </div>
                                <h2 className="mt-3 text-white font-monospace fw-bold">{dossier.codename}</h2>
                                <div className={`badge ${dossier.status === 'ACTIVE' ? 'bg-danger' : 'bg-secondary'} px-3 py-2 fs-6`}>
                                    {dossier.status.replace('_', ' ')}
                                </div>
                            </div>
                            
                            <hr className="border-secondary" />
                            
                            <div className="row g-2 font-monospace">
                                <div className="col-12 mb-2">
                                    <small className="text-secondary d-block">FULL NAME</small>
                                    <span className="text-light fs-5">{dossier.full_name || 'UNKNOWN'}</span>
                                </div>
                                <div className="col-12 mb-2">
                                    <small className="text-secondary d-block">KNOWN ALIASES</small>
                                    <span className="text-info">{dossier.alias || 'NONE'}</span>
                                </div>
                                <div className="col-6 mb-2">
                                    <small className="text-secondary d-block">NATIONALITY</small>
                                    <span className="text-light">{dossier.nationality || 'UNKNOWN'}</span>
                                </div>
                                <div className="col-6 mb-2">
                                    <small className="text-secondary d-block">DOB</small>
                                    <span className="text-light">{dossier.dob || 'UNKNOWN'}</span>
                                </div>
                                <div className="col-12 mb-2">
                                    <small className="text-secondary d-block">OCCUPATION</small>
                                    <span className="text-light">{dossier.occupation || 'UNKNOWN'}</span>
                                </div>
                                <div className="col-12 mb-2">
                                    <small className="text-secondary d-block">CONTACT</small>
                                    <div className="text-light"><i className="bi bi-telephone me-2"></i>{dossier.phone_primary || 'N/A'}</div>
                                    <div className="text-light"><i className="bi bi-envelope me-2"></i>{dossier.email_primary || 'N/A'}</div>
                                </div>
                            </div>
                            
                            <div className="d-grid gap-2 mt-4">
                                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(dossier.id)}>
                                    <i className="bi bi-trash me-2"></i>BURN DOSSIER (DELETE)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Middle Col: Capability Matrix */}
                    <div className="col-lg-5">
                        <div className="cyber-card p-4 border border-cyan h-100 bg-black bg-opacity-50">
                            <h5 className="text-cyan text-glow mb-4 text-center letter-spacing-2">
                                <i className="bi bi-bullseye me-2"></i>CAPABILITY MATRIX
                            </h5>
                            
                            {/* SVG Chart */}
                            <div className="text-center mb-4 position-relative">
                                <svg width="240" height="240" viewBox="0 0 200 200" className="mx-auto d-block">
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{stopColor:'rgb(0,255,255)', stopOpacity:0.5}} />
                                            <stop offset="100%" style={{stopColor:'rgb(0,0,255)', stopOpacity:0.1}} />
                                        </linearGradient>
                                    </defs>
                                    {/* Background Grid */}
                                    <polygon points="100,20 170,140 30,140" fill="none" stroke="#333" strokeWidth="1" />
                                    <polygon points="100,60 135,120 65,120" fill="none" stroke="#333" strokeWidth="1" />
                                    <line x1="100" y1="100" x2="100" y2="20" stroke="#333" strokeWidth="1" strokeDasharray="4"/>
                                    <line x1="100" y1="100" x2="170" y2="140" stroke="#333" strokeWidth="1" strokeDasharray="4"/>
                                    <line x1="100" y1="100" x2="30" y2="140" stroke="#333" strokeWidth="1" strokeDasharray="4"/>
                                    
                                    {/* Data Shape */}
                                    <polygon 
                                        points={`${100},${threatY} ${techX},${techY} ${infX},${infY}`} 
                                        fill="url(#grad1)" 
                                        stroke="#0ff" 
                                        strokeWidth="2"
                                        filter="drop-shadow(0 0 5px #0ff)"
                                    />
                                    {/* Points */}
                                    <circle cx="100" cy={threatY} r="4" fill="#f00" />
                                    <circle cx={techX} cy={techY} r="4" fill="#0f0" />
                                    <circle cx={infX} cy={infY} r="4" fill="#ff0" />
                                </svg>
                                <div className="position-absolute top-0 start-50 translate-middle-x text-danger fw-bold bg-black px-2 rounded border border-danger">THREAT</div>
                                <div className="position-absolute bottom-0 end-0 text-success fw-bold bg-black px-2 rounded border border-success">TECH</div>
                                <div className="position-absolute bottom-0 start-0 text-warning fw-bold bg-black px-2 rounded border border-warning">INFL</div>
                            </div>

                            {/* Sliders to Edit Stats */}
                            <div className="bg-dark bg-opacity-50 p-3 rounded border border-secondary">
                                <h6 className="text-secondary small mb-3 text-center">MANUAL OVERRIDE</h6>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between small">
                                        <label className="text-danger">Threat Level</label>
                                        <span className="text-light fw-bold">{dossier.threat_level}%</span>
                                    </div>
                                    <input 
                                        type="range" className="form-range" min="0" max="100" 
                                        value={dossier.threat_level}
                                        onChange={(e) => handleUpdate(dossier.id, { threat_level: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between small">
                                        <label className="text-success">Tech Skill</label>
                                        <span className="text-light fw-bold">{dossier.technical_skill}%</span>
                                    </div>
                                    <input 
                                        type="range" className="form-range" min="0" max="100" 
                                        value={dossier.technical_skill}
                                        onChange={(e) => handleUpdate(dossier.id, { technical_skill: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="mb-0">
                                    <div className="d-flex justify-content-between small">
                                        <label className="text-warning">Influence</label>
                                        <span className="text-light fw-bold">{dossier.influence_score}%</span>
                                    </div>
                                    <input 
                                        type="range" className="form-range" min="0" max="100" 
                                        value={dossier.influence_score}
                                        onChange={(e) => handleUpdate(dossier.id, { influence_score: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Notes & Intel */}
                    <div className="col-lg-3">
                        <div className="cyber-card p-0 border border-secondary h-100 bg-black bg-opacity-50 d-flex flex-column">
                            <div className="p-3 border-bottom border-secondary bg-dark bg-opacity-50">
                                <h6 className="text-secondary text-uppercase letter-spacing-2 m-0">
                                    <i className="bi bi-journal-code me-2"></i>INTELLIGENCE LOG
                                </h6>
                            </div>
                            <div className="flex-grow-1 p-0">
                                <textarea 
                                    className="form-control bg-transparent text-light border-0 font-monospace small h-100 p-3" 
                                    style={{resize: 'none', outline: 'none', boxShadow: 'none'}}
                                    value={dossier.notes || ''}
                                    onChange={(e) => handleUpdate(dossier.id, { notes: e.target.value })}
                                    placeholder="> ENTER CLASSIFIED DATA..."
                                ></textarea>
                            </div>
                            <div className="p-2 bg-dark bg-opacity-50 border-top border-secondary text-end">
                                <small className="text-success fst-italic me-2">
                                    <i className="bi bi-cloud-check me-1"></i>System Synced
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            {!selectedDossier && (
                <div className="d-flex justify-content-between align-items-center mb-5 animate__animated animate__fadeInDown">
                    <div>
                        <h2 className="text-success text-glow fw-bold mb-0">
                            <i className="bi bi-shield-lock me-2"></i>INTELLIGENCE DATABASE
                        </h2>
                        <div className="text-secondary font-monospace small mt-1">
                            CLASSIFIED TARGET REPOSITORY // ACCESS LEVEL: 5
                        </div>
                    </div>
                    <button className="btn btn-outline-success border-2 fw-bold" onClick={() => setShowForm(true)}>
                        <i className="bi bi-plus-lg me-2"></i>NEW TARGET
                    </button>
                </div>
            )}

            {/* WIZARD FORM OVERLAY */}
            {showForm && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex justify-content-center align-items-center" style={{zIndex: 1050}}>
                    <div className="container" style={{maxWidth: '800px'}}>
                        <DossierWizard onClose={() => setShowForm(false)} onSuccess={() => {setShowForm(false); loadDossiers();}} />
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            {selectedDossier ? (
                <DossierDetail dossier={selectedDossier} />
            ) : (
                <div className="row g-4 animate__animated animate__fadeInUp">
                    {loading ? (
                        <div className="text-center text-light py-5">
                            <div className="spinner-border text-success mb-3" role="status"></div>
                            <div className="font-monospace">DECRYPTING ARCHIVES...</div>
                        </div>
                    ) : dossiers.length === 0 ? (
                        <div className="text-center text-secondary py-5">
                            <i className="bi bi-folder-x fs-1 opacity-50"></i>
                            <p className="mt-3">NO INTELLIGENCE DATA FOUND. START A NEW DOSSIER.</p>
                        </div>
                    ) : (
                        dossiers.map(d => (
                            <DossierCard key={d.id} dossier={d} onClick={() => setSelectedDossier(d)} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default IntelligenceDashboard;
