import axios from 'axios';

const API_URL = 'http://127.0.0.1:8001/api';

const api = axios.create({
  baseURL: API_URL,
});

export default api;

export const fetchCallsApi = async () => {
  const response = await axios.get(`${API_URL}/calls/`);
  return response.data;
};

export const createCallLogApi = async (data) => {
  const response = await axios.post(`${API_URL}/calls/`, data);
  return response.data;
};

export const deleteCallLogApi = async (id) => {
  await axios.delete(`${API_URL}/calls/${id}/`);
};

export const runForensicScanApi = async (phoneNumber, excludedIp = null) => {
  const response = await axios.post(`${API_URL}/calls/forensic_scan/`, {
    phone_number: phoneNumber,
    excluded_ip: excludedIp
  }, {
    timeout: 60000 // 60 seconds timeout (Scan takes ~25s)
  });
  return response.data;
};

export const runNetworkScanApi = async (target) => {
    const response = await axios.post(`${API_URL}/calls/network_scan/`, { target });
    return response.data;
};

export const runTechScanApi = async (target) => {
    const response = await axios.post(`${API_URL}/calls/tech_scan/`, { target });
    return response.data;
};

export const runAnalyzeTargetApi = async (target) => {
    const response = await axios.post(`${API_URL}/calls/analyze_target/`, { target });
    return response.data;
};

export const runGlobalFusionApi = async () => {
    const response = await axios.get(`${API_URL}/calls/global_fusion/`);
    return response.data;
};

export const saveReportApi = async (data) => {
    const response = await axios.post(`${API_URL}/reports/`, data);
    return response.data;
};

export const fetchReportsApi = async () => {
    const response = await axios.get(`${API_URL}/reports/`);
    return response.data;
};

// --- NEW: Intelligence Dossier APIs ---
export const fetchDossiersApi = async () => {
    const response = await axios.get(`${API_URL}/dossiers/`);
    return response.data;
};

export const createDossierApi = async (data) => {
    const response = await axios.post(`${API_URL}/dossiers/`, data);
    return response.data;
};

export const updateDossierApi = async (id, data) => {
    const response = await axios.patch(`${API_URL}/dossiers/${id}/`, data);
    return response.data;
};

export const deleteDossierApi = async (id) => {
    await axios.delete(`${API_URL}/dossiers/${id}/`);
};
