"use client";
import React, { useState } from 'react';
import { IoClose, IoKeyOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

const CloseIcon = IoClose as React.FC<{ size?: number | string }>;
const KeyIcon = IoKeyOutline as React.FC<{ size?: number | string }>;
const LockIcon = IoLockClosedOutline as React.FC<{ size?: number | string }>;
const EyeIcon = IoEyeOutline as React.FC<{ size?: number | string }>;
const EyeOffIcon = IoEyeOffOutline as React.FC<{ size?: number | string }>;

interface AdminChangePasswordModalProps {
    isOpen: boolean;
    user_ID: string;
    selectedColor: string;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const AdminChangePasswordModal: React.FC<AdminChangePasswordModalProps> = ({
    isOpen,
    user_ID,
    selectedColor,
    onClose,
    onSuccess,
    onError,
}) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPassword || !newPassword || !confirmPassword) {
            onError('გთხოვთ შეავსოთ ყველა ველი');
            return;
        }

        if (newPassword !== confirmPassword) {
            onError('ახალი პაროლები არ ემთხვევა ერთმანეთს');
            return;
        }

        if (newPassword.length < 4) {
            onError('ახალი პაროლი უნდა იყოს სულ მცირე 4 სიმბოლო');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_ID,
                    oldPassword,
                    newPassword,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                onSuccess('პაროლი წარმატებით შეიცვალა!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                onClose();
            } else {
                onError(data.message || 'პაროლის შეცვლა ვერ მოხერხდა');
            }
        } catch (err) {
            console.error('Password change error:', err);
            onError('სერვერთან დაკავშირება ვერ მოხერხდა');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <div className="animate-zoom-in" style={{
                background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '24px',
                padding: '32px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                color: 'white',
                position: 'relative'
            }}>
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <CloseIcon size={20} />
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${selectedColor}44 0%, ${selectedColor}11 100%)`,
                        border: `1.5px solid ${selectedColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px',
                        color: selectedColor
                    }}>
                        <KeyIcon size={28} />
                    </div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800 }}>პაროლის შეცვლა</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        მომხმარებელი: <strong style={{ color: 'white' }}>{user_ID}</strong>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(255, 255, 255, 0.8)' }}>
                            ძველი პაროლი
                        </label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input
                                type={showOldPassword ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                placeholder="••••••••"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 42px 12px 16px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: 'white',
                                    fontSize: '15px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0,
                                    minHeight: 'auto',
                                    minWidth: 'auto'
                                }}
                            >
                                {showOldPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(255, 255, 255, 0.8)' }}>
                            ახალი პაროლი
                        </label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 42px 12px 16px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: 'white',
                                    fontSize: '15px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0,
                                    minHeight: 'auto',
                                    minWidth: 'auto'
                                }}
                            >
                                {showNewPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'rgba(255, 255, 255, 0.8)' }}>
                            გაიმეორეთ ახალი პაროლი
                        </label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 42px 12px 16px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: 'white',
                                    fontSize: '15px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0,
                                    minHeight: 'auto',
                                    minWidth: 'auto'
                                }}
                            >
                                {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            გაუქმება
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '12px',
                                background: `linear-gradient(135deg, ${selectedColor} 0%, #3a8dde 100%)`,
                                border: 'none',
                                color: 'white',
                                fontWeight: 800,
                                fontSize: '14px',
                                cursor: 'pointer',
                                boxShadow: `0 8px 20px ${selectedColor}44`
                            }}
                        >
                            {loading ? 'შენახვა...' : 'შენახვა'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminChangePasswordModal;
