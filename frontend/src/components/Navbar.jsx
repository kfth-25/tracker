import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/Rabbit in top hat silhouette.png';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const togglerRef = useRef(null);
    const collapseRef = useRef(null);

    const isActive = (path) => {
        // Strict check for root
        if (path === '/') return location.pathname === '/' ? 'active' : '';
        // Check if path is part of current location (for dropdown parents if needed, but here simple link check)
        return location.pathname === path ? 'active' : '';
    };

    // Helper to check if any child of a dropdown is active
    const isDropdownActive = (paths) => {
        return paths.includes(location.pathname) ? 'active text-cyan' : '';
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check for Ctrl+M or Alt+M to toggle Navbar
            if ((event.ctrlKey || event.altKey) && (event.key === 'm' || event.key === 'M')) {
                event.preventDefault();
                if (togglerRef.current) {
                    togglerRef.current.click();
                }
                return;
            }

            // Shortcut Navigation (Alt + First Letter)
            if (event.altKey && !event.ctrlKey && !event.shiftKey) {
                switch(event.key.toLowerCase()) {
                    case 'd': // Dashboard
                        event.preventDefault();
                        navigate('/');
                        break;
                    case 'p': // Call Tracker (Signal Interceptor)
                        event.preventDefault();
                        navigate('/call-tracker');
                        break;
                    case 'm': // Metadata
                        event.preventDefault();
                        navigate('/metadata');
                        break;
                    case 'n': // Network (J was Jaringan, now Network Intel)
                        event.preventDefault();
                        navigate('/network');
                        break;
                    case 't': // Tech Detect
                        event.preventDefault();
                        navigate('/tech-detect');
                        break;
                    case 'o': // OSINT (Digital Footprint)
                        event.preventDefault();
                        navigate('/osint');
                        break;
                    case 'w': // WhatsApp (was F for Forensik)
                        event.preventDefault();
                        navigate('/whatsapp');
                        break;
                    case 'i': // Intelligence
                        event.preventDefault();
                        navigate('/intelligence');
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate]);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-black sticky-top border-bottom border-success border-opacity-25 shadow-lg">
            <div className="container-fluid px-4">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img 
                        src={logo} 
                        alt="Logo" 
                        width="40" 
                        height="40" 
                        className="d-inline-block align-text-top me-2" 
                        style={{ filter: 'invert(1) drop-shadow(0 0 5px rgba(0, 243, 255, 0.5))' }} 
                    />
                    <span className="font-cyber fw-bold text-light fs-4" style={{letterSpacing: '2px'}}>
                        <span className="text-red text-glow">CYBER</span><span className="text-cyan text-glow">INTEL</span>
                    </span>
                </Link>
                <button 
                    ref={togglerRef}
                    className="navbar-toggler border-0" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <i className="bi bi-list text-cyan fs-1"></i>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav" ref={collapseRef}>
                    <ul className="navbar-nav ms-auto align-items-center">
                        {/* DASHBOARD */}
                        <li className="nav-item mx-1">
                            <Link className={`nav-link text-uppercase fw-bold ${isActive('/')}`} to="/">
                                <i className="bi bi-speedometer2 me-1 text-primary"></i> Dashboard
                            </Link>
                        </li>

                        {/* RECONNAISSANCE DROPDOWN */}
                        <li className="nav-item dropdown mx-1">
                            <a 
                                className={`nav-link dropdown-toggle text-uppercase fw-bold ${isDropdownActive(['/network', '/tech-detect'])}`}
                                href="#" 
                                role="button" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false"
                            >
                                <i className="bi bi-binoculars me-1 text-info"></i> Reconnaissance
                            </a>
                            <ul className="dropdown-menu dropdown-menu-dark bg-black border border-secondary shadow">
                                <li>
                                    <Link className={`dropdown-item ${isActive('/network')}`} to="/network">
                                        <i className="bi bi-globe me-2 text-success"></i>Network Intel
                                    </Link>
                                </li>
                                <li>
                                    <Link className={`dropdown-item ${isActive('/tech-detect')}`} to="/tech-detect">
                                        <i className="bi bi-cpu me-2 text-warning"></i>Tech Stack Holder
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {/* SURVEILLANCE DROPDOWN */}
                        <li className="nav-item dropdown mx-1">
                            <a 
                                className={`nav-link dropdown-toggle text-uppercase fw-bold ${isDropdownActive(['/call-tracker', '/whatsapp'])}`}
                                href="#" 
                                role="button" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false"
                            >
                                <i className="bi bi-broadcast me-1 text-danger"></i> Surveillance
                            </a>
                            <ul className="dropdown-menu dropdown-menu-dark bg-black border border-secondary shadow">
                                <li>
                                    <Link className={`dropdown-item ${isActive('/call-tracker')}`} to="/call-tracker">
                                        <i className="bi bi-soundwave me-2 text-danger"></i>Signal Interceptor
                                    </Link>
                                </li>
                                <li>
                                    <Link className={`dropdown-item ${isActive('/whatsapp')}`} to="/whatsapp">
                                        <i className="bi bi-whatsapp me-2 text-success"></i>WA Monitor
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {/* DIGITAL FORENSIC DROPDOWN */}
                        <li className="nav-item dropdown mx-1">
                            <a 
                                className={`nav-link dropdown-toggle text-uppercase fw-bold ${isDropdownActive(['/metadata', '/osint'])}`}
                                href="#" 
                                role="button" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false"
                            >
                                <i className="bi bi-fingerprint me-1 text-warning"></i> Digital Forensic
                            </a>
                            <ul className="dropdown-menu dropdown-menu-dark bg-black border border-secondary shadow">
                                <li>
                                    <Link className={`dropdown-item ${isActive('/metadata')}`} to="/metadata">
                                        <i className="bi bi-file-earmark-binary me-2 text-info"></i>Metadata Extractor
                                    </Link>
                                </li>
                                <li>
                                    <Link className={`dropdown-item ${isActive('/osint')}`} to="/osint">
                                        <i className="bi bi-person-badge me-2 text-primary"></i>Digital Footprint
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {/* DATA INTELIJEN */}
                        <li className="nav-item mx-1">
                            <Link className={`nav-link text-uppercase fw-bold ${isActive('/intelligence')}`} to="/intelligence">
                                <i className="bi bi-shield-lock me-1 text-success"></i> Data Intelijen
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
