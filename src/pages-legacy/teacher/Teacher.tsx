"use client";
import React, { useState, useEffect } from "react";
import { FaChalkboardTeacher, FaHistory, FaBookOpen, FaTasks, FaKey, FaRegTimesCircle, FaBullhorn, FaComments, FaCalendarAlt, FaArrowLeft } from "react-icons/fa";
import HomeworkModule from "../../components/HomeworkModule";
import NoticeBoard from "../../components/NoticeBoard";
import ChatModule from "../../components/ChatModule";
import { useQuery } from "@tanstack/react-query";
import { GiTeacher } from "react-icons/gi";
import { MdAdd, MdOutlineWarningAmber } from "react-icons/md";
import { IoStatsChartSharp, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const EyeIcon = IoEyeOutline as React.FC<{ size?: number | string }>;
const EyeOffIcon = IoEyeOffOutline as React.FC<{ size?: number | string }>;
import { IconType } from "react-icons";
import { useColor } from "./../../components/ColorContext";
import ColorPalette from "./../../components/ColorPalette";
import { useNavigate, Routes, Route, useParams, useSearchParams } from "react-router-dom"; // For navigation after logout and useParams
import InfoModal from "../../components/InfoModal";
import DetailedGradeHistory from "../../components/admin/DetailedGradeHistory";
import { clearAuthSession, validateSession } from "@/lib/auth";
import "../admin/Admin.css";

const FaChalkboardTeacherIcon = FaChalkboardTeacher as React.ComponentType<{
  size?: number | string;
}>;
const GiTeacherIcon = GiTeacher as React.ComponentType<{
  size?: number | string;
}>;
const ArrowLeftIcon = FaArrowLeft as React.ComponentType<{
  size?: number | string;
}>;

const fromDate = `${new Date().getFullYear()}-01-01`;
const toDate = new Date().toISOString().slice(0, 10);

const TutorClassDetails: React.FC<{
  allSubjects: any[];
  allTeachers: any[];
  tutorClass: any;
  selectedColor: string;
  onSelectSubject?: (subjectId: string, subjectName: string) => void;
  onViewAllGrades?: () => void;
}> = ({ allSubjects, allTeachers, tutorClass, selectedColor, onSelectSubject, onViewAllGrades }) => {
  if (!tutorClass) return null;
  const subjectsList = [...(tutorClass.subjects || [])].sort((a: any, b: any) => {
    const subjA = allSubjects.find((s: any) => s._id === a.subject_id)?.name || "";
    const subjB = allSubjects.find((s: any) => s._id === b.subject_id)?.name || "";
    return subjA.localeCompare(subjB, "ka");
  });
  return (
    <div className="admin-list-container" style={{ padding: '28px', width: '100%', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 8px 25px rgba(0,0,0,0.04)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        paddingBottom: '24px',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#2563eb',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '22px',
            flexShrink: 0,
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
          }}>
            {tutorClass.classname}
          </div>
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 800 }}>
              სადამრიგებლო კლასი
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>
              {subjectsList.length} საგანი
            </div>
          </div>
        </div>

        {onViewAllGrades && (
          <button
            onClick={onViewAllGrades}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📊 კლასის სრული ჟურნალი (ყველა ნიშანი)
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {subjectsList.map((subj: { subject_id: string; teacher_id: string }) => {
          const subjObj = allSubjects.find((s: { _id: string }) => s._id === subj.subject_id);
          const subjName = subjObj ? subjObj.name : "უცნობი საგანი";
          const teacherObj = allTeachers.find((t: { _id: string }) => t._id === subj.teacher_id);
          const teacherName = teacherObj
            ? `${teacherObj.name} ${teacherObj.surname}`
            : "უცნობი მასწავლებელი";
          return (
            <div 
              key={subj.subject_id} 
              className="tutor-subject-row"
              onClick={() => onSelectSubject && onSelectSubject(subj.subject_id, subjName)}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FaBookOpen size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{subjName}</div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{teacherName}</div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSubject && onSelectSubject(subj.subject_id, subjName);
                }}
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#2563eb',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                📊 ნიშნების ნახვა
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TeacherChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedColor: string;
}

const TeacherChangePasswordModal: React.FC<TeacherChangePasswordModalProps> = ({
  isOpen,
  onClose,
  selectedColor,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

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
    setPassLoading(true);
    try {
      const loginData = JSON.parse(localStorage.getItem('login') || '{}');
      const user_ID = loginData.user_ID;
      const res = await fetch('/api/teacher/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: user_ID, oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassSuccess('პაროლი წარმატებით შეიცვალა!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
          setPassSuccess('');
        }, 1200);
      } else {
        setPassError(data.message || 'შეცდომა პაროლის შეცვლისას');
      }
    } catch {
      setPassError('სერვერთან კავშირი ვერ დამყარდა');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'rgba(26, 43, 85, 0.9)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: 800 }}>პაროლის შეცვლა</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
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
            <button type="button" onClick={onClose} className="admin-cancel-btn">
              გაუქმება
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Teacher: React.FC = () => {
  const BoxWidth = 350;
  const BoxGap = 20;
  const { selectedColor } = useColor();
  const navigate = useNavigate();
  const [teachesClasses, setTeachesClasses] = useState<any[]>([]);
  const [tutorClasses, setTutorClasses] = useState<any[]>([]);
  const [selectedTutorClass, setSelectedTutorClass] = useState<any | null>(
    null,
  );
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState("");
  const [view, setView] = useState<"main" | "gradeEntry" | "gradeHistory">(
    "main",
  );
  const [historyClassId, setHistoryClassId] = useState<string | null>(null);
  const [pointType, setPointType] = useState(2); // Default to "აღრიცხვა" (2)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editGrade, setEditGrade] = useState<any>(null); // grade object
  const [editPoint, setEditPoint] = useState("");
  const [editPointType, setEditPointType] = useState(2);
  const [editLoading, setEditLoading] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [teacherSchedule, setTeacherSchedule] = useState<any[][]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "calendar" | "homeroom" | "teaching" | "notices" | "messages"
  >("teaching");

  // Get current logged-in teacher info for chat and notices
  const chatLoginData = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem("login") || "{}" : "{}");
  const currentUserID = chatLoginData.user_ID || "";
  const teacherObjForChat = allTeachers.find((t: any) => t.user_ID === currentUserID);
  const teacherIdForChat = teacherObjForChat?._id || currentUserID;
  const teacherNameForChat = teacherObjForChat ? `${teacherObjForChat.name} ${teacherObjForChat.surname}` : "მასწავლებელი";

  // Fetch teacher messages for unread badge evaluation
  const { data: teacherMessages } = useQuery({
    queryKey: ['teacher-messages-unread', teacherIdForChat],
    queryFn: async () => {
      const response = await fetch(`/api/messages?user_id=${teacherIdForChat}`);
      if (!response.ok) throw new Error();
      return response.json();
    },
    enabled: !!teacherIdForChat,
    refetchInterval: 5000
  });

  // Fetch announcements for unread badge evaluation
  const { data: teacherAnnouncements } = useQuery({
    queryKey: ['announcements-unread-teacher'],
    queryFn: async () => {
      const response = await fetch('/api/announcements');
      if (!response.ok) throw new Error();
      return response.json();
    },
    refetchInterval: 8000
  });

  const hasUnreadTeacherMessages = React.useMemo(() => {
    if (!teacherMessages || !Array.isArray(teacherMessages)) return false;
    const incomingCount = teacherMessages.filter((m: any) => m.sender_id !== teacherIdForChat).length;
    const seenCount = typeof window !== 'undefined' ? parseInt(localStorage.getItem('seen_incoming_messages_count_teacher') || '0', 10) : 0;
    return incomingCount > seenCount;
  }, [teacherMessages, teacherIdForChat]);

  const hasUnreadTeacherNotices = React.useMemo(() => {
    if (!teacherAnnouncements || !Array.isArray(teacherAnnouncements)) return false;
    const totalNotices = teacherAnnouncements.length;
    const seenNotices = typeof window !== 'undefined' ? parseInt(localStorage.getItem('seen_notices_count_teacher') || '0', 10) : 0;
    return totalNotices > seenNotices;
  }, [teacherAnnouncements]);

  useEffect(() => {
    if (activeTab === 'messages' && teacherMessages && Array.isArray(teacherMessages)) {
      const incomingCount = teacherMessages.filter((m: any) => m.sender_id !== teacherIdForChat).length;
      localStorage.setItem('seen_incoming_messages_count_teacher', incomingCount.toString());
    }
  }, [activeTab, teacherMessages, teacherIdForChat]);

  useEffect(() => {
    if (activeTab === 'notices' && teacherAnnouncements && Array.isArray(teacherAnnouncements)) {
      localStorage.setItem('seen_notices_count_teacher', teacherAnnouncements.length.toString());
    }
  }, [activeTab, teacherAnnouncements]);

  // Password change modal visibility state
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      // Get teacher user_ID from localStorage
      const loginData = JSON.parse(localStorage.getItem("login") || "{}");
      const user_ID = loginData.user_ID;
      if (!user_ID) return;
      // Fetch all classes
      const res = await fetch("/api/classes");
      if (!res.ok) return;
      const allClasses = await res.json();
      // Fetch all teachers to get _id for this user_ID and for subject display
      const tRes = await fetch("/api/teacher/all");
      if (!tRes.ok) return;
      const teachers = await tRes.json();
      if (Array.isArray(teachers)) {
        teachers.sort((a: any, b: any) => `${a.name || ''} ${a.surname || ''}`.localeCompare(`${b.name || ''} ${b.surname || ''}`, 'ka'));
      }
      setAllTeachers(teachers);
      const teacher = teachers.find((t: any) => t.user_ID === user_ID);
      if (!teacher) return;
      const teacherId = teacher._id;
      // Fetch all subjects for subject names
      const subjRes = await fetch("/api/subjects");
      if (!subjRes.ok) return;
      const subjects = await subjRes.json();
      if (Array.isArray(subjects)) {
        subjects.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', 'ka'));
      }
      setAllSubjects(subjects);
      // Tutor classes
      const tutor = allClasses.filter((cls: any) => cls.damrigebeli === teacherId);
      // Teaches classes (any subject with hours_per_week > 0)
      const teaches = allClasses
        .filter(
          (cls: any) =>
            Array.isArray(cls.subjects) &&
            cls.subjects.some((subj: any) => 
              subj.teacher_id === teacherId && 
              (subj.hours_per_week === undefined || subj.hours_per_week > 0)
            ),
        )
        .map((cls: any) => {
          // Find subjects this teacher teaches in this class
          const teacherSubjects = (cls.subjects || [])
            .filter((subj: any) => 
              subj.teacher_id === teacherId && 
              (subj.hours_per_week === undefined || subj.hours_per_week > 0)
            )
            .map((subj: any) => {
              const subjObj = subjects.find(
                (s: any) => s._id === subj.subject_id,
              );
              return subjObj ? subjObj.name : "";
            })
            .filter((name: string) => !!name);
          return { ...cls, teacherSubjects };
        })
        .filter((cls: any) => cls.teacherSubjects && cls.teacherSubjects.length > 0);
      setTutorClasses(tutor);
      setTeachesClasses(teaches);
      // Fetch teacher schedule
      setScheduleLoading(true);
      const scheduleRes = await fetch(
        `/api/teacher/schedule?user_ID=${encodeURIComponent(user_ID)}&teacher_id=${encodeURIComponent(teacherId || "")}`,
      );
      if (scheduleRes.ok) {
        const sched = await scheduleRes.json();
        setTeacherSchedule(sched);
      }
      setScheduleLoading(false);
    };
    fetchClasses();
  }, []);

  const AdminContainer: React.CSSProperties = {
    width: "100%",
    minHeight: "100dvh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    gap: "20px",
    textTransform: "uppercase",
    fontWeight: "700",
    color: "white",
    position: "relative",
    boxSizing: "border-box",
    padding: "60px 16px 20px",
  };

  const BoxTitle = (): React.CSSProperties => ({
    fontSize: "clamp(22px, 5vw, 36px)",
    textAlign: "center",
    width: "100%",
  });

  const AdminContent = (gap = BoxGap): React.CSSProperties => ({
    width: "100%",
    maxWidth: `${BoxWidth * 2 + gap}px`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: `${gap}px`,
    boxSizing: "border-box",
    padding: "0 8px",
  });

  const AdminBox = (
    boxWidth = BoxWidth,
    isHovered: boolean,
  ): React.CSSProperties => ({
    backgroundColor: selectedColor,
    fontSize: "clamp(16px, 3vw, 20px)",
    width: "100%",
    maxWidth: `${boxWidth}px`,
    minWidth: "200px",
    flex: "1 1 200px",
    minHeight: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "16px",
    boxShadow: isHovered
      ? "0 12px 24px rgba(0, 0, 0, 0.3)"
      : "0 8px 16px rgba(0, 0, 0, 0.2)",
    transform: isHovered ? "scale(1.03)" : "scale(1)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    color: "white",
    gap: "10px",
    textAlign: "center",
    padding: "12px",
  });



  useEffect(() => {
    try {
      if (!validateSession('teacher')) {
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

  // Helper to check if a date is within 14 days from today
  function isWithin14Days(dateStr: string) {
    const today = new Date();
    const date = new Date(dateStr);
    const diff = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 14 && diff >= 0;
  }

  // Get user role from localStorage
  const loginData = JSON.parse(localStorage.getItem("login") || "{}");
  const isTeacher = loginData.role === "teacher";

  // Helper: Days and lessons
  const days = ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ"];
  const lessons = [1, 2, 3, 4, 5, 6, 7];
  const lessonRoman = ["1", "2", "3", "4", "5", "6", "7"];

  // Teacher calendar table component
  const TeacherCalendarTable: React.FC<{ schedule: any[][] }> = ({
    schedule,
  }) => {
    const { data: calendarEvents } = useQuery<any[]>({
      queryKey: ['calendar-events-teacher-table'],
      queryFn: async () => {
        const res = await fetch('/api/calendar-events');
        if (!res.ok) return [];
        return res.json();
      },
      refetchInterval: 10000
    });

    const hasEvents = calendarEvents && calendarEvents.length > 0;

    const getWeekDate = (dayOffsetIndex: number) => {
      const now = new Date();
      const currentDay = now.getDay(); // 0=Sun, 1=Mon...6=Sat
      const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
      const d = new Date(now);
      d.setDate(now.getDate() + diffToMon + dayOffsetIndex);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const daysNames = ["ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი"];
    const daysShort = ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ"];

    // Find makeup events for current week
    const currentWeekEvents = (calendarEvents || []).filter(evt => {
      const monStr = getWeekDate(0);
      const satStr = getWeekDate(5);
      return evt.date >= monStr && evt.date <= satStr;
    });

    const makeupEventThisWeek = currentWeekEvents.find(e => e.type === 'makeup');
    const hasSaturdayMakeup = !!makeupEventThisWeek;

    const activeDayIndices = [0, 1, 2, 3, 4];
    if (hasSaturdayMakeup) {
      activeDayIndices.push(5); // Saturday
    }

    return (
      <div className="schedule-grid-container">
        {/* Makeup notice about Saturday */}
        {makeupEventThisWeek && (
          <div style={{
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1.5px solid #0284c7',
            borderRadius: '12px',
            padding: '14px 18px',
            color: '#0369a1',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)'
          }}>
            <span style={{ fontSize: '18px' }}>📌</span>
            <div>
              <strong>შაბათი ({makeupEventThisWeek.date}):</strong> ტარდება აღდგენითი სწავლა! (აღადგენს <strong>{daysNames[makeupEventThisWeek.replacementDayOfWeek ?? 0]}ს</strong> გაკვეთილებს — {makeupEventThisWeek.title})
            </div>
          </div>
        )}

        {/* Schedule Header */}
        <div className="schedule-header-grid" style={{
          gridTemplateColumns: `60px repeat(${activeDayIndices.length}, 1fr)`
        }}>
          <div className="schedule-day-pill" style={{ opacity: 0 }}></div> {/* Spacer for time column */}
          {activeDayIndices.map((dayIdx) => {
            const dateStr = getWeekDate(dayIdx);
            const isSat = dayIdx === 5;
            const eventForDay = (calendarEvents || []).find(e => e.date === dateStr);
            const isHolidayOnly = eventForDay?.type === 'holiday';

            return (
              <div
                key={dayIdx}
                className="schedule-day-pill"
                style={{
                  backgroundColor: isSat ? '#0284c7' : isHolidayOnly ? '#ef4444' : undefined,
                  color: (isSat || isHolidayOnly) ? '#ffffff' : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 4px'
                }}
              >
                <span>{isSat ? `შაბ (აღდგენა)` : daysShort[dayIdx]}</span>
                {isHolidayOnly && <span style={{ fontSize: '10px', opacity: 0.9 }}>(უქმე)</span>}
              </div>
            );
          })}
        </div>

        {/* Schedule Rows */}
        {lessons.map((lessonIdx, rowIdx) => (
          <div key={lessonIdx} className="schedule-row" style={{
            gridTemplateColumns: `60px repeat(${activeDayIndices.length}, 1fr)`
          }}>
            <div className="schedule-time-slot">
              {lessonRoman[rowIdx]}
            </div>
            {activeDayIndices.map((dayIdx) => {
              const dateStr = getWeekDate(dayIdx);
              const eventForDay = (calendarEvents || []).find(e => e.date === dateStr);
              const isHoliday = eventForDay?.type === 'holiday';

              // Effective schedule index
              let effectiveIdx = dayIdx;
              if (dayIdx === 5 && makeupEventThisWeek && makeupEventThisWeek.replacementDayOfWeek !== undefined) {
                effectiveIdx = makeupEventThisWeek.replacementDayOfWeek;
              }

              // If holiday without makeup replacement on that weekday, empty/remove lessons
              const slot = isHoliday ? null : schedule[effectiveIdx]?.[lessonIdx - 1];

              const getResolvedSubject = (s: any) => {
                if (!s) return "";
                if (s.subject_id) {
                  const foundSub = allSubjects.find((sub: any) => sub._id === s.subject_id || sub._id?.toString() === s.subject_id?.toString());
                  if (foundSub?.name) return foundSub.name;
                }
                if (s.subjectName && s.subjectName.trim() !== '') {
                  return s.subjectName;
                }
                const matchedCls = teachesClasses.find((c: any) =>
                  c._id === s.class_id || c.classname === s.className
                );
                if (matchedCls && matchedCls.teacherSubjects && matchedCls.teacherSubjects.length === 1) {
                  return matchedCls.teacherSubjects[0];
                }
                return "";
              };
              const subjText = getResolvedSubject(slot);

              return (
                <div
                  key={dayIdx}
                  className={`schedule-lesson-card ${slot ? 'active' : ''}`}
                  style={{
                    backgroundColor: isHoliday ? 'rgba(239, 68, 68, 0.08)' : undefined,
                    borderColor: isHoliday ? 'rgba(239, 68, 68, 0.2)' : undefined
                  }}
                >
                  {isHoliday ? (
                    <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 800 }}>🔴 დასვენება</span>
                  ) : slot ? (
                    <div className="schedule-subject-name" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textAlign: 'center', padding: '4px' }}>
                      <span style={{ fontWeight: 900, fontSize: '15px', color: '#0f172a' }}>{slot.className}</span>
                      {subjText ? (
                        <span style={{
                          fontSize: '12px',
                          color: '#2563eb',
                          fontWeight: '800',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          display: 'inline-block',
                          maxWidth: '100%',
                          wordBreak: 'break-word'
                        }}>
                          {subjText}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <span className="schedule-empty">---</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* List of Holidays and Makeup Days AT THE BOTTOM */}
        <div style={{
          marginTop: '24px',
          padding: '18px 20px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📅</span> დასვენების და აღდგენის დღეების სია
          </h4>

          {hasEvents ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {calendarEvents.map((evt) => (
                <div
                  key={evt._id || evt.date}
                  style={{
                    backgroundColor: evt.type === 'holiday' ? '#fef2f2' : '#f0f9ff',
                    border: evt.type === 'holiday' ? '1px solid #fecaca' : '1px solid #bae6fd',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: evt.type === 'holiday' ? '#991b1b' : '#0369a1',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: evt.type === 'holiday' ? '#ef4444' : '#0284c7',
                      color: '#ffffff'
                    }}>
                      {evt.type === 'holiday' ? '🔴 დასვენება' : '🔵 აღდგენა'}
                    </span>
                    <strong>{evt.date}</strong> — <span>{evt.title}</span>
                  </div>

                  {evt.type === 'makeup' && evt.replacementDayOfWeek !== undefined && (
                    <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 800 }}>
                      📌 შაბათი ({evt.date}) — აღადგენს {daysNames[evt.replacementDayOfWeek]}ს გაკვეთილებს
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              დასვენების ან აღდგენის დღეები ჯერ არ არის დამატებული.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Unified Teacher Layout Component
  const renderTeacherLayout = (children: React.ReactNode) => {
    return (
      <div className="admin-page-wrapper">
        <div
          className="admin-page-bg-glow"
          style={{ background: `radial-gradient(circle at center, ${selectedColor}26 0%, transparent 70%)` }}
        />
        <div className="admin-header-actions">
          <ColorPalette />
          <button
            onClick={() => setIsPassModalOpen(true)}
            className="admin-header-btn"
          >
            <FaKey size={13} color="#fbbf24" /> <span>პაროლის შეცვლა</span>
          </button>
          <button className="admin-header-btn logout" onClick={handleLogout}>
            გამოსვლა
          </button>
        </div>
        <div className="admin-page-content">
          <header className="admin-page-header animate-fade-in-down">
            <h1 className="admin-page-title">
              მასწავლებლის <span style={{ color: selectedColor }}>პანელი</span>
            </h1>
            <p className="admin-page-subtitle">სასწავლო პროცესის მართვის სისტემა</p>
          </header>
          <div className="admin-main-view animate-zoom-in" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {children}
          </div>
        </div>

        {/* Teacher Password Change Modal */}
        <TeacherChangePasswordModal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          selectedColor={selectedColor}
        />
      </div>
    );
  };

  // Teach class options page
  const TeachClassOptionsPage: React.FC = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const classObj = teachesClasses.find((cls: any) => cls._id === id);

    const handleCardClick = (label: string) => {
      const query = new URLSearchParams();
      if (searchParams.get("subject_id")) query.set("subject_id", searchParams.get("subject_id")!);
      if (searchParams.get("subject_name")) query.set("subject_name", searchParams.get("subject_name")!);
      if (searchParams.get("lesson_num")) query.set("lesson_num", searchParams.get("lesson_num")!);
      const qStr = query.toString() ? `?${query.toString()}` : '';

      if (label === "ნიშნის შეტანა") {
        navigate(`/teacher/teach/${id}/grade${qStr}`);
      } else if (label === "ისტორია") {
        navigate(`/teacher/teach/${id}/history${qStr}`);
      } else if (label === "სტატისტიკა") {
        navigate(`/teacher/teach/${id}/statistics${qStr}`);
      } else if (label === "დავალებები") {
        navigate(`/teacher/teach/${id}/homework${qStr}`);
      }
    };

    return renderTeacherLayout(
        <div className="admin-view-container" style={{ maxWidth: '800px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => navigate("/teacher")}
            className="admin-back-btn"
            style={{ alignSelf: 'flex-start', marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeftIcon size={18} /> უკან დაბრუნება
          </button>
          <div className="admin-view-header" style={{ justifyContent: 'center', marginTop: '10px', flexDirection: 'column', gap: '6px' }}>
            <h2 className="admin-view-title" style={{ fontSize: '32px', fontWeight: 800 }}>{classObj ? classObj.classname : ""}</h2>
            {classObj?.teacherSubjects && classObj.teacherSubjects.length > 0 && (
              <div style={{ fontSize: '15px', color: '#2563eb', fontWeight: 800, background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 16px', borderRadius: '20px' }}>
                📖 {classObj.teacherSubjects.join(", ")}
              </div>
            )}
          </div>
          <div className="admin-grid" style={{ marginTop: '30px', width: '100%', justifyContent: 'center' }}>
            {[
              { label: "მოსწავლეთა დასწრების და შეფასების აღრიცხვა", icon: MdAdd },
              { label: "დავალებები", icon: FaTasks },
              { label: "ისტორია", icon: FaHistory },
              { label: "სტატისტიკა", icon: IoStatsChartSharp },
            ].map((item, idx) => (
              <div
                key={item.label}
                className="admin-card"
                onClick={() => handleCardClick(item.label)}
              >
                <div className="admin-card-icon-wrapper">
                  <item.icon size={32} />
                </div>
                <div className="admin-card-label">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
    );
  };

  // Teacher Homework Page
  const TeacherHomeworkPage: React.FC = () => {
    const { id } = useParams();
    const loginData = JSON.parse(localStorage.getItem("login") || "{}");
    const user_ID = loginData.user_ID || "teacher";
    const teacherObj = allTeachers.find((t: any) => t.user_ID === user_ID);
    const teacherName = teacherObj ? `${teacherObj.name} ${teacherObj.surname}` : "მასწავლებელი";

    return renderTeacherLayout(
        <div className="admin-view-container" style={{ maxWidth: "900px", width: "100%", margin: "0 auto" }}>
          <button
            type="button"
            onClick={() => navigate(`/teacher/teach/${id}`)}
            className="admin-back-btn"
            style={{ marginBottom: "24px", display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeftIcon size={18} /> უკან დაბრუნება
          </button>
          <HomeworkModule
            userRole="teacher"
            userId={teacherObj?._id || user_ID}
            userName={teacherName}
            classId={id}
            selectedColor={selectedColor}
          />
        </div>
    );
  };

  // Grade entry page
  const GradeEntryPage: React.FC = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const urlSubjectId = searchParams.get("subject_id");
    const urlSubjectName = searchParams.get("subject_name");
    const urlLessonNum = searchParams.get("lesson_num");

    const { data: classExams } = useQuery<any[]>({
      queryKey: ['class-scheduled-exams-entry', id],
      queryFn: async () => {
        if (!id) return [];
        const res = await fetch(`/api/exams?class_id=${id}`);
        if (!res.ok) return [];
        return res.json();
      },
      enabled: !!id,
      refetchInterval: 10000
    });
    const [students, setStudents] = useState<any[]>([]);
    const [gradeType, setGradeType] = useState("აღრიცხვა");
    const [grades, setGrades] = useState<{
      [studentId: string]: { attendance: boolean; point: string; comment?: string; excuse_reason?: string };
    }>({});
    const [isProjectToggle, setIsProjectToggle] = useState(false);
    const [lessonNum, setLessonNum] = useState<number>(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!pointType) setPointType(2);
    }, [pointType]);

    useEffect(() => {
      if (urlSubjectId) {
        setSelectedSubject(urlSubjectId);
      }
      if (urlLessonNum && !isNaN(Number(urlLessonNum))) {
        setLessonNum(Number(urlLessonNum));
      }
    }, [urlSubjectId, urlLessonNum]);
    const [date, setDate] = useState(() => {
      const today = new Date();
      return today.toISOString().split("T")[0];
    });
    // For custom Georgian date picker
    const georgianMonths = [
      "იანვარი",
      "თებერვალი",
      "მარტი",
      "აპრილი",
      "მაისი",
      "ივნისი",
      "ივლისი",
      "აგვისტო",
      "სექტემბერი",
      "ოქტომბერი",
      "ნოემბერი",
      "დეკემბერი",
    ];
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [day, setDay] = useState(today.getDate());
    // Teacher's allowed start date
    const [gradeEntryStartDate, setGradeEntryStartDate] = useState<
      string | null
    >(null);
    const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);

    useEffect(() => {
      const fetchStudentsAndStartDate = async () => {
        setLoading(true);
        // Fetch only students of this class (by grade + parallel from classname)
        const classObj = teachesClasses.find((cls: any) => cls._id === id);
        const match = classObj?.classname.match(/^([0-9]+)([ა-ჰ])$/);
        const studentsUrl = match
          ? `/api/student/grade/${match[1]}?parallel=${encodeURIComponent(match[2])}`
          : "/api/student/all";
        const res = await fetch(studentsUrl);
        if (!res.ok) return;
        const fetched = await res.json();
        const classStudents = (match
          ? fetched
          : fetched.filter((s: any) => s.classInfo && s.classInfo._id === id))
          .sort((a: any, b: any) => `${a.surname || ''} ${a.name || ''}`.localeCompare(`${b.surname || ''} ${b.name || ''}`, 'ka'));
        setStudents(classStudents);
        // Initialize grades state
        const initialGrades: {
          [studentId: string]: { attendance: boolean; point: string; excuse_reason?: string };
        } = {};
        classStudents.forEach((s: any) => {
          initialGrades[s._id] = { attendance: true, point: "" };
        });
        setGrades(initialGrades);
        // Fetch teacher's allowed start date (mock: get from /api/teacher/all)
        const loginData = JSON.parse(localStorage.getItem("login") || "{}");
        const user_ID = loginData.user_ID;
        const tRes = await fetch("/api/teacher/all");
        if (tRes.ok) {
          const allTeachers = await tRes.json();
          const teacher = allTeachers.find((t: any) => t.user_ID === user_ID);
          if (teacher) {
            setCurrentTeacherId(teacher._id);
            if (teacher.gradeEntryStartDate) {
              setGradeEntryStartDate(teacher.gradeEntryStartDate);
            } else {
              // Default: 14 days window
              const defaultStart = new Date();
              defaultStart.setDate(defaultStart.getDate() - 13);
              setGradeEntryStartDate(defaultStart.toISOString().split("T")[0]);
            }
          }
        }
        setLoading(false);
      };
      fetchStudentsAndStartDate();
    }, [id]);

    // Handle day changes when month/year changes
    useEffect(() => {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      if (day > daysInMonth) {
        setDay(daysInMonth);
      }
    }, [year, month, day]);

    // Fetch existing grades when date, subject, or lessonNum changes
    useEffect(() => {
      if (!id || !selectedSubject || !day || !month || !year || students.length === 0) return;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const fetchExistingGrades = async () => {
        try {
          const res = await fetch(`/api/grades?class_id=${id}&subject_id=${selectedSubject}&date=${dateStr}&lesson_num=${lessonNum}`);
          if (res.ok) {
            const existingGradesList = await res.json();
            if (Array.isArray(existingGradesList) && existingGradesList.length > 0) {
              const newGradesState: Record<string, any> = {};
              students.forEach((s: any) => {
                newGradesState[s._id] = { attendance: true, point: "", comment: "" };
              });
              existingGradesList.forEach((g: any) => {
                const sId = String(g.student_id);
                newGradesState[sId] = {
                  attendance: g.checked ?? true,
                  point: g.point >= 0 ? String(g.point) : (g.comment || (g.is_formative ? "განმავითარებელი" : "")),
                  comment: g.comment || "",
                  excuse_reason: g.excuse_reason
                };
              });
              setGrades(newGradesState);
            }
          }
        } catch (err) {
          console.error("Error fetching existing grades:", err);
        }
      };
      fetchExistingGrades();
    }, [id, selectedSubject, year, month, day, lessonNum, students]);

    // Current year is fixed to current year
    const currentYear = new Date().getFullYear();

    // Memoize allowed dates calculation to prevent unnecessary re-renders
    const allowedDatesList = React.useMemo(() => {
      const maxDateObj = new Date();
      maxDateObj.setHours(0, 0, 0, 0);

      const minDateObj = gradeEntryStartDate
        ? new Date(gradeEntryStartDate)
        : new Date(maxDateObj);
      minDateObj.setHours(0, 0, 0, 0);

      if (minDateObj > maxDateObj) {
        minDateObj.setTime(maxDateObj.getTime() - 14 * 24 * 60 * 60 * 1000);
      }

      const classObj = teachesClasses.find((cls: any) => cls._id === id);

      const hasLessonOnDay = (dayOfWeekIdx: number) => {
        if (!classObj || !classObj.calendar || !Array.isArray(classObj.calendar)) return false;
        const dayLessons = classObj.calendar[dayOfWeekIdx];
        if (!dayLessons || !Array.isArray(dayLessons)) return false;

        return dayLessons.some((entry: any) => {
          if (!entry) return false;
          const teacherMatch = entry.teacher_id && entry.teacher_id.toString() === currentTeacherId;
          const subjectMatch = !selectedSubject || (entry.subject_id && entry.subject_id.toString() === selectedSubject);
          return teacherMatch && subjectMatch;
        });
      };

      const dates: { dateStr: string; year: number; month: number; day: number; label: string }[] = [];
      const curr = new Date(minDateObj);

      while (curr <= maxDateObj) {
        const y = curr.getFullYear();
        const m = curr.getMonth();
        const d = curr.getDate();

        let allowed = true;
        if (currentTeacherId) {
          const dayOfWeek = curr.getDay(); // 0 (Sun) - 6 (Sat)
          const dayOfWeekIdx = dayOfWeek - 1; // 0 (Mon) - 4 (Fri)
          if (dayOfWeekIdx < 0 || dayOfWeekIdx > 4) {
            allowed = false;
          } else {
            allowed = hasLessonOnDay(dayOfWeekIdx);
          }
        }

        if (allowed) {
          const dayFormatted = String(d).padStart(2, '0');
          const monthFormatted = String(m + 1).padStart(2, '0');
          const dateStr = `${y}-${monthFormatted}-${dayFormatted}`;
          const label = `${dayFormatted}.${monthFormatted}`;
          dates.push({ dateStr, year: y, month: m, day: d, label });
        }

        curr.setDate(curr.getDate() + 1);
      }

      return dates;
    }, [gradeEntryStartDate, currentTeacherId, selectedSubject, teachesClasses, id]);

    // Auto-select latest allowed date if the current selected date is not in allowed list
    useEffect(() => {
      if (allowedDatesList.length > 0) {
        const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const exists = allowedDatesList.some((item) => item.dateStr === currentDateStr);
        if (!exists) {
          const latest = allowedDatesList[allowedDatesList.length - 1];
          setYear(latest.year);
          setMonth(latest.month);
          setDay(latest.day);
        }
      }
    }, [allowedDatesList, year, month, day]);

    const handleAttendanceChange = (studentId: string, checked: boolean) => {
      setGrades((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          attendance: checked,
          point: checked ? prev[studentId].point : "",
        },
      }));
    };
    const handlePointChange = (studentId: string, value: string) => {
      setGrades((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], point: value },
      }));
    };
    const handleCommentChange = (studentId: string, commentVal: string) => {
      setGrades((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          comment: commentVal,
          point: commentVal.trim() !== "" ? "განმავითარებელი" : "",
        },
      }));
    };

    // Memoize the student list to prevent unnecessary re-renders
    const memoizedStudents = React.useMemo(() => students, [students]);
    const handleSubmit = async () => {
      if (!selectedSubject) {
        alert("გთხოვთ აირჩიოთ საგანი");
        return;
      }
      // Check comment-only rule (1-4 and 5th grade 1st semester)
      const classObj = teachesClasses.find((cls: any) => cls._id === id);
      const classGradeNum = parseInt(classObj?.classname || "", 10);
      const isFirstSemester = month >= 8 && month <= 11; // Sept (8) to Dec (11)
      const isCommentOnly = (!isNaN(classGradeNum) && classGradeNum >= 1 && classGradeNum <= 4) ||
                           (!isNaN(classGradeNum) && classGradeNum === 5 && isFirstSemester);

      // Compose date string
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      // Get teacherId from localStorage
      const loginData = JSON.parse(localStorage.getItem("login") || "{}");
      const user_ID = loginData.user_ID;
      // Fetch all teachers to get MongoDB _id
      const tRes = await fetch("/api/teacher/all");
      if (!tRes.ok) return alert("მასწავლებლის იდენტიფიკაცია ვერ მოხერხდა");
      const allTeachers = await tRes.json();
      const teacher = allTeachers.find((t: any) => t.user_ID === user_ID);
      if (!teacher) return alert("მასწავლებელი ვერ მოიძებნა");
      const teacherId = teacher._id;
      // Get classId from useParams
      const classId = id;
      // Loop through students and submit grades
      let successCount = 0;
      let errorCount = 0;
      const gradesToSave: any[] = [];
      for (const student of memoizedStudents) {
        const grade = grades[student._id];
        if (!grade) continue;
        const isNumeric = !isNaN(parseInt(grade.point, 10)) && grade.point !== "ჩთ" && grade.point !== "არ ჩთ";
        const pointValue = isNumeric ? parseInt(grade.point, 10) : (grade.point === "ჩთ" || grade.point === "არ ჩთ" ? -3 : -1);
        const commentText = grade.comment || (isCommentOnly ? (grade.point !== "განმავითარებელი" ? grade.point : "") : (typeof grade.point === "string" && !isNumeric && grade.point !== "ჩთ" && grade.point !== "არ ჩთ" ? grade.point : ""));
        const isFormative = isCommentOnly || (typeof commentText === "string" && commentText.trim() !== "");
        const isExcused = grade.attendance === false && grade.excuse_reason && grade.excuse_reason !== "general_unexcused";

        const now = new Date();
        const timeStr = now.toTimeString().split(" ")[0]; // "HH:MM:SS"
        const payload = {
          student_id: student._id,
          teacher_id: teacherId,
          class_id: classId,
          subject_id: selectedSubject,
          pointType: pointType,
          point: pointValue,
          date: dateStr,
          time: timeStr,
          comment: commentText,
          checked: grades[student._id]?.attendance ?? true,
          is_excused: isExcused,
          excuse_reason: isExcused ? grade.excuse_reason : undefined,
          is_formative: isFormative,
          lesson_num: lessonNum
        };
        gradesToSave.push(payload);
      }
      if (gradesToSave.length > 0) {
        const res = await fetch("/api/grades/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gradesToSave),
        });
        if (res.ok) {
          successCount++;
          setInfoModalMessage("ყველა ნიშანი წარმატებით შეინახა!");
          setInfoModalOpen(true);
        } else {
          errorCount++;
          setInfoModalMessage("შეცდომა: ნიშნები ვერ შეინახა!");
          setInfoModalOpen(true);
        }
      }
    };

    const handleBack = () => {
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate("/teacher");
      }
    };

    // Find subjects for this teacher in this class
    const classObj = teachesClasses.find((cls: any) => cls._id === id);
    let teacherSubjects: any[] = [];
    if (classObj && Array.isArray(classObj.subjects)) {
      const loginData = JSON.parse(localStorage.getItem("login") || "{}");
      const user_ID = loginData.user_ID;
      const teacher = allTeachers.find((t: any) => t.user_ID === user_ID);
      if (teacher) {
        teacherSubjects = classObj.subjects.filter(
          (subj: any) => 
            subj.teacher_id === teacher._id && 
            (subj.hours_per_week === undefined || subj.hours_per_week > 0),
        );
      }
    }

    // Auto-select subject if only 1 subject taught by teacher in this class and none selected
    useEffect(() => {
      if (!selectedSubject && teacherSubjects.length === 1 && teacherSubjects[0].subject_id) {
        setSelectedSubject(teacherSubjects[0].subject_id);
      } else if (!selectedSubject && urlSubjectName) {
        const found = allSubjects.find((s: any) => s.name?.toLowerCase() === urlSubjectName.toLowerCase());
        if (found) setSelectedSubject(found._id);
      }
    }, [teacherSubjects, selectedSubject, urlSubjectName, allSubjects]);

    if (loading)
      return (
        <div style={{ color: "white", textAlign: "center", marginTop: "40px" }}>
          იტვირთება...
        </div>
      );

    // Switch style
    const switchStyle: React.CSSProperties = {
      position: "relative",
      display: "inline-block",
      width: "46px",
      height: "24px",
    };
    const sliderStyle: React.CSSProperties = {
      position: "absolute",
      cursor: "pointer",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#ccc",
      borderRadius: "24px",
      transition: ".4s",
    };
    const sliderCheckedStyle: React.CSSProperties = {
      ...sliderStyle,
      backgroundColor: selectedColor,
    };
    const circleStyle: React.CSSProperties = {
      position: "absolute",
      content: '""',
      height: "18px",
      width: "18px",
      left: "3px",
      bottom: "3px",
      backgroundColor: "white",
      borderRadius: "50%",
      transition: ".4s",
    };
    const circleCheckedStyle: React.CSSProperties = {
      ...circleStyle,
      transform: "translateX(22px)",
    };

    const activeSubjectName = allSubjects.find((s: any) => s._id === selectedSubject)?.name || urlSubjectName;

    return renderTeacherLayout(
        <div className="admin-view-container" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
          <button
            type="button"
            onClick={handleBack}
            className="admin-back-btn"
            style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeftIcon size={18} /> უკან დაბრუნება
          </button>

          <div className="admin-form-container" style={{ maxWidth: '100%', marginBottom: '40px' }}>
            <h2 className="admin-form-title">მოსწავლეთა დასწრების და შეფასების აღრიცხვა</h2>

            {activeSubjectName && (
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1.5px solid #bfdbfe',
                borderRadius: '14px',
                padding: '12px 18px',
                marginBottom: '24px',
                color: '#1e40af',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>📌</span>
                  <span>
                    შედიხართ საგანში: <strong style={{ color: '#1e3a8a', fontSize: '15px' }}>{activeSubjectName}</strong>
                  </span>
                </div>
                {lessonNum > 0 && (
                  <span style={{ background: '#2563eb', color: '#ffffff', padding: '4px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800 }}>
                    {lessonNum}-ე გაკვეთილი
                  </span>
                )}
              </div>
            )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="admin-form-group">
              <label className="admin-label">საგანი:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="admin-select"
              >
                <option value="">აირჩიეთ საგანი</option>
                {teacherSubjects.map((subj: any) => {
                  const subjObj = allSubjects.find(
                    (s: any) => s._id === subj.subject_id,
                  );
                  return subjObj ? (
                    <option key={subj.subject_id} value={subj.subject_id}>
                      {subjObj.name}
                    </option>
                  ) : null;
                })}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">თარიღი:</label>
              {allowedDatesList.length === 0 ? (
                <div style={{ color: "#ff5252", fontSize: '12px', marginTop: '10px' }}>
                  ქულების ჩაწერა შეუძლებელია
                </div>
              ) : (
                <select
                  value={`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
                  onChange={(e) => {
                    const selected = allowedDatesList.find((item) => item.dateStr === e.target.value);
                    if (selected) {
                      setYear(selected.year);
                      setMonth(selected.month);
                      setDay(selected.day);
                    }
                  }}
                  className="admin-select"
                >
                  {allowedDatesList.map((item) => (
                    <option key={item.dateStr} value={item.dateStr}>
                      {item.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-label">ტიპი:</label>
              <select
                value={pointType || 2}
                onChange={(e) => setPointType(Number(e.target.value))}
                className="admin-select"
              >
                <option value={2}>აღრიცხვა</option>
                <option value={1}>საშინაო</option>
                <option value={3}>შემაჯამებელი</option>
              </select>
            </div>

            {(() => {
              const selectedDateObj = new Date(year, month, day);
              const jsDay = selectedDateObj.getDay();
              const scheduleDayIdx = jsDay >= 1 && jsDay <= 5 ? jsDay - 1 : -1;
              const classObj = teachesClasses.find((cls: any) => cls._id === id);
              const daySchedule = scheduleDayIdx >= 0 && classObj?.calendar ? classObj.calendar[scheduleDayIdx] : [];
              const scheduledLessonsCount = selectedSubject && Array.isArray(daySchedule)
                ? daySchedule.filter((slot: any) => slot && String(slot.subject_id) === String(selectedSubject)).length
                : 1;
              const maxLessons = Math.max(1, scheduledLessonsCount);

              if (maxLessons <= 1) return null;
              return (
                <div className="admin-form-group">
                  <label className="admin-label">გაკვეთილის საათი:</label>
                  <select
                    value={lessonNum}
                    onChange={(e) => setLessonNum(Number(e.target.value))}
                    className="admin-select"
                  >
                    {Array.from({ length: maxLessons }, (_, idx) => idx + 1).map((num) => (
                      <option key={num} value={num}>
                        {num === 1 ? "1-ლი გაკვეთილი (I საათი)" : num === 2 ? "მე-2 გაკვეთილი (II საათი)" : `${num}-ე გაკვეთილი`}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })()}
          </div>
        </div>

        {id && classExams && classExams.length > 0 && (
          <div style={{
            margin: '0 0 24px 0',
            padding: '16px 20px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(245, 158, 11, 0.12))',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📌 ამ კლასს ჩანიშნული აქვს გამოცდა:</span>
            </div>
            {classExams.map((ex: any) => (
              <div key={ex._id} style={{ fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '14px', opacity: 0.95, fontWeight: 600 }}>
                <span><strong>თარიღი:</strong> {ex.date} ({ex.time || '10:00'})</span>
                <span><strong>დასახელება:</strong> {ex.title}</span>
                {ex.subjectName && <span><strong>საგანი:</strong> {ex.subjectName}</span>}
                {ex.location && <span><strong>ოთახი:</strong> {ex.location}</span>}
              </div>
            ))}
          </div>
        )}

        {selectedSubject &&
          allowedDatesList.length > 0 &&
          gradeEntryStartDate &&
          pointType > 0 ? (
          <div className="admin-list-container" style={{ maxWidth: '100%' }}>
            <div className="admin-view-header" style={{ padding: '20px 24px', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 0 }}>
              <h3 className="admin-view-title" style={{ fontSize: '20px' }}>მოსწავლეთა სია</h3>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: '14px', opacity: 0.8 }}>
                <span><strong>საგანი:</strong> {allSubjects.find((s) => s._id === selectedSubject)?.name}</span>
                <span><strong>თარიღი:</strong> {String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}</span>
              </div>
            </div>

            {(() => {
              const classObj = teachesClasses.find((cls: any) => cls._id === id);
              const classGradeNum = parseInt(classObj?.classname || "", 10);
              const isFirstSemester = month >= 8 && month <= 11; // Sept (8) to Dec (11)
              const isCommentOnly = (!isNaN(classGradeNum) && classGradeNum >= 1 && classGradeNum <= 4) ||
                                   (!isNaN(classGradeNum) && classGradeNum === 5 && isFirstSemester);
              const selectedSubjObj = allSubjects.find((s: any) => s._id === selectedSubject);
              const isProjectSubject = isProjectToggle || 
                                       selectedSubjObj?.is_project || 
                                       selectedSubjObj?.name?.includes("პროექტ") || 
                                       selectedSubjObj?.name?.includes("ჩათვლ");

              return (
                <>
                  <div className="grade-entry-header">
                    <div>მოსწავლე</div>
                    <div style={{ textAlign: 'center' }}>დასწრება</div>
                    <div style={{ textAlign: 'center' }}>
                      {isCommentOnly ? "განმავითარებელი კომენტარი" : isProjectSubject ? "ჩათვლა (ჩთ / არ ჩთ)" : "ქულა (0-10)"}
                    </div>
                  </div>

                  <div className="grade-entry-list">
                    {memoizedStudents.map((student) => {
                      const checked = grades[student._id]?.attendance ?? true;
                      return (
                        <div key={student._id} className="grade-entry-row">
                          <div className="grade-entry-student">
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}99)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '14px',
                              color: 'white',
                              flexShrink: 0,
                            }}>
                              {student.surname?.[0] ?? ''}{student.name?.[0] ?? ''}
                            </div>
                            <div className="grade-entry-name">
                              {student.surname} {student.name}
                            </div>
                          </div>

                          <div className="grade-entry-actions">
                            <div className="grade-entry-attendance-wrap">
                              <span className="mobile-attendance-label">დასწრება</span>
                              <label style={switchStyle}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => handleAttendanceChange(student._id, e.target.checked)}
                                  style={{ display: 'none' }}
                                />
                                <span style={checked ? sliderCheckedStyle : sliderStyle}>
                                  <span style={checked ? circleCheckedStyle : circleStyle}></span>
                                </span>
                              </label>
                            </div>

                            <div className="grade-entry-point-wrap">
                              {isCommentOnly ? (
                                <input
                                  type="text"
                                  value={grades[student._id]?.comment ?? (grades[student._id]?.point !== "განმავითარებელი" ? grades[student._id]?.point ?? "" : "")}
                                  onChange={(e) => handleCommentChange(student._id, e.target.value)}
                                  placeholder="დაწერეთ განმავითარებელი კომენტარი..."
                                  disabled={!checked}
                                  className="admin-input"
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    opacity: checked ? 1 : 0.5,
                                    width: '100%',
                                    maxWidth: '280px',
                                    background: '#ffffff',
                                    border: '1.5px solid #cbd5e1',
                                    color: '#0f172a',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                                  }}
                                />
                              ) : isProjectSubject ? (
                                <select
                                  value={grades[student._id]?.point ?? ''}
                                  onChange={(e) => handlePointChange(student._id, e.target.value)}
                                  disabled={!checked}
                                  className="admin-select"
                                  style={{ padding: '8px 12px', fontSize: '14px', opacity: checked ? 1 : 0.5, width: '100%' }}
                                >
                                  <option value="">აირჩიეთ...</option>
                                  <option value="ჩთ">ჩთ (ჩათვლილი)</option>
                                  <option value="არ ჩთ">არ ჩთ (არაჩათვლილი)</option>
                                </select>
                              ) : (
                                <select
                                  value={grades[student._id]?.point ?? ''}
                                  onChange={(e) => handlePointChange(student._id, e.target.value)}
                                  disabled={!checked}
                                  className="admin-select"
                                  style={{ padding: '8px 12px', fontSize: '14px', opacity: checked ? 1 : 0.5, width: '100%' }}
                                >
                                  <option value="">აირჩიეთ...</option>
                                  {Array.from({ length: 11 }, (_, n) => n).map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleSubmit}
                className="admin-submit-btn"
                style={{ maxWidth: '300px' }}
              >
                მონაცემების შენახვა
              </button>
            </div>
          </div>
        ) : (
          <div className="admin-card" style={{ padding: '60px' }}>
            <div className="admin-card-icon-wrapper" style={{ marginBottom: '20px' }}>
              <MdOutlineWarningAmber size={48} />
            </div>
            <div className="admin-card-label" style={{ marginBottom: '15px' }}>
              გთხოვთ აირჩიოთ ყველა საჭირო პარამეტრი
            </div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: '1.6' }}>
              {!selectedSubject && "• აირჩიეთ საგანი"}<br />
              {selectedSubject && !allowedDatesList.length && "• აირჩიეთ სწორი თარიღი"}<br />
              {selectedSubject && allowedDatesList.length > 0 && pointType === 0 && "• აირჩიეთ ქულის ტიპი"}
            </div>
          </div>
        )}

        <InfoModal
          isOpen={infoModalOpen}
          message={infoModalMessage}
          onClose={() => setInfoModalOpen(false)}
        />
      </div>
    );
  };

  const getAcademicYearFromDate = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const startYear = month >= 9 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  };

  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 9 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  };

  // Grade history page
  const GradeHistoryPage: React.FC<{ allSubjects: any[] }> = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const classId = id!;
    const classObj = teachesClasses.find((cls: any) => cls._id === classId) || tutorClasses.find((cls: any) => cls._id === classId);
    const className = classObj ? classObj.classname : "";
    const { selectedColor } = useColor();

    const loginData = JSON.parse(localStorage.getItem("login") || "{}");
    const user_ID = loginData.user_ID;
    const teacher = allTeachers.find((t: any) => t.user_ID === user_ID);

    // Find ALL subjects this teacher teaches in this class
    const teacherSubjectsInClass = React.useMemo(() => {
      if (!classObj || !Array.isArray(classObj.subjects) || !teacher) return [];
      const list: { id: string; name: string }[] = [];
      classObj.subjects.forEach((s: any) => {
        if (
          s.teacher_id === teacher._id &&
          (s.hours_per_week === undefined || s.hours_per_week > 0)
        ) {
          const subjObj = allSubjects.find((subj: any) => subj._id === s.subject_id);
          if (subjObj && !list.some((item) => item.id === subjObj._id)) {
            list.push({ id: subjObj._id, name: subjObj.name });
          }
        }
      });
      return list;
    }, [classObj, teacher, allSubjects]);

    const urlSubjectId = searchParams.get("subject_id");

    const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(() => {
      if (urlSubjectId) return urlSubjectId;
      return teacherSubjectsInClass.length > 0 ? teacherSubjectsInClass[0].id : undefined;
    });

    useEffect(() => {
      if (!selectedSubjectId && teacherSubjectsInClass.length > 0) {
        if (urlSubjectId && teacherSubjectsInClass.some(s => s.id === urlSubjectId)) {
          setSelectedSubjectId(urlSubjectId);
        } else {
          setSelectedSubjectId(teacherSubjectsInClass[0].id);
        }
      }
    }, [teacherSubjectsInClass, urlSubjectId, selectedSubjectId]);

    const selectedSubjObj = teacherSubjectsInClass.find(s => s.id === selectedSubjectId) || allSubjects.find(s => s._id === selectedSubjectId);
    const teacherSubjectName = selectedSubjObj ? selectedSubjObj.name : (searchParams.get("subject_name") || undefined);

    return renderTeacherLayout(
        <DetailedGradeHistory
          classId={classId}
          className={className}
          subjectId={selectedSubjectId}
          subjectName={teacherSubjectName}
          selectedColor={selectedColor}
          availableTeacherSubjects={teacherSubjectsInClass}
          onSubjectChange={(subjId) => setSelectedSubjectId(subjId)}
          onBackClick={() => navigate(-1)}
          isAdmin={false}
        />
    );
  };

  // Statistics page
  const StatisticsPage: React.FC = () => {
    const { id } = useParams();
    const classId = id!;
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedSemester, setSelectedSemester] = useState<string>("წლიური");
    const [selectedMark, setSelectedMark] = useState<number>(10);
    const [selectedAttendance, setSelectedAttendance] = useState<number>(100);
    const [students, setStudents] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Get teacher's classes and subjects
    const classObj = teachesClasses.find((cls: any) => cls._id === classId);
    let teacherSubjects: any[] = [];
    if (classObj && Array.isArray(classObj.subjects)) {
      const loginData = JSON.parse(localStorage.getItem("login") || "{}");
      const user_ID = loginData.user_ID;
      const teacher = allTeachers.find((t: any) => t.user_ID === user_ID);
      if (teacher) {
        teacherSubjects = classObj.subjects.filter(
          (subj: any) => 
            subj.teacher_id === teacher._id && 
            (subj.hours_per_week === undefined || subj.hours_per_week > 0),
        );
      }
    }

    const handleViewStatistics = async () => {
      if (!selectedSubject) {
        alert("გთხოვთ აირჩიოთ საგანი");
        return;
      }

      setLoading(true);
      try {
        // Fetch only students of this class (by grade + parallel from classname)
        const match = classObj?.classname.match(/^([0-9]+)([ა-ჰ])$/);
        const studentsUrl = match
          ? `/api/student/grade/${match[1]}?parallel=${encodeURIComponent(match[2])}`
          : "/api/student/all";

        const [studentsRes, allStudentsRes, gradesRes] = await Promise.all([
          fetch(studentsUrl),
          fetch("/api/student/all"),
          fetch(`/api/grades?class_id=${classId}&subject_id=${selectedSubject}`)
        ]);

        const fetched = await studentsRes.json();
        const allStudentsData = await allStudentsRes.json();
        const gradesData = await gradesRes.json();

        let classStudents = match
          ? (Array.isArray(fetched) ? fetched : [])
          : (Array.isArray(fetched) ? fetched.filter((s: any) => s.classInfo && s.classInfo._id === classId) : []);

        if (Array.isArray(gradesData) && Array.isArray(allStudentsData)) {
          const existingStudentIds = new Set(classStudents.map((s: any) => s._id ? s._id.toString() : ''));
          const allStudentsMap = new Map(allStudentsData.map((s: any) => [s._id ? s._id.toString() : '', s]));

          gradesData.forEach((g: any) => {
            if (g.student_id) {
              const sidStr = g.student_id.toString();
              if (!existingStudentIds.has(sidStr) && allStudentsMap.has(sidStr)) {
                classStudents.push({
                  ...allStudentsMap.get(sidStr),
                  isTransferred: true
                });
                existingStudentIds.add(sidStr);
              }
            }
          });
        }

        classStudents.sort((a: any, b: any) => `${a.surname || ''} ${a.name || ''}`.localeCompare(`${b.surname || ''} ${b.name || ''}`, 'ka'));
        setStudents(classStudents);
        setGrades(Array.isArray(gradesData) ? gradesData : []);

        setShowResults(true);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        alert("სტატისტიკის ჩვენება ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    };

    const calculateStudentStats = (studentId: string) => {
      const studentGrades = grades.filter((g) => g.student_id === studentId);

      // Filter grades by semester
      const getSemesterGrades = (semester: string) => {
        return studentGrades.filter((g) => {
          const gradeDate = new Date(g.date);
          const month = gradeDate.getMonth() + 1; // getMonth() returns 0-11

          if (semester === "პირველი") {
            // September (9) to December (12)
            return month >= 9 && month <= 12;
          } else if (semester === "მეორე") {
            // January (1) to June (6)
            return month >= 1 && month <= 6;
          }
          return true; // წლიური - all grades
        });
      };

      let averageScore = 0;
      let attendancePercentage = 0;
      let absenceCount = 0;

      if (selectedSemester === "წლიური") {
        // Calculate annual average: (first semester + second semester) / 2
        const firstSemesterGrades = getSemesterGrades("პირველი");
        const secondSemesterGrades = getSemesterGrades("მეორე");

        const isNumericGrade = (g: any) => {
          const pt = typeof g.point === "number" ? g.point : (typeof g.point === "string" && !isNaN(parseInt(g.point, 10)) ? parseInt(g.point, 10) : -1);
          return pt >= 0 && pt <= 10 && !g.is_formative && g.point !== -3;
        };
        const getPtVal = (g: any) => (typeof g.point === "number" ? g.point : parseInt(g.point, 10));

        const firstSemesterNumeric = firstSemesterGrades.filter(isNumericGrade);
        const secondSemesterNumeric = secondSemesterGrades.filter(isNumericGrade);

        const firstSemesterAvg =
          firstSemesterNumeric.length > 0
            ? firstSemesterNumeric.reduce((sum, g) => sum + getPtVal(g), 0) /
            firstSemesterNumeric.length
            : 0;
        const secondSemesterAvg =
          secondSemesterNumeric.length > 0
            ? secondSemesterNumeric.reduce((sum, g) => sum + getPtVal(g), 0) /
            secondSemesterNumeric.length
            : 0;

        averageScore = (firstSemesterAvg + secondSemesterAvg) / 2;

        // Calculate attendance for all grades
        const totalGrades = studentGrades.length;
        const attendedGrades = studentGrades.filter(
          (g) => g.checked === true,
        ).length;
        attendancePercentage =
          totalGrades > 0 ? (attendedGrades / totalGrades) * 100 : 0;
        absenceCount = studentGrades.filter(
          (g) => g.point === -2 || g.checked === false
        ).length;
      } else {
        // Calculate for specific semester
        const semesterGrades = getSemesterGrades(selectedSemester);
        const isNumericGrade = (g: any) => {
          const pt = typeof g.point === "number" ? g.point : (typeof g.point === "string" && !isNaN(parseInt(g.point, 10)) ? parseInt(g.point, 10) : -1);
          return pt >= 0 && pt <= 10 && !g.is_formative && g.point !== -3;
        };
        const getPtVal = (g: any) => (typeof g.point === "number" ? g.point : parseInt(g.point, 10));

        const numericGrades = semesterGrades.filter(isNumericGrade);

        averageScore =
          numericGrades.length > 0
            ? numericGrades.reduce((sum, g) => sum + getPtVal(g), 0) /
            numericGrades.length
            : 0;

        const totalGrades = semesterGrades.length;
        const attendedGrades = semesterGrades.filter(
          (g) => g.checked === true,
        ).length;
        attendancePercentage =
          totalGrades > 0 ? (attendedGrades / totalGrades) * 100 : 0;
        absenceCount = semesterGrades.filter(
          (g) => g.point === -2 || g.checked === false
        ).length;
      }

      return {
        averageScore: parseFloat(averageScore.toFixed(1)),
        attendancePercentage: parseFloat(attendancePercentage.toFixed(1)),
        absenceCount,
      };
    };

    const filteredStudents = students;

    return renderTeacherLayout(
        <div className="admin-view-container" style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigate(`/teacher/teach/${id}`)}
            className="admin-back-btn"
            style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeftIcon size={18} /> უკან დაბრუნება
          </button>

        <div className="admin-form-container" style={{ marginTop: '20px', marginBottom: '40px' }}>
          <h2 className="admin-form-title" style={{ color: 'blue' }}>სტატისტიკა</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div className="admin-form-group">
              <label className="admin-label">კლასი:</label>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: 'white', fontWeight: 700 }}>
                {classObj?.classname || ""}
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">აირჩიეთ საგანი:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="admin-select"
              >
                <option value="">აირჩიეთ საგანი</option>
                {teacherSubjects.map((subj: any) => {
                  const subjObj = allSubjects.find(
                    (s: any) => s._id === subj.subject_id,
                  );
                  return subjObj ? (
                    <option key={subj.subject_id} value={subj.subject_id}>
                      {subjObj.name}
                    </option>
                  ) : null;
                })}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">სემესტრი:</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="admin-select"
              >
                <option value="წლიური">წლიური</option>
                <option value="პირველი">პირველი</option>
                <option value="მეორე">მეორე</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button
              onClick={handleViewStatistics}
              className="admin-submit-btn"
              disabled={loading || !selectedSubject}
              style={{ maxWidth: '300px' }}
            >
              {loading ? "იტვირთება..." : "სტატიტიკის ნახვა"}
            </button>
          </div>
        </div>

        {showResults && (
          <div className="admin-list-container">
            <div className="admin-view-header" style={{ padding: '24px' }}>
              <h3 className="admin-view-title" style={{ fontSize: '20px' }}>შედეგები</h3>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                    <th>მოსწავლე</th>
                    <th style={{ textAlign: "center" }}>საშუალო ქულა</th>
                    <th style={{ textAlign: "center" }}>გაცდენების რაოდენობა</th>
                    <th style={{ textAlign: "center" }}>სწრებადობა</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => {
                    const stats = calculateStudentStats(student._id);
                    return (
                      <tr key={student._id}>
                        <td style={{ textAlign: 'center', opacity: 0.5 }}>{index + 1}</td>
                        <td style={{ fontWeight: 600 }}>{student.surname} {student.name}</td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`status-badge ${stats.averageScore >= 9 ? 'high' : stats.averageScore >= 7 ? 'medium' : 'low'}`}>
                            {stats.averageScore.toFixed(1)}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`status-badge ${stats.absenceCount === 0 ? 'high' : stats.absenceCount <= 3 ? 'medium' : 'low'}`}>
                            {stats.absenceCount}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`status-badge ${stats.attendancePercentage >= 90 ? 'high' : stats.attendancePercentage >= 70 ? 'medium' : 'low'}`}>
                            {stats.attendancePercentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="admin-card" style={{ padding: '40px' }}>
                <div className="admin-card-label" style={{ opacity: 0.5 }}>
                  არცერთი მოსწავლე არ აკმაყოფილებს არჩეულ კრიტერიუმებს
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const { data: globalCalendarEvents } = useQuery<any[]>({
    queryKey: ['calendar-events-teacher-main'],
    queryFn: async () => {
      const res = await fetch('/api/calendar-events');
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10000
  });

  const getTodayInfo = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const dayNames = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
    const jsDay = now.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    const todayName = dayNames[jsDay];
    const todayDateFormatted = `${todayName}, ${dd}.${mm}.${yyyy}`;

    const eventForToday = (globalCalendarEvents || []).find((e: any) => e.date === todayStr);
    let effectiveDayIdx: number | null = null;
    let isTodayHoliday = false;

    if (eventForToday) {
      if (eventForToday.type === 'holiday') {
        isTodayHoliday = true;
      } else if (eventForToday.type === 'makeup' && eventForToday.replacementDayOfWeek !== undefined) {
        effectiveDayIdx = eventForToday.replacementDayOfWeek;
      }
    } else if (jsDay >= 1 && jsDay <= 5) {
      effectiveDayIdx = jsDay - 1; // 0=Mon..4=Fri
    }

    const isWeekend = (jsDay === 0 || jsDay === 6) && !eventForToday;

    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const todayLessons: any[] = [];

    if (effectiveDayIdx !== null && teacherSchedule && teacherSchedule[effectiveDayIdx]) {
      const row = teacherSchedule[effectiveDayIdx];
      row.forEach((slot: any, lessonSlotIdx: number) => {
        if (slot && (slot.className || slot.class_id)) {
          let classId = slot.class_id;
          if (!classId) {
            const foundCls = teachesClasses.find((c: any) => c.classname === slot.className);
            if (foundCls) classId = foundCls._id;
          }
          todayLessons.push({
            lessonNumber: lessonSlotIdx + 1,
            lessonRoman: romanNumerals[lessonSlotIdx] || `${lessonSlotIdx + 1}`,
            className: slot.className,
            subjectName: slot.subjectName,
            subjectId: slot.subject_id,
            classId: classId
          });
        }
      });
    }

    return {
      todayDateFormatted,
      isTodayHoliday,
      isWeekend,
      todayLessons,
      eventForToday
    };
  };

  const { todayDateFormatted, isTodayHoliday, isWeekend, todayLessons, eventForToday } = getTodayInfo();

  const tabList = [
    { key: "teaching", label: "სასწავლო კლასები", badge: false },
    { key: "homeroom", label: "სადამრიგებლო კლასები", badge: false },
    { key: "calendar", label: "ჩემი განრიგი", badge: false },
    { key: "notices", label: "📢 განცხადებები", badge: hasUnreadTeacherNotices },
    { key: "messages", label: "💬 ჩატი", badge: hasUnreadTeacherMessages },
  ];

  // Main page content
  const mainContent = renderTeacherLayout(
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Tab bar */}
        <div className="admin-tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {tabList.map((tab) => (
            <button
              key={tab.key}
              className={`admin-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key as any)}
              style={{ position: 'relative' }}
            >
              {tab.label}
              {tab.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px #ef4444'
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="admin-view-container" style={{ width: '100%', padding: 0 }}>
          {activeTab !== "teaching" && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
              <button
                type="button"
                className="admin-back-btn"
                onClick={() => setActiveTab("teaching")}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <ArrowLeftIcon size={18} /> მთავარ გვერდზე დაბრუნება
              </button>
            </div>
          )}
          {activeTab === "calendar" &&
            (scheduleLoading ? (
              <div className="admin-form-container" style={{ textAlign: 'center' }}>
                <div className="admin-form-title">განრიგი იტვირთება...</div>
              </div>
            ) : (
              <TeacherCalendarTable schedule={teacherSchedule} />
            ))}
          {activeTab === "homeroom" && (
            <div className="admin-view-container">
              <h2 className="admin-view-title" style={{ marginBottom: '30px', textAlign: 'center' }}>სადამრიგებლო კლასები</h2>
              <div className="admin-grid">
                {tutorClasses.length === 0 && (
                  <div className="admin-card">
                    <div className="admin-card-label">არ გაქვთ სადამრიგებლო კლასი</div>
                  </div>
                )}
                {tutorClasses.map((cls, idx) => (
                  <div
                    key={cls._id}
                    className="admin-card"
                    onClick={() => navigate(`/teacher/class/${cls._id}`)}
                  >
                    <div className="admin-card-icon-wrapper">
                      <GiTeacherIcon size={32} />
                    </div>
                    <div className="admin-card-label">
                      {cls.classname}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "teaching" && (
            <div className="admin-view-container" style={{ width: '100%', padding: '20px 0' }}>
              
              {/* Today's Lessons Section */}
              <div style={{ marginBottom: '40px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: selectedColor, color: '#ffffff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900 }}>
                      📅
                    </div>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                        დღევანდელი გაკვეთილები
                      </h2>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0', fontWeight: 600 }}>
                        ჩასმული საათები რიგითობით (ცხრილის მიხედვით)
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', background: `${selectedColor}15`, color: selectedColor, padding: '6px 14px', borderRadius: '20px', fontWeight: 800, border: `1px solid ${selectedColor}30` }}>
                    {todayDateFormatted}
                  </span>
                </div>

                {isTodayHoliday ? (
                  <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '16px', padding: '20px', textAlign: 'center', color: '#991b1b', fontWeight: 800, fontSize: '15px' }}>
                    🔴 დღეს დასვენების დღეა {eventForToday?.title ? `(${eventForToday.title})` : ''} — გაკვეთილები არ ტარდება
                  </div>
                ) : todayLessons.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {todayLessons.map((item, idx) => (
                      <div
                        key={idx}
                        className="admin-card"
                        onClick={() => {
                          if (item.classId) {
                            const query = new URLSearchParams();
                            if (item.subjectId) query.set('subject_id', item.subjectId);
                            if (item.subjectName) query.set('subject_name', item.subjectName);
                            query.set('lesson_num', String(item.lessonNumber));
                            navigate(`/teacher/teach/${item.classId}/grade?${query.toString()}`);
                          }
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          border: `1.5px solid ${selectedColor}35`,
                          borderRadius: '20px',
                          padding: '20px 16px',
                          cursor: item.classId ? 'pointer' : 'default',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '10px',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s ease-in-out',
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          background: selectedColor,
                          color: '#ffffff',
                          padding: '4px 14px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 900,
                          letterSpacing: '0.5px',
                          boxShadow: `0 4px 10px ${selectedColor}44`
                        }}>
                          {item.lessonRoman} გაკვეთილი
                        </div>

                        <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>
                          {item.className}
                        </div>

                        {item.subjectName && (
                          <div style={{ fontSize: '13px', fontWeight: 700, color: selectedColor, background: `${selectedColor}12`, padding: '4px 12px', borderRadius: '8px' }}>
                            {item.subjectName}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '14px' }}>
                    {isWeekend ? '🏖️ დღეს უქმეებია — გაკვეთილები არ გაქვთ' : '☕ დღეს არ გაქვთ ჩასმული გაკვეთილები'}
                  </div>
                )}
              </div>

              {/* All Teaching Classes Section */}
              <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📚</span> ყველა კლასი, სადაც ასწავლით
                </h2>
              </div>
              <div className="admin-grid">
                {teachesClasses.length === 0 && (
                  <div className="admin-card">
                    <div className="admin-card-label">არ ასწავლით არცერთ კლასში</div>
                  </div>
                )}
                {teachesClasses.map((cls, idx) => (
                  <div
                    key={cls._id}
                    className="admin-card"
                    onClick={() => navigate(`/teacher/teach/${cls._id}`)}
                  >
                    <div className="admin-card-icon-wrapper">
                      <FaChalkboardTeacherIcon size={32} />
                    </div>
                    <div className="admin-card-label">
                      {cls.classname}
                      {cls.teacherSubjects && cls.teacherSubjects.length > 0 && (
                        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px', textTransform: 'none' }}>
                          {cls.teacherSubjects.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
          {activeTab === "notices" && (
            <div style={{ width: '100%', marginTop: '20px' }}>
              <NoticeBoard currentUser={{ id: teacherIdForChat, name: teacherNameForChat, role: 'teacher' }} />
            </div>
          )}
          {activeTab === "messages" && (
            <div style={{ width: '100%', marginTop: '20px' }}>
              <ChatModule currentUser={{ id: teacherIdForChat, name: teacherNameForChat, role: 'teacher' }} />
            </div>
          )}
        </div>
      </div>
  );

  // Tutor class details page
  const TutorClassDetailsPage: React.FC = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [tutorClass, setTutorClass] = useState<any | null>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [activeSubject, setActiveSubject] = useState<{ id: string; name: string } | 'all' | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        // Fetch class by ID
        const classRes = await fetch("/api/classes");
        if (!classRes.ok) return;
        const allClasses = await classRes.json();
        const foundClass = allClasses.find((cls: any) => cls._id === id);
        setTutorClass(foundClass);
        // Fetch all subjects
        const subjRes = await fetch("/api/subjects");
        if (subjRes.ok) setSubjects(await subjRes.json());
        // Fetch all teachers
        const tRes = await fetch("/api/teacher/all");
        if (tRes.ok) setTeachers(await tRes.json());
        setLoading(false);
      };
      fetchData();
    }, [id]);

    if (loading)
      return (
        <div style={{ color: "#0f172a", fontWeight: 700, textAlign: "center", marginTop: "40px" }}>
          იტვირთება...
        </div>
      );
    if (!tutorClass)
      return (
        <div style={{ color: "#0f172a", fontWeight: 700, textAlign: "center", marginTop: "40px" }}>
          კლასი ვერ მოიძებნა
        </div>
      );

    if (activeSubject !== null) {
      return renderTeacherLayout(
          <DetailedGradeHistory
            classId={tutorClass._id}
            className={tutorClass.classname}
            subjectId={activeSubject === 'all' ? undefined : activeSubject.id}
            subjectName={activeSubject === 'all' ? undefined : activeSubject.name}
            selectedColor={selectedColor}
            onBackClick={() => setActiveSubject(null)}
            isAdmin={false}
          />
      );
    }

    return renderTeacherLayout(
        <div className="admin-view-container" style={{ width: '100%', maxWidth: '950px', margin: '0 auto' }}>
          <button
            onClick={() => navigate("/teacher")}
            className="admin-back-btn"
            style={{ marginBottom: '24px' }}
          >
            <ArrowLeftIcon size={20} /> უკან დაბრუნება
          </button>
          <TutorClassDetails
            allSubjects={subjects}
            allTeachers={teachers}
            tutorClass={tutorClass}
            selectedColor={selectedColor}
            onSelectSubject={(subjectId, subjectName) => setActiveSubject({ id: subjectId, name: subjectName })}
            onViewAllGrades={() => setActiveSubject('all')}
          />
        </div>
    );
  };

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <Routes>
            <Route path="/" element={mainContent} />
            <Route path="class/:id" element={<TutorClassDetailsPage />} />
            <Route path="teach/:id" element={<TeachClassOptionsPage />} />
            <Route path="teach/:id/grade" element={<GradeEntryPage />} />
            <Route
              path="teach/:id/history"
              element={<GradeHistoryPage allSubjects={allSubjects} />}
            />
            <Route path="teach/:id/statistics" element={<StatisticsPage />} />
            <Route path="teach/:id/homework" element={<TeacherHomeworkPage />} />
          </Routes>
        }
      />
    </Routes>
  );
};

export default Teacher;
