import React from 'react';
import IntelligenceDashboard from '../components/IntelligenceDashboard';

const IntelligencePage = () => {
    return (
        <div className="container-fluid mt-4">
            <h2 className="text-center mb-4 text-success text-glow font-cyber">TARGET INTELLIGENCE DATABASE</h2>
            <p className="text-center text-secondary mb-5 font-monospace">
                CLASSIFIED DOSSIERS • THREAT ASSESSMENT • CAPABILITY MATRIX
            </p>
            <IntelligenceDashboard />
        </div>
    );
};

export default IntelligencePage;
