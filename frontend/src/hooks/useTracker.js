import { useState, useEffect } from 'react';
import { fetchCallsApi, createCallLogApi, runForensicScanApi, deleteCallLogApi } from '../services/api';

export const useTracker = () => {
  const [calls, setCalls] = useState([]);
  const [formData, setFormData] = useState({
    phone_number: '',
    ip_address: '',
    notes: '',
    excluded_ip: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forensicData, setForensicData] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadCalls();
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [...prev, `> ${msg}`]);
  };

  const loadCalls = async () => {
    try {
      const data = await fetchCallsApi();
      setCalls(data);
    } catch (err) {
      console.error('Error fetching calls:', err);
    }
  };

  const runForensicAnalysis = async () => {
    if (!formData.phone_number) {
      alert("Please enter a phone number first!");
      return;
    }

    setLoading(true);
    setForensicData(null);
    setLogs([]);
    
    // Simulasi Terminal Logs
    addLog("Initializing Network Interface (eth0)...");
    await new Promise(r => setTimeout(r, 800));
    addLog("Starting UDP Packet Sniffer...");
    await new Promise(r => setTimeout(r, 800));
    addLog(`Dialing Target: ${formData.phone_number}...`);
    await new Promise(r => setTimeout(r, 1000));
    addLog("Intercepting Traffic... [WAITING FOR P2P CONNECTION]");
    addLog("HINT: Bot mencoba membuka WA Desktop & menekan shortcut panggil otomatis.");
    addLog("HINT: Pastikan WA Desktop sudah login & window tidak tertutup aplikasi lain.");
    
    try {
      const data = await runForensicScanApi(formData.phone_number, formData.excluded_ip);
      
      addLog("Packet Capture Complete!");

      // Fix: Filter out 0.0.0.0 IP
      let finalIp = data.detected_ip;
      
      if (finalIp === '0.0.0.0' && data.candidates && data.candidates.length > 0) {
          const betterCandidate = data.candidates.find(c => c.ip !== '0.0.0.0');
          if (betterCandidate) {
              finalIp = betterCandidate.ip;
              data.detected_ip = finalIp; // Update data object
              addLog(`[AUTO-FIX] 0.0.0.0 detected. Re-routing to next best candidate: ${finalIp}`);
          }
      }
      
      if (data.status === 'failed' || finalIp === '0.0.0.0') {
        addLog(`[FAIL] ${data.message || 'No Valid IP detected (Only 0.0.0.0 found).'}`);
        if (data.message && data.message.includes('Response tidak ditemukan')) {
             addLog("HINT: Pastikan Target MENGANGKAT telepon (bukan hanya berdering).");
        }
      } else {
        // Cek apakah telpon diangkat
        if (data.is_answered) {
            addLog(`[SUCCESS] Call Answered! P2P Connection Verified.`);
        } else {
            addLog(`[WARNING] Call not answered or P2P handshake incomplete.`);
            addLog(`HINT: IP mungkin kurang akurat jika target tidak mengangkat.`);
        }

        addLog(`Detected IP Header: ${finalIp}`);
        setForensicData(data);
        
        // Auto fill form with detected data
        setFormData(prev => ({
            ...prev,
            ip_address: finalIp,
            notes: `[FORENSIC] Detected via ${data.protocol}`
        }));
      }

    } catch (error) {
      addLog("ERROR: Connection Refused or Encrypted Tunnel Detected.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const payload = {
      ...formData,
      ip_address: formData.ip_address.trim() === '' ? null : formData.ip_address
    };

    try {
      await createCallLogApi(payload);
      loadCalls();
      setFormData({
        phone_number: '',
        ip_address: '',
        notes: ''
      });
      alert('Log added successfully!');
    } catch (error) {
      console.error('Error creating call log:', error);
      if (error.response && error.response.data) {
        const errorMsg = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        setError(errorMsg);
      } else {
        setError('Failed to add log. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    
    try {
      await deleteCallLogApi(id);
      loadCalls(); // Refresh list
    } catch (error) {
      console.error("Error deleting log:", error);
      alert("Failed to delete log");
    }
  };

  return {
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
  };
};
