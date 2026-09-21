"use client";
import React, { useState, useEffect } from 'react';
import { useColor } from './../../components/ColorContext';
import ColorPalette from './../../components/ColorPalette';
import StudentSubjectsGrades from './../../components/StudentSubjectsGrades';
import NoticeBoard from './../../components/NoticeBoard';
import ChatModule from './../../components/ChatModule';
import DailyTimeline from './../../components/DailyTimeline';
import HomeworkModule from './../../components/HomeworkModule';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  FaSignOutAlt, 
  FaGraduationCap, 
  FaBullhorn, 
  FaComments,
  FaCalendarAlt,
  FaTasks,
  FaUserGraduate,
  FaKey,
  FaRegTimesCircle
} from 'react-icons/fa';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { clearAuthSession, validateSession } from '@/lib/auth';
import '../admin/Admin.css';

const FaSignOutAltIcon = FaSignOutAlt as React.ComponentType<any>;
const EyeIcon = IoEyeOutline as React.FC<{ size?: number | string }>;
const EyeOffIcon = IoEyeOffOutline as React.FC<{ size?: number | string }>;

function getGeorgianDate() {
    const days = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
    const months = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];
    const now = new Date();
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
}

function getGreeting() {
    const hours = new Date().getHours();
    if (hours < 12) return 'დილა მშვიდობისა';
    if (hours < 18) return 'დღე მშვიდობისა';
    return 'საღამო მშვიდობისა';
}

function readStudentSession(): { studentId: string; classId: string } {
    if (typeof window === 'undefined') return { studentId: '', classId: '' };
    const storedStudentId = localStorage.getItem('studentId');
    const storedClassId = localStorage.getItem('classId');
    if (storedStudentId && storedClassId) {
        return { studentId: storedStudentId, classId: storedClassId };
    }
    const urlParams = new URLSearchParams(window.location.search);
    return {
        studentId: urlParams.get('student_id') || '',
        classId: urlParams.get('class_id') || '',
    };
}

const Student: React.FC = () => {
    const navigate = useNavigate();
    const { selectedColor } = useColor();
    const [{ studentId, classId }] = useState(readStudentSession);
    const [activeTab, setActiveTab] = useState<'grades' | 'timeline' | 'homework' | 'notices' | 'messages'>('grades');

    // Password change state
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passError, setPassError] = useState('');
    const [passSuccess, setPassSuccess] = useState('');
    const [passLoading, setPassLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassError('');
        setPassSuccess('');
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPassError('ყველა ველი აუცილებელია');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPassError('ახალი პაროლები არ ემთხვევა');
            return;
        }
        if (newPassword.length < 4) {
            setPassError('ახალი პაროლი უნდა იყოს სულ მცირე 4 სიმბოლო');
            return;
        }
        setPassLoading(true);
        try {
            const res = await fetch('/api/student/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: studentId, oldPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setPassSuccess('პაროლი წარმატებით შეიცვალა!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setIsPassModalOpen(false), 1500);
            } else {
                setPassError(data.message || 'შეცდომა პაროლის შეცვლისას');
            }
        } catch {
            setPassError('სერვერთან კავშირი ვერ დამყარდა');
        } finally {
            setPassLoading(false);
        }
    };

    // Fetch student info
    const { data: studentInfo } = useQuery({
        queryKey: ['student-info', studentId],
        queryFn: async () => {
            const res = await fetch(`/api/student/info?user_ID=${studentId}`);
            if (!res.ok) throw new Error();
            return res.json();
        },
        enabled: !!studentId,
        staleTime: 60000
    });

    // Fetch all messages for unread badge evaluation
    const { data: allMessages } = useQuery({
        queryKey: ['student-messages-unread', studentId],
        queryFn: async () => {
            const response = await fetch(`/api/messages?user_id=${studentId}`);
            if (!response.ok) throw new Error();
            return response.json();
        },
        enabled: !!studentId,
        refetchInterval: 5000
    });

    // Fetch announcements for unread badge evaluation
    const { data: announcements } = useQuery({
        queryKey: ['announcements-unread'],
        queryFn: async () => {
            const response = await fetch('/api/announcements');
            if (!response.ok) throw new Error();
            return response.json();
        },
        refetchInterval: 8000
    });

    const hasUnreadMessages = React.useMemo(() => {
        if (!allMessages || !Array.isArray(allMessages)) return false;
        const incomingCount = allMessages.filter((m: any) => m.sender_id !== studentId).length;
        const seenCount = typeof window !== 'undefined' ? parseInt(localStorage.getItem('seen_incoming_messages_count') || '0', 10) : 0;
        return incomingCount > seenCount;
    }, [allMessages, studentId]);

    const hasUnreadNotices = React.useMemo(() => {
        if (!announcements || !Array.isArray(announcements)) return false;
        const totalNotices = announcements.length;
        const seenNotices = typeof window !== 'undefined' ? parseInt(localStorage.getItem('seen_notices_count') || '0', 10) : 0;
        return totalNotices > seenNotices;
    }, [announcements]);

    // Clear messages badge when user clicks on Messages tab
    React.useEffect(() => {
        if (activeTab === 'messages' && allMessages && Array.isArray(allMessages)) {
            const incomingCount = allMessages.filter((m: any) => m.sender_id !== studentId).length;
            localStorage.setItem('seen_incoming_messages_count', incomingCount.toString());
        }
    }, [activeTab, allMessages, studentId]);

    // Clear notices badge when user clicks on notices tab
    React.useEffect(() => {
        if (activeTab === 'notices' && announcements && Array.isArray(announcements)) {
            localStorage.setItem('seen_notices_count', announcements.length.toString());
        }
    }, [activeTab, announcements]);

    const studentFullName = studentInfo ? `${studentInfo.name} ${studentInfo.surname}` : 'მოსწავლე';

    useEffect(() => {
        try {
            if (!validateSession('student')) {
                clearAuthSession();
                navigate('/', { replace: true });
            }
        } catch {
            clearAuthSession();
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleLogout = () => {
        clearAuthSession();
        navigate('/', { replace: true });
    };

    if (!studentId || !classId) {
        clearAuthSession();
        navigate('/', { replace: true });
        return null;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'grades':
                return <StudentSubjectsGrades studentId={studentId} classId={classId} />;
            case 'timeline':
                return <DailyTimeline classId={classId} />;
            case 'homework':
                return <HomeworkModule userRole="student" userId={studentId} userName={studentFullName} classId={classId} selectedColor={selectedColor} />;
            case 'notices':
                return <NoticeBoard currentUser={{ id: studentId, name: studentFullName, role: 'student', classId: classId }} />;
            case 'messages':
                return <ChatModule currentUser={{ id: studentId, name: studentFullName, role: 'student' }} />;
        }
    };

    return (
        <div className="admin-page-wrapper">
            <div
                className="admin-page-bg-glow"
                style={{ background: `radial-gradient(circle at center, ${selectedColor}26 0%, transparent 70%)` }}
            />
            <ColorPalette />
            <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAltIcon /> გამოსვლა
            </button>

            <div className="admin-page-content">
                {/* Header Banner */}
                <header className="admin-page-header animate-fade-in-down" style={{ marginBottom: '24px' }}>
                    <h1 className="admin-page-title">
                        მოსწავლის <span style={{ color: selectedColor }}>პანელი</span>
                    </h1>
                    <p className="admin-page-subtitle">
                        {getGreeting()}, {studentFullName} • {getGeorgianDate()}
                    </p>
                </header>

                {/* Profile & Quick Info Card */}
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto 24px auto',
                    background: 'rgba(26, 43, 85, 0.75)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}aa)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '20px',
                            boxShadow: `0 4px 15px ${selectedColor}40`
                        }}>
                            {studentInfo?.name?.[0] || 'მ'}{studentInfo?.surname?.[0] || ''}
                        </div>
                        <div>
                            <div style={{ color: 'white', fontSize: '18px', fontWeight: 800 }}>
                                {studentFullName}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '2px' }}>
                                ელექტრონული ჟურნალი • ESCHOOLS
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {studentInfo?.classInfo?.classname && (
                            <div style={{
                                padding: '8px 16px',
                                borderRadius: '12px',
                                background: `${selectedColor}20`,
                                border: `1px solid ${selectedColor}50`,
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FaUserGraduate size={14} color={selectedColor} />
                                კლასი: {studentInfo.classInfo.classname}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsPassModalOpen(true)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FaKey size={13} color="#fbbf24" /> პაროლის შეცვლა
                        </button>
                    </div>
                </div>

                {/* Student Password Change Modal */}
                {isPassModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                        <div style={{ background: 'rgba(26, 43, 85, 0.95)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: 800 }}>პაროლის შეცვლა</h3>
                                <button type="button" onClick={() => setIsPassModalOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                                    <FaRegTimesCircle size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {passError && <div style={{ color: '#ef4444', background: '#ef444415', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>{passError}</div>}
                                {passSuccess && <div style={{ color: '#10b981', background: '#10b98115', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>{passSuccess}</div>}
                                
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: 600 }}>მიმდინარე პაროლი</label>
                                    <div style={{ position: 'relative', width: '100%' }}>
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            autoCorrect="off"
                                            autoCapitalize="none"
                                            spellCheck={false}
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="admin-input"
                                            style={{ width: '100%', paddingRight: '42px', boxSizing: 'border-box' }}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            style={{
                                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                                                padding: 0, minHeight: 'auto', minWidth: 'auto', display: 'flex', alignItems: 'center'
                                            }}
                                        >
                                            {showOldPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: 600 }}>ახალი პაროლი</label>
                                    <div style={{ position: 'relative', width: '100%' }}>
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            autoCorrect="off"
                                            autoCapitalize="none"
                                            spellCheck={false}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="admin-input"
                                            style={{ width: '100%', paddingRight: '42px', boxSizing: 'border-box' }}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{
                                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                                                padding: 0, minHeight: 'auto', minWidth: 'auto', display: 'flex', alignItems: 'center'
                                            }}
                                        >
                                            {showNewPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: 600 }}>დაადასტურეთ ახალი პაროლი</label>
                                    <div style={{ position: 'relative', width: '100%' }}>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            autoCorrect="off"
                                            autoCapitalize="none"
                                            spellCheck={false}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="admin-input"
                                            style={{ width: '100%', paddingRight: '42px', boxSizing: 'border-box' }}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{
                                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                                                padding: 0, minHeight: 'auto', minWidth: 'auto', display: 'flex', alignItems: 'center'
                                            }}
                                        >
                                            {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                    <button type="submit" className="admin-submit-btn" disabled={passLoading} style={{ flex: 1 }}>
                                        {passLoading ? 'მუშავდება...' : 'შენახვა'}
                                    </button>
                                    <button type="button" onClick={() => setIsPassModalOpen(false)} className="admin-cancel-btn">
                                        გაუქმება
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div style={{ maxWidth: '1200px', margin: '0 auto 24px auto' }}>
                    <div className="admin-tabs" style={{ justifyContent: 'center' }}>
                        <button
                            onClick={() => setActiveTab('grades')}
                            className={`admin-tab-btn ${activeTab === 'grades' ? 'active' : ''}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaGraduationCap size={16} /> ნიშნები
                        </button>
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`admin-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaCalendarAlt size={16} /> დღის განრიგი
                        </button>
                        <button
                            onClick={() => setActiveTab('homework')}
                            className={`admin-tab-btn ${activeTab === 'homework' ? 'active' : ''}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaTasks size={16} /> დავალებები
                        </button>
                        <button
                            onClick={() => setActiveTab('notices')}
                            className={`admin-tab-btn ${activeTab === 'notices' ? 'active' : ''}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
                        >
                            <FaBullhorn size={16} /> განცხადებები
                            {hasUnreadNotices && (
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#ef4444',
                                    boxShadow: '0 0 6px #ef4444'
                                }} />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`admin-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
                        >
                            <FaComments size={16} /> ჩატი
                            {hasUnreadMessages && (
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#ef4444',
                                    boxShadow: '0 0 6px #ef4444'
                                }} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Active Tab Panel Content */}
                <div className="admin-main-view animate-zoom-in" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default Student;
