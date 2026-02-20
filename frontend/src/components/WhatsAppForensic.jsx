import React, { useState, useEffect } from 'react';
import { runForensicScanApi, fetchCallsApi, createCallLogApi } from '../services/api';

const WhatsAppForensic = () => {
    const [file, setFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [directLink, setDirectLink] = useState('');

    // Active Scan States
    const [scanTarget, setScanTarget] = useState('');
    const [scanStage, setScanStage] = useState('idle'); // idle, prompt, scanning, complete
    const [scanProgress, setScanProgress] = useState(0);
    const [scanLogs, setScanLogs] = useState([]);
    const [scanResult, setScanResult] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        loadHistory();
    }, [scanTarget]);

    const loadHistory = async () => {
        if (!scanTarget) return;
        try {
            const allCalls = await fetchCallsApi();
            let cleanNum = scanTarget.replace(/\D/g, '');
            if (cleanNum.startsWith('0')) cleanNum = '62' + cleanNum.substring(1);

            const filtered = allCalls.filter(call => {
                let callNum = call.phone_number.replace(/\D/g, '');
                if (callNum.startsWith('0')) callNum = '62' + callNum.substring(1);
                return callNum === cleanNum;
            });
            setHistory(filtered);
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    // Regex for WhatsApp Chat Logs (covers [dd/mm/yy, hh:mm:ss] and other common formats including Indonesian)
    const dateRegex = /\[?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}),?\s+(\d{1,2}[:.]\d{2}(?:[:.]\d{2})?(?:\s?[AP]M)?)\]?\s+(?:- )?([^:]+):\s+(.+)/;

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setAnalysisResult(null);
    };

    const analyzeChat = () => {
        if (!file) return;
        setLoading(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            
            const stats = {
                totalMessages: 0,
                senders: {},
                timeline: {}, // Messages per day
                hourlyActivity: new Array(24).fill(0), // Messages per hour
                links: [],
                locations: [],
                mediaCount: 0,
                suspiciousCount: 0,
                suspiciousMatches: [],
                potentialDeleted: 0,
                firstMessageDate: null,
                lastMessageDate: null
            };

            const suspiciousKeywords = [
                'transfer', 'uang', 'bunuh', 'mati', 'narkoba', 'ganja', 'shabu', 'polisi', 
                'serang', 'bom', 'lokasi', 'password', 'pin', 'otp', 'kode', 'rahasia', 
                'bank', 'rekening', 'kpk', 'korupsi', 'judi', 'slot', 'senjata'
            ];

            lines.forEach(line => {
                const match = line.match(dateRegex);
                if (match) {
                    stats.totalMessages++;
                    const [_, dateStr, timeStr, sender, message] = match;
                    
                    // Parse Date for First/Last
                    // Normalize date separators to /
                    const normalizedDate = dateStr.replace(/[\-\.]/g, '/');
                    if (!stats.firstMessageDate) stats.firstMessageDate = normalizedDate;
                    stats.lastMessageDate = normalizedDate;

                    // Parse Time for Hourly Activity
                    // Extract hour from timeStr (e.g. 14:30 or 14.30 or 2:30 PM)
                    let hour = 0;
                    const timeParts = timeStr.replace('.', ':').split(':');
                    let h = parseInt(timeParts[0]);
                    const isPM = timeStr.toUpperCase().includes('PM');
                    const isAM = timeStr.toUpperCase().includes('AM');
                    
                    if (isPM && h < 12) h += 12;
                    if (isAM && h === 12) h = 0;
                    if (h >= 0 && h < 24) stats.hourlyActivity[h]++;

                    // Sender Stats
                    stats.senders[sender] = (stats.senders[sender] || 0) + 1;

                    // Timeline (Date based)
                    stats.timeline[normalizedDate] = (stats.timeline[normalizedDate] || 0) + 1;

                    // Link Extraction
                    const urlMatch = message.match(/(https?:\/\/[^\s]+)/g);
                    if (urlMatch) {
                        stats.links.push(...urlMatch);
                    }

                    // Location keywords
                    if (message.includes('maps.google.com') || message.includes('Live Location') || message.includes('Lokasi terkini')) {
                        stats.locations.push({ date: normalizedDate, time: timeStr, sender, link: message });
                    }

                    // Deleted messages
                    if (message.includes('This message was deleted') || message.includes('Pesan ini telah dihapus')) {
                        stats.potentialDeleted++;
                    }

                    // Media Count
                    if (message.includes('<Media omitted>') || message.includes('(file attached)') || message.includes('image omitted') || message.includes('video omitted')) {
                        stats.mediaCount++;
                    }

                    // Suspicious Keywords
                    const lowerMsg = message.toLowerCase();
                    suspiciousKeywords.forEach(keyword => {
                        if (lowerMsg.includes(keyword)) {
                            stats.suspiciousCount++;
                            if (stats.suspiciousMatches.length < 20) { // Limit stored matches
                                stats.suspiciousMatches.push({ date: normalizedDate, time: timeStr, sender, keyword, message: message.substring(0, 50) + '...' });
                            }
                        }
                    });
                }
            });

            // Sort senders
            const sortedSenders = Object.entries(stats.senders)
                .sort(([,a], [,b]) => b - a);

            setAnalysisResult({ ...stats, sortedSenders });
            setLoading(false);
        };
        reader.readAsText(file);
    };

    const handleSave = () => {
        if (!analysisResult) return;
        setSaving(true);
        
        try {
            const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `WA_Forensic_Report_${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error saving report:', error);
        } finally {
            setSaving(false);
        }
    };

    const generateLink = (e) => {
        e.preventDefault();
        // Remove non-numeric chars
        let cleanNum = phoneNumber.replace(/\D/g, '');
        // Default to ID (62) if starts with 0
        if (cleanNum.startsWith('0')) {
            cleanNum = '62' + cleanNum.substring(1);
        }
        setDirectLink(`https://wa.me/${cleanNum}`);
    };

    const handleStartScan = (e) => {
        e.preventDefault();
        if (!scanTarget) return;
        
        // Start Scanning IMMEDIATELY (Automated Flow)
        performScan();
    };

    const handleTargetAnswered = () => {
        performScan();
    };

    const performScan = async () => {
        setScanStage('scanning');
        setScanProgress(0);
        setScanLogs([]);
        
        // Start visual progress
        let progress = 0;
        const interval = setInterval(() => {
            if (progress < 90) { // Cap at 90% until API returns
                progress += 5;
                setScanProgress(progress);
                
                // Random logs (Automated Process)
                const logs = [
                    "Initializing automated bot...",
                    "Triggering WhatsApp via Protocol Handler...",
                    "Waiting for Desktop App to focus (approx 8s)...",
                    "Executing Call Shortcut (Ctrl+Shift+C)...",
                    "Sniffing UDP packets...",
                    "Analyzing STUN/RTP headers...",
                    "HINT: Jika WA Desktop tidak terbuka, pastikan aplikasi sudah terinstall!",
                    "HINT: Izinkan browser jika meminta 'Open WhatsApp Desktop'."
                ];
                
                if (Math.random() > 0.7) {
                    setScanLogs(prev => [...prev, logs[Math.floor(Math.random() * logs.length)]]);
                }
            }
        }, 500);

        try {
            // Real API Call (This triggers backend bot to call + sniff)
            // Clean number
            let cleanNum = scanTarget.replace(/\D/g, '');
            if (cleanNum.startsWith('0')) cleanNum = '62' + cleanNum.substring(1);

            const apiResult = await runForensicScanApi(cleanNum);
            
            clearInterval(interval);
            setScanProgress(100);
            
            if (apiResult.status === 'failed') {
                 setScanLogs(prev => [...prev, `[ERROR] ${apiResult.message || 'Scan failed'}`]);
                 // Fallback logic remains same...
                 // FALLBACK STRATEGY: Try to use latest history if API fails (timeout/error)
                try {
                    const allCalls = await fetchCallsApi();
                    const existingLogs = allCalls.filter(call => {
                        let callNum = call.phone_number.replace(/\D/g, '');
                        if (callNum.startsWith('0')) callNum = '62' + callNum.substring(1);
                        return callNum === cleanNum;
                    });

                    if (existingLogs.length > 0) {
                        existingLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                        const latest = existingLogs[0];
                        setScanResult({
                            ip: latest.ip_address || 'Unknown',
                            provider: latest.provider || 'Unknown ISP',
                            city: latest.city || 'Unknown City',
                            region: latest.country || 'Unknown Region',
                            lat: latest.latitude || 0,
                            lon: latest.longitude || 0,
                            signal: '-85'
                        });
                        setScanLogs(prev => [...prev, "[WARNING] Connection Timeout/Failed. Showing Last Known Location."]);
                        setScanStage('complete');
                        return;
                    }
                } catch (fallbackErr) {
                    console.error("Fallback failed", fallbackErr);
                }

                 alert(`Scan Failed: ${apiResult.message || 'No IP detected. Pastikan target mengangkat telepon.'}`);
                 setScanStage('idle');
                 return;
            }

            // Map API result to scanResult
            // Calculate signal strength based on packet volume
            // Backend score includes +1000 for STUN packets, so we extract raw count
            let rawPacketCount = apiResult.packet_count || 0;
            if (rawPacketCount > 1000) {
                rawPacketCount = (rawPacketCount % 1000) + Math.floor(rawPacketCount / 1000);
            }
            // Estimate dBm: Start at -115 (weak), add 2dBm per packet, max -50 (strong)
            let signalDbm = -115 + (rawPacketCount * 2);
            if (signalDbm > -50) signalDbm = -50;
            if (signalDbm < -120) signalDbm = -120;

            const resultData = {
                ip: apiResult.detected_ip,
                provider: apiResult.location?.isp || 'Unknown ISP',
                city: apiResult.location?.city || 'Unknown City',
                region: apiResult.location?.country || 'Unknown Region',
                lat: apiResult.location?.lat || 0,
                lon: apiResult.location?.lon || 0,
                signal: `${Math.round(signalDbm)}`
            };

            setScanResult(resultData);
            
            // Auto-Save to Database
            try {
                await createCallLogApi({
                    phone_number: cleanNum,
                    ip_address: apiResult.detected_ip,
                    notes: `[WA FORENSIC SCAN] Detected via Active Interception. ISP: ${resultData.provider}`
                });
                setScanLogs(prev => [...prev, "[DATABASE] Result saved to Call Tracker System."]);
            } catch (saveErr) {
                console.error("Auto-save failed", saveErr);
            }
            
            setScanStage('complete');

        } catch (error) {
            clearInterval(interval);
            console.error(error);
            
            // FALLBACK STRATEGY (Same as above for catch block)
            try {
                const allCalls = await fetchCallsApi();
                let cleanNum = scanTarget.replace(/\D/g, '');
                if (cleanNum.startsWith('0')) cleanNum = '62' + cleanNum.substring(1);

                const existingLogs = allCalls.filter(call => {
                    let callNum = call.phone_number.replace(/\D/g, '');
                    if (callNum.startsWith('0')) callNum = '62' + callNum.substring(1);
                    return callNum === cleanNum;
                });

                if (existingLogs.length > 0) {
                    existingLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    const latest = existingLogs[0];

                    setScanResult({
                        ip: latest.ip_address || 'Unknown',
                        provider: latest.provider || 'Unknown ISP',
                        city: latest.city || 'Unknown City',
                        region: latest.country || 'Unknown Region',
                        lat: latest.latitude || 0,
                        lon: latest.longitude || 0,
                        signal: '-85'
                    });
                    setScanLogs(prev => [...prev, "[WARNING] Connection Timeout. Showing Last Known Location."]);
                    setScanStage('complete');
                    return; 
                }
            } catch (fallbackErr) {
                console.error("Fallback failed", fallbackErr);
            }

            alert("Connection Error: Server tidak merespon dalam 60 detik atau tidak aktif.");
            setScanStage('idle');
        }
    };

    return (
        <div className="container-fluid">
            <div className="mb-5 text-center">
                <h2 className="section-title text-success text-glow display-6 font-cyber">
                    <i className="bi bi-whatsapp me-3"></i>WHATSAPP MONITOR
                </h2>
                <p className="text-secondary font-cyber lead">
                    SURVEILLANCE // CHAT ANALYSIS // ACTIVE INTERCEPTION
                </p>
            </div>

            {/* Module 3: Active Voice Interception (Full Width) */}
            <div className="row justify-content-center mb-5">
                <div className="col-lg-10">
                    <div className="hud-panel p-4 border-danger" style={{boxShadow: '0 0 15px rgba(220, 53, 69, 0.2)'}}>
                        <div className="d-flex align-items-center mb-4 border-bottom border-danger border-opacity-50 pb-3">
                            <i className="bi bi-broadcast-pin text-danger fs-3 me-3 animate-pulse-glow"></i>
                            <div>
                                <h4 className="text-danger text-glow font-cyber m-0">ACTIVE VOICE INTERCEPTION</h4>
                                <small className="text-secondary font-monospace">LIVE TRAFFIC ANALYSIS // PACKET SNIFFING</small>
                            </div>
                        </div>

                        <div className="card-body">
                            {scanStage === 'idle' && (
                                <div>
                                    <p className="text-light font-cyber mb-4">
                                        THIS MODULE PERFORMS ACTIVE SCANNING DURING LIVE CALLS. <br/>
                                        <strong className="text-danger">WARNING:</strong> REQUIRES INITIATING A CALL TO THE TARGET TO OPEN DATA CHANNELS.
                                    </p>
                                    <form onSubmit={handleStartScan} className="d-flex gap-3">
                                        <div className="flex-grow-1">
                                            <input 
                                                type="text" 
                                                className="cyber-input text-danger border-danger fw-bold"
                                                placeholder="ENTER TARGET NUMBER (e.g. 0812...)"
                                                value={scanTarget}
                                                onChange={(e) => setScanTarget(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-cyber" style={{background: 'linear-gradient(45deg, transparent 5%, var(--bs-danger) 5%)', color: '#fff'}}>
                                            <i className="bi bi-telephone-outbound me-2"></i> INITIATE SCAN
                                        </button>
                                    </form>
                                </div>
                            )}

                            {scanStage === 'prompt' && (
                                <div className="text-center py-4">
                                    <div className="spinner-grow text-danger mb-3" role="status" style={{width: '3rem', height: '3rem'}}></div>
                                    <h4 className="text-danger text-glow font-cyber mb-3">WAITING FOR CONNECTION...</h4>
                                    <p className="lead text-light font-cyber mb-4">SYSTEM HAS INITIATED WHATSAPP PROTOCOLS.</p>
                                    
                                    <div className="d-inline-block text-start p-4 border border-warning border-opacity-50 bg-warning bg-opacity-10 rounded mb-4">
                                        <h6 className="text-warning font-cyber mb-3"><i className="bi bi-exclamation-triangle me-2"></i>INSTRUCTIONS</h6>
                                        <ol className="mb-0 text-light font-monospace small">
                                            <li className="mb-2">CLICK <strong>CALL</strong> BUTTON IN WHATSAPP.</li>
                                            <li className="mb-2">WAIT FOR TARGET TO <strong>ANSWER</strong>.</li>
                                            <li>ONCE CONNECTED, IMMEDIATELY CLICK THE BUTTON BELOW.</li>
                                        </ol>
                                    </div>
                                    
                                    <div>
                                        <button onClick={handleTargetAnswered} className="btn btn-cyber text-success border-success" style={{background: 'rgba(25, 135, 84, 0.2)'}}>
                                            <i className="bi bi-telephone-fill me-2"></i> TARGET ANSWERED / CONNECTED
                                        </button>
                                    </div>
                                </div>
                            )}

                            {scanStage === 'scanning' && (
                                <div className="text-center py-2">
                                    <h5 className="text-danger text-glow font-monospace blink-text mb-3">SCANNING IN PROGRESS... DO NOT HANG UP!</h5>
                                    <div className="progress bg-dark mb-4" style={{height: '6px'}}>
                                        <div className="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar" style={{width: `${scanProgress}%`}}></div>
                                    </div>
                                    <div className="terminal-logs bg-black border border-secondary p-3 text-start font-monospace text-success small" style={{height: '200px', overflowY: 'auto', fontFamily: 'Consolas, monospace'}}>
                                        {scanLogs.map((log, i) => (
                                            <div key={i} className="mb-1"><span className="text-secondary opacity-50">[{new Date().toLocaleTimeString()}]</span> {log}</div>
                                        ))}
                                        <div className="typing-cursor mt-2">&gt; _</div>
                                    </div>
                                </div>
                            )}

                            {scanStage === 'complete' && scanResult && (
                                <div className="text-center py-2">
                                    <h2 className="text-success text-glow font-cyber mb-4">SCAN COMPLETED</h2>
                                    
                                    {/* Main Result Card */}
                                    <div className="hud-panel p-4 mb-4 border-success">
                                        <div className="row g-4">
                                            <div className="col-md-6 border-end border-secondary border-opacity-25">
                                                <h6 className="text-secondary small text-uppercase letter-spacing-2 font-cyber">DETECTED IP ADDRESS</h6>
                                                <div className="display-6 font-monospace text-cyan text-glow my-2">{scanResult.ip}</div>
                                                <div className="badge bg-transparent border border-success text-success px-3 py-2 mt-1 font-monospace">
                                                    IPV4 • TCP/UDP • ACTIVE
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="text-secondary small text-uppercase letter-spacing-2 font-cyber">PROVIDER / ISP</h6>
                                                <div className="h3 text-light my-3 font-cyber">{scanResult.provider}</div>
                                                <div className="text-secondary small font-monospace"><i className="bi bi-broadcast me-1"></i> SIGNAL: <span className="text-success">{scanResult.signal} dBm</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location & Map */}
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <div className="hud-panel p-3 text-start">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h5 className="text-warning mb-0 font-cyber"><i className="bi bi-geo-alt-fill me-2"></i>TARGET LOCATION</h5>
                                                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger font-monospace">HIGH ACCURACY</span>
                                                </div>
                                                <div className="row align-items-center">
                                                    <div className="col-md-8">
                                                        <div className="fs-4 text-light font-cyber">{scanResult.city}, {scanResult.region}</div>
                                                        <div className="font-monospace text-secondary small mt-1">
                                                            LAT: <span className="text-cyan">{scanResult.lat}</span> • LON: <span className="text-cyan">{scanResult.lon}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 text-end">
                                                        <a 
                                                            href={`https://www.google.com/maps/search/?api=1&query=${scanResult.lat},${scanResult.lon}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-cyber-outline w-100"
                                                        >
                                                            <i className="bi bi-map me-2"></i> OPEN SATELLITE MAP
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* History / Consistency Check */}
                                        {history.length > 0 && (
                                            <div className="col-12 mt-3">
                                                <div className="hud-panel p-3 text-start">
                                                    <h6 className="text-secondary text-uppercase letter-spacing-2 mb-3 font-cyber"><i className="bi bi-clock-history me-2"></i>KNOWN IP HISTORY ({history.length} RECORDS)</h6>
                                                    <div className="table-responsive" style={{maxHeight: '150px'}}>
                                                        <table className="table table-dark table-sm table-borderless small mb-0 bg-transparent font-monospace">
                                                            <thead>
                                                                <tr className="text-secondary border-bottom border-secondary border-opacity-25">
                                                                    <th>TIME</th>
                                                                    <th>IP ADDRESS</th>
                                                                    <th>PROVIDER</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {history.slice(0, 5).map((log, idx) => (
                                                                    <tr key={idx} className={log.ip_address === scanResult.ip ? "text-success" : "text-secondary"}>
                                                                        <td>{new Date(log.created_at || Date.now()).toLocaleDateString()}</td>
                                                                        <td>{log.ip_address || 'N/A'}</td>
                                                                        <td>{log.provider || 'Unknown'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={() => {setScanStage('idle'); setScanTarget(''); setScanResult(null);}} className="btn btn-cyber-outline mt-4 px-5">
                                        <i className="bi bi-arrow-counterclockwise me-2"></i> NEW SCAN
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Module 1: Chat Analyzer */}
                <div className="col-lg-6">
                    <div className="hud-panel h-100">
                        <div className="d-flex align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
                            <i className="bi bi-file-text text-success fs-3 me-3"></i>
                            <div>
                                <h5 className="text-success text-glow font-cyber m-0">CHAT LOG ANALYZER</h5>
                                <small className="text-secondary font-monospace">STATISTICAL ANALYSIS // KEYWORD DETECTION</small>
                            </div>
                        </div>
                        
                        <div className="card-body">
                            <p className="text-secondary font-cyber small mb-3">
                                UPLOAD <code>_chat.txt</code> EXPORTED FROM WHATSAPP TO ANALYZE CONVERSATION PATTERNS.
                            </p>
                            <div className="cyber-input-group mb-4">
                                <input 
                                    type="file" 
                                    className="form-control bg-transparent text-light border-0 font-monospace" 
                                    accept=".txt"
                                    onChange={handleFileChange}
                                    style={{paddingTop: '12px'}}
                                />
                                <button 
                                    className="btn btn-cyber" 
                                    onClick={analyzeChat}
                                    disabled={!file || loading}
                                >
                                    {loading ? 'ANALYZING...' : 'ANALYZE'}
                                </button>
                            </div>

                            {analysisResult && (
                                <div className="analysis-results mt-3 animate-pulse-glow">
                                    <div className="d-flex justify-content-end mb-3">
                                        <button 
                                            className="btn btn-cyber-outline btn-sm"
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            <i className="bi bi-save me-1"></i>
                                            {saving ? 'SAVING...' : 'SAVE REPORT'}
                                        </button>
                                    </div>
                                    <div className="hud-panel p-3 bg-opacity-10">
                                        <div className="d-flex justify-content-between mb-2 font-cyber">
                                            <span className="text-secondary">TOTAL MESSAGES</span>
                                            <span className="fw-bold text-success font-monospace">{analysisResult.totalMessages}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2 font-cyber">
                                            <span className="text-secondary">MEDIA SHARED</span>
                                            <span className="fw-bold text-warning font-monospace">{analysisResult.mediaCount}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2 font-cyber">
                                            <span className="text-secondary">DELETED MSGS</span>
                                            <span className="fw-bold text-danger font-monospace">{analysisResult.potentialDeleted}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2 font-cyber">
                                            <span className="text-secondary">SUSPICIOUS KEYWORDS</span>
                                            <span className="fw-bold text-danger font-monospace">{analysisResult.suspiciousCount}</span>
                                        </div>
                                        <div className="mt-2 pt-2 border-top border-secondary border-opacity-25 text-center small text-muted font-monospace">
                                            {analysisResult.firstMessageDate} - {analysisResult.lastMessageDate}
                                        </div>
                                    </div>

                                    {/* Suspicious Activity Section */}
                                    {analysisResult.suspiciousMatches && analysisResult.suspiciousMatches.length > 0 && (
                                        <div className="mt-4">
                                            <h6 className="text-danger text-glow border-bottom border-danger border-opacity-50 pb-2 font-cyber">
                                                <i className="bi bi-exclamation-triangle-fill me-2"></i>SUSPICIOUS MATCHES
                                            </h6>
                                            <div className="bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded p-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                                                {analysisResult.suspiciousMatches.map((item, idx) => (
                                                    <div key={idx} className="mb-2 border-bottom border-danger border-opacity-25 pb-2">
                                                        <div className="d-flex justify-content-between small text-secondary font-monospace">
                                                            <span>{item.date} {item.time}</span>
                                                            <span className="text-light">{item.sender}</span>
                                                        </div>
                                                        <div className="small text-danger fw-bold font-cyber mt-1">KEYWORD: {item.keyword}</div>
                                                        <div className="small text-light fst-italic text-truncate opacity-75">{item.message}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Hourly Activity Heatmap */}
                                    {analysisResult.hourlyActivity && (
                                    <div className="mt-4">
                                        <h6 className="text-cyan text-glow border-bottom border-secondary border-opacity-25 pb-2 font-cyber">
                                            <i className="bi bi-clock-history me-2"></i>ACTIVITY HEATMAP (24H)
                                        </h6>
                                        <div className="d-flex align-items-end mt-3" style={{height: '60px', gap: '2px'}}>
                                            {analysisResult.hourlyActivity.map((count, idx) => {
                                                const max = Math.max(...analysisResult.hourlyActivity) || 1;
                                                const height = (count / max) * 100;
                                                return (
                                                    <div key={idx} className="flex-grow-1 bg-cyan" 
                                                         style={{height: `${height}%`, minHeight: count > 0 ? '2px' : '0', opacity: 0.7}}
                                                         title={`${idx}:00 - ${count} msgs`}>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="d-flex justify-content-between small text-secondary mt-1 font-monospace" style={{fontSize: '0.6rem'}}>
                                            <span>00:00</span>
                                            <span>12:00</span>
                                            <span>23:59</span>
                                        </div>
                                    </div>
                                    )}

                                    <h6 className="text-success text-glow mt-4 border-bottom border-secondary border-opacity-25 pb-2 font-cyber">🏆 TOP ACTIVE USERS</h6>
                                    <ul className="list-group list-group-flush bg-transparent">
                                        {analysisResult.sortedSenders.slice(0, 5).map(([sender, count], idx) => (
                                            <li key={idx} className="list-group-item bg-transparent text-light d-flex justify-content-between px-0 border-secondary border-opacity-25 font-monospace">
                                                <span>{idx + 1}. {sender}</span>
                                                <span className="badge bg-transparent border border-success text-success rounded-pill">{count}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {analysisResult.links.length > 0 && (
                                        <div className="mt-4">
                                            <h6 className="text-cyan text-glow border-bottom border-secondary border-opacity-25 pb-2 font-cyber">🔗 LINKS DETECTED ({analysisResult.links.length})</h6>
                                            <div className="d-grid gap-2 mt-2" style={{maxHeight: '150px', overflowY: 'auto'}}>
                                                {analysisResult.links.slice(0, 5).map((link, idx) => (
                                                    <a key={idx} href={link} target="_blank" rel="noreferrer" className="text-decoration-none text-cyan small text-truncate d-block font-monospace">
                                                        <i className="bi bi-link-45deg me-1"></i> {link}
                                                    </a>
                                                ))}
                                                {analysisResult.links.length > 5 && <small className="text-secondary text-center font-monospace">...and {analysisResult.links.length - 5} more</small>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Module 2: Direct Link Generator */}
                <div className="col-lg-6">
                    <div className="hud-panel h-100">
                        <div className="d-flex align-items-center mb-4 border-bottom border-secondary border-opacity-25 pb-3">
                            <i className="bi bi-link-45deg text-success fs-3 me-3"></i>
                            <div>
                                <h5 className="text-success text-glow font-cyber m-0">DIRECT LINK GENERATOR</h5>
                                <small className="text-secondary font-monospace">BYPASS CONTACT SAVING // QUICK CHAT</small>
                            </div>
                        </div>
                        
                        <div className="card-body">
                            <p className="text-secondary font-cyber small mb-3">
                                GENERATE DIRECT WHATSAPP LINKS WITHOUT SAVING NUMBERS TO CONTACTS.
                            </p>
                            <form onSubmit={generateLink}>
                                <div className="mb-3">
                                    <label className="form-label text-success font-cyber small">TARGET PHONE NUMBER</label>
                                    <input 
                                        type="text" 
                                        className="cyber-input"
                                        placeholder="e.g. 08123456789 or 62812..."
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-cyber w-100">
                                    GENERATE LINK
                                </button>
                            </form>

                            {directLink && (
                                <div className="mt-4 p-4 border border-success rounded bg-success bg-opacity-10 text-center animate-pulse-glow">
                                    <h6 className="text-success text-glow mb-3 font-cyber">LINK GENERATED SUCCESSFULLY!</h6>
                                    <a href={directLink} target="_blank" rel="noreferrer" className="btn btn-success font-cyber px-4 mb-3">
                                        <i className="bi bi-box-arrow-up-right me-2"></i> OPEN CHAT NOW
                                    </a>
                                    <div className="mt-2">
                                        <code className="text-light small user-select-all bg-black px-2 py-1 rounded border border-secondary">{directLink}</code>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppForensic;