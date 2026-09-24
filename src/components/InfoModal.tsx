import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface InfoModalProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, message, onClose }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) {
        return null;
    }

    const isSuccess = message.includes("წარმატებით") || message.includes("შენახა");

    const modalContent = (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999999,
                animation: 'fadeIn 0.2s ease-out',
                padding: '20px',
                boxSizing: 'border-box',
            }}
        >
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popIn { from { transform: scale(0.9) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
            `}</style>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#ffffff',
                    padding: '36px 28px',
                    borderRadius: '28px',
                    border: isSuccess ? '2px solid #22c55e' : '2px solid #ef4444',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    maxWidth: '420px',
                    width: '100%',
                    color: '#0f172a',
                    animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                    boxSizing: 'border-box',
                }}
            >
                <div
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: isSuccess ? '#dcfce7' : '#fee2e2',
                        color: isSuccess ? '#16a34a' : '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        fontWeight: 900,
                        flexShrink: 0,
                        boxShadow: isSuccess ? '0 4px 14px rgba(34, 197, 94, 0.25)' : '0 4px 14px rgba(239, 68, 68, 0.25)',
                    }}
                >
                    {isSuccess ? '✓' : '⚠️'}
                </div>

                <div style={{ fontSize: '18px', color: '#0f172a', fontWeight: 800, lineHeight: '1.5' }}>
                    {message}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '14px 24px',
                        border: 'none',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: '15px',
                        background: isSuccess ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        letterSpacing: '0.5px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    გასაგებია
                </button>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default InfoModal; 