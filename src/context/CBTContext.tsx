import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SchoolProfile,
  Exam,
  Question,
  Student,
  StudentExamSession,
  StudentAnswer,
  UserRole,
} from '../types/cbt';
import {
  initialSchoolProfile,
  initialExams,
  initialQuestions,
  initialStudents,
  initialStudentSessions,
} from '../data/mockData';

interface CBTContextType {
  // Profiles & General State
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  broadcastMessage: string | null;
  setBroadcastMessage: (msg: string | null) => void;

  // Admin Authentication
  isAdminLoggedIn: boolean;
  adminUser: { name: string; username: string; role: string; nip?: string } | null;
  loginAdmin: (username: string, password: string, proctorPinInput: string) => { success: boolean; message: string };
  logoutAdmin: () => void;
  updateProctorPin: (newPin: string) => void;

  // Exams
  exams: Exam[];
  activeExamId: string;
  setActiveExamId: (id: string) => void;
  currentExam: Exam | undefined;
  createExam: (exam: Exam) => void;
  updateExam: (examId: string, updates: Partial<Exam>) => void;
  deleteExam: (examId: string) => void;
  generateExamToken: (examId: string) => string;

  // Questions
  questions: Question[];
  getExamQuestions: (examId: string) => Question[];
  createQuestion: (q: Question) => void;
  updateQuestion: (qId: string, updates: Partial<Question>) => void;
  deleteQuestion: (qId: string) => void;
  importQuestions: (newQuestions: Question[]) => void;

  // Students
  students: Student[];
  createStudent: (s: Student) => void;
  updateStudent: (sId: string, updates: Partial<Student>) => void;
  deleteStudent: (sId: string) => void;
  importStudents: (newStudents: Student[]) => void;

  // Student Sessions & Realtime
  studentSessions: Record<string, StudentExamSession>;
  currentStudent: Student | null;
  currentStudentSession: StudentExamSession | null;
  loginStudent: (identifier: string, token: string) => { success: boolean; message: string; student?: Student };
  logoutStudent: () => void;
  quickSwitchStudent: (studentId: string) => void;
  saveStudentAnswer: (questionId: string, answer: Partial<StudentAnswer>) => void;
  toggleStudentDoubtful: (questionId: string) => void;
  recordViolation: (type: 'tab_switch' | 'fullscreen_exit' | 'devtools' | 'copy_paste', reason: string) => void;
  finishAndSubmitExam: (studentId?: string) => void;

  // Proctor Interventions
  proctorResetSession: (studentId: string) => void;
  proctorExtendDuration: (studentId: string, extraMinutes: number) => void;
  proctorUnlockStudent: (studentId: string) => void;
  proctorForceSubmit: (studentId: string) => void;
  resetAllToFactoryDefaults: () => void;
}

const CBTContext = createContext<CBTContextType | undefined>(undefined);

const STORAGE_KEY = 'cbt_sekolah_pro_state_v1';

export const CBTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or defaults
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.proctorPin) parsed.proctorPin = '982461';
        return parsed;
      }
      return initialSchoolProfile;
    } catch {
      return initialSchoolProfile;
    }
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_exams`);
      return saved ? JSON.parse(saved) : initialExams;
    } catch {
      return initialExams;
    }
  });

  const [activeExamId, setActiveExamId] = useState<string>(() => {
    return initialExams[0]?.id || '';
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_questions`);
      return saved ? JSON.parse(saved) : initialQuestions;
    } catch {
      return initialQuestions;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [studentSessions, setStudentSessions] = useState<Record<string, StudentExamSession>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
      return saved ? JSON.parse(saved) : initialStudentSessions;
    } catch {
      return initialStudentSessions;
    }
  });

  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${STORAGE_KEY}_admin_logged`) === 'true';
    } catch {
      return false;
    }
  });
  const [adminUser, setAdminUser] = useState<{ name: string; username: string; role: string; nip?: string } | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_admin_user`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  const loginAdmin = (
    usernameInput: string,
    passwordInput: string,
    proctorPinInput: string
  ): { success: boolean; message: string } => {
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();
    const pin = (proctorPinInput || '').trim();

    const expectedPin = schoolProfile.proctorPin || '982461';

    // 1. Strict Proctor PIN Verification (Mencegah siswa masuk area admin)
    if (!pin) {
      return {
        success: false,
        message: 'PIN Keamanan Proktor wajib diisi! Hanya proktor/pengawas yang memiliki PIN ini.',
      };
    }

    if (pin !== expectedPin) {
      return {
        success: false,
        message: 'PIN Keamanan Proktor Salah! Akses ditolak untuk mencegah siswa masuk.',
      };
    }

    // 2. Valid admin/proctor credentials
    // Accepted: admin/admin123, proktor/proktor123, or proctor's NIP
    if ((u === 'admin' && p === 'admin123') || (u === 'proktor' && p === 'proktor123') || (p === 'admin123' && u.length > 2)) {
      const user = {
        name: u === 'admin' ? 'Administrator Utama' : schoolProfile.proctorName,
        username: u,
        role: u === 'admin' ? 'Super Administrator CBT' : 'Proktor Ruang / Teknisi',
        nip: schoolProfile.proctorNip,
      };
      setIsAdminLoggedIn(true);
      setAdminUser(user);
      setUserRole('proctor');
      localStorage.setItem(`${STORAGE_KEY}_admin_logged`, 'true');
      localStorage.setItem(`${STORAGE_KEY}_admin_user`, JSON.stringify(user));
      return { success: true, message: 'Otentikasi PIN & Akun Proktor Berhasil!' };
    }

    return {
      success: false,
      message: 'Username atau Kata Sandi Proktor salah! Periksa kembali akun Anda.',
    };
  };

  const updateProctorPin = (newPin: string) => {
    const clean = newPin.trim();
    if (clean.length >= 4) {
      setSchoolProfile((prev) => ({ ...prev, proctorPin: clean }));
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    localStorage.removeItem(`${STORAGE_KEY}_admin_logged`);
    localStorage.removeItem(`${STORAGE_KEY}_admin_user`);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(schoolProfile));
  }, [schoolProfile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_exams`, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_questions`, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(studentSessions));
  }, [studentSessions]);

  // Current exam helper
  const currentExam = exams.find((e) => e.id === activeExamId) || exams[0];

  const currentStudent = students.find((s) => s.id === currentStudentId) || null;
  const currentStudentSession = currentStudentId ? studentSessions[currentStudentId] || null : null;

  // Background heartbeat update for in_progress sessions (simulates active presence)
  useEffect(() => {
    const interval = setInterval(() => {
      setStudentSessions((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.keys(next).forEach((sId) => {
          const sess = next[sId];
          if (sess.status === 'in_progress' && sess.remainingSeconds > 0) {
            changed = true;
            next[sId] = {
              ...sess,
              remainingSeconds: Math.max(0, sess.remainingSeconds - 1),
              lastHeartbeat: Date.now(),
            };
          }
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateSchoolProfile = (profile: Partial<SchoolProfile>) => {
    setSchoolProfile((prev) => ({ ...prev, ...profile }));
  };

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  const createExam = (exam: Exam) => {
    setExams((prev) => [exam, ...prev]);
  };

  const updateExam = (examId: string, updates: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === examId ? { ...e, ...updates } : e)));
  };

  const deleteExam = (examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
  };

  const generateExamToken = (examId: string): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let token = '';
    for (let i = 0; i < 6; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const expiresAt = Date.now() + 15 * 60 * 1000;
    updateExam(examId, { token, tokenExpiresAt: expiresAt });
    return token;
  };

  const getExamQuestions = useCallback(
    (examId: string) => {
      const exam = exams.find((e) => e.id === examId);
      if (!exam) return [];
      return questions.filter((q) => exam.questionIds.includes(q.id) || q.examId === examId);
    },
    [exams, questions]
  );

  const createQuestion = (q: Question) => {
    setQuestions((prev) => [...prev, q]);
    // Also attach to exam questionIds if not already
    setExams((prev) =>
      prev.map((e) => {
        if (e.id === q.examId && !e.questionIds.includes(q.id)) {
          return { ...e, questionIds: [...e.questionIds, q.id] };
        }
        return e;
      })
    );
  };

  const updateQuestion = (qId: string, updates: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, ...updates } : q)));
  };

  const deleteQuestion = (qId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
    setExams((prev) =>
      prev.map((e) => ({
        ...e,
        questionIds: e.questionIds.filter((id) => id !== qId),
      }))
    );
  };

  const importQuestions = (newQuestions: Question[]) => {
    setQuestions((prev) => [...prev, ...newQuestions]);
  };

  const createStudent = (s: Student) => {
    setStudents((prev) => [...prev, s]);
  };

  const updateStudent = (sId: string, updates: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === sId ? { ...s, ...updates } : s)));
  };

  const deleteStudent = (sId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== sId));
  };

  const importStudents = (newStudents: Student[]) => {
    setStudents((prev) => [...prev, ...newStudents]);
  };

  // Student Login flow
  const loginStudent = (
    identifier: string,
    token: string
  ): { success: boolean; message: string; student?: Student } => {
    const trimmed = identifier.trim().toLowerCase();
    const student = students.find(
      (s) => s.username.toLowerCase() === trimmed || s.nisn === trimmed
    );

    if (!student) {
      return { success: false, message: 'Nomor Peserta atau NISN tidak ditemukan dalam daftar peserta!' };
    }

    const exam = currentExam;
    if (!exam) {
      return { success: false, message: 'Tidak ada ujian yang sedang aktif saat ini!' };
    }

    // Verify token
    if (exam.token.toUpperCase() !== token.trim().toUpperCase()) {
      return {
        success: false,
        message: `Token ujian "${token}" salah atau tidak valid! Silakan minta token terbaru ke Proktor.`,
      };
    }

    // Check if session is blocked
    const existingSession = studentSessions[student.id];
    if (existingSession && existingSession.status === 'blocked') {
      return {
        success: false,
        message: 'Akun Anda terkunci karena pelanggaran integritas ujian! Silakan hubungi Proktor untuk Reset.',
      };
    }

    // Initialize or continue session
    if (!existingSession) {
      const examQuestions = getExamQuestions(exam.id);
      let order = examQuestions.map((q) => q.id);
      if (exam.randomizeQuestions) {
        order = [...order].sort(() => Math.random() - 0.5);
      }

      const newSession: StudentExamSession = {
        studentId: student.id,
        examId: exam.id,
        status: 'in_progress',
        startedAt: Date.now(),
        remainingSeconds: exam.durationMinutes * 60,
        answers: {},
        violations: [],
        deviceIp: '192.168.1.' + Math.floor(Math.random() * 150 + 10),
        userAgent: navigator.userAgent.slice(0, 50),
        lastHeartbeat: Date.now(),
        questionOrder: order,
      };

      setStudentSessions((prev) => ({ ...prev, [student.id]: newSession }));
    }

    setCurrentStudentId(student.id);
    setUserRole('student');
    return { success: true, message: 'Login berhasil!', student };
  };

  const logoutStudent = () => {
    setCurrentStudentId(null);
  };

  const quickSwitchStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setCurrentStudentId(student.id);
      setUserRole('student');
    }
  };

  const saveStudentAnswer = (questionId: string, answerPatch: Partial<StudentAnswer>) => {
    if (!currentStudentId) return;

    setStudentSessions((prev) => {
      const existing = prev[currentStudentId];
      if (!existing) return prev;

      const currentAns = existing.answers[questionId] || {};
      const updatedAns: StudentAnswer = {
        ...currentAns,
        ...answerPatch,
        lastAnsweredAt: Date.now(),
      };

      return {
        ...prev,
        [currentStudentId]: {
          ...existing,
          answers: {
            ...existing.answers,
            [questionId]: updatedAns,
          },
          lastHeartbeat: Date.now(),
        },
      };
    });
  };

  const toggleStudentDoubtful = (questionId: string) => {
    if (!currentStudentId) return;

    setStudentSessions((prev) => {
      const existing = prev[currentStudentId];
      if (!existing) return prev;
      const currentAns = existing.answers[questionId] || {};
      const updatedAns: StudentAnswer = {
        ...currentAns,
        isDoubtful: !currentAns.isDoubtful,
      };

      return {
        ...prev,
        [currentStudentId]: {
          ...existing,
          answers: {
            ...existing.answers,
            [questionId]: updatedAns,
          },
        },
      };
    });
  };

  const recordViolation = (type: 'tab_switch' | 'fullscreen_exit' | 'devtools' | 'copy_paste', reason: string) => {
    if (!currentStudentId) return;

    setStudentSessions((prev) => {
      const sess = prev[currentStudentId];
      if (!sess) return prev;

      const newViolations = [...sess.violations, { timestamp: Date.now(), reason, type }];
      const maxAllowed = currentExam?.maxViolations || 3;
      const isNowBlocked = newViolations.length >= maxAllowed;

      return {
        ...prev,
        [currentStudentId]: {
          ...sess,
          violations: newViolations,
          status: isNowBlocked ? 'blocked' : sess.status,
        },
      };
    });
  };

  // Automatic Grading Calculation
  const calculateScore = (sessionId: string, currentSess: StudentExamSession): { score: number; percentage: number; isPassed: boolean } => {
    const examQuestions = getExamQuestions(currentSess.examId);
    let totalScore = 0;
    let maxPossible = 0;

    examQuestions.forEach((q) => {
      maxPossible += q.weight || 10;
      const userAns = currentSess.answers[q.id];
      if (!userAns) return;

      if (q.type === 'single_choice') {
        if (userAns.selectedOptionId && userAns.selectedOptionId === q.answerKey) {
          totalScore += q.weight || 10;
        }
      } else if (q.type === 'multi_choice') {
        const correctKeys = Array.isArray(q.answerKey) ? q.answerKey : [q.answerKey];
        const userKeys = userAns.selectedOptionIds || [];
        const isMatch =
          correctKeys.length === userKeys.length &&
          correctKeys.every((k) => userKeys.includes(k as string));
        if (isMatch) {
          totalScore += q.weight || 10;
        } else {
          // partial points
          const correctChosen = userKeys.filter((k) => correctKeys.includes(k)).length;
          const wrongChosen = userKeys.filter((k) => !correctKeys.includes(k)).length;
          const fraction = Math.max(0, (correctChosen - wrongChosen) / correctKeys.length);
          totalScore += Math.round((q.weight || 10) * fraction);
        }
      } else if (q.type === 'true_false') {
        const statements = q.trueFalseStatements || [];
        if (statements.length > 0) {
          const ansMap = userAns.trueFalseAnswers || {};
          let correctCount = 0;
          statements.forEach((st) => {
            if (ansMap[st.id] === st.isTrue) correctCount++;
          });
          const fraction = correctCount / statements.length;
          totalScore += Math.round((q.weight || 10) * fraction);
        }
      } else if (q.type === 'short_answer') {
        const cleanUser = (userAns.shortAnswerText || '').trim().toLowerCase();
        const cleanKey = String(q.answerKey || '').trim().toLowerCase();
        if (cleanUser && cleanUser === cleanKey) {
          totalScore += q.weight || 10;
        }
      }
    });

    const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
    const isPassed = percentage >= (currentExam?.kkm || 75);

    return { score: totalScore, percentage, isPassed };
  };

  const finishAndSubmitExam = (targetStudentId?: string) => {
    const sId = targetStudentId || currentStudentId;
    if (!sId) return;

    setStudentSessions((prev) => {
      const sess = prev[sId];
      if (!sess) return prev;

      const { score, percentage, isPassed } = calculateScore(sId, sess);

      return {
        ...prev,
        [sId]: {
          ...sess,
          status: 'completed',
          finishedAt: Date.now(),
          score,
          totalPoints: 100,
          percentage,
          isPassed,
        },
      };
    });
  };

  // Proctor Actions
  const proctorResetSession = (studentId: string) => {
    setStudentSessions((prev) => {
      const sess = prev[studentId];
      if (!sess) return prev;
      return {
        ...prev,
        [studentId]: {
          ...sess,
          status: 'in_progress',
          violations: [],
        },
      };
    });
  };

  const proctorExtendDuration = (studentId: string, extraMinutes: number) => {
    setStudentSessions((prev) => {
      const sess = prev[studentId];
      if (!sess) return prev;
      return {
        ...prev,
        [studentId]: {
          ...sess,
          remainingSeconds: sess.remainingSeconds + extraMinutes * 60,
        },
      };
    });
  };

  const proctorUnlockStudent = (studentId: string) => {
    setStudentSessions((prev) => {
      const sess = prev[studentId];
      if (!sess) return prev;
      return {
        ...prev,
        [studentId]: {
          ...sess,
          status: 'in_progress',
          // keep log but clear active lock
        },
      };
    });
  };

  const proctorForceSubmit = (studentId: string) => {
    finishAndSubmitExam(studentId);
  };

  const resetAllToFactoryDefaults = () => {
    localStorage.removeItem(`${STORAGE_KEY}_profile`);
    localStorage.removeItem(`${STORAGE_KEY}_exams`);
    localStorage.removeItem(`${STORAGE_KEY}_questions`);
    localStorage.removeItem(`${STORAGE_KEY}_students`);
    localStorage.removeItem(`${STORAGE_KEY}_sessions`);
    setSchoolProfile(initialSchoolProfile);
    setExams(initialExams);
    setQuestions(initialQuestions);
    setStudents(initialStudents);
    setStudentSessions(initialStudentSessions);
    setCurrentStudentId(null);
  };

  return (
    <CBTContext.Provider
      value={{
        schoolProfile,
        updateSchoolProfile,
        userRole,
        setUserRole,
        isSimulatedOffline,
        toggleSimulatedOffline,
        broadcastMessage,
        setBroadcastMessage,
        isAdminLoggedIn,
        adminUser,
        loginAdmin,
        logoutAdmin,
        updateProctorPin,
        exams,
        activeExamId,
        setActiveExamId,
        currentExam,
        createExam,
        updateExam,
        deleteExam,
        generateExamToken,
        questions,
        getExamQuestions,
        createQuestion,
        updateQuestion,
        deleteQuestion,
        importQuestions,
        students,
        createStudent,
        updateStudent,
        deleteStudent,
        importStudents,
        studentSessions,
        currentStudent,
        currentStudentSession,
        loginStudent,
        logoutStudent,
        quickSwitchStudent,
        saveStudentAnswer,
        toggleStudentDoubtful,
        recordViolation,
        finishAndSubmitExam,
        proctorResetSession,
        proctorExtendDuration,
        proctorUnlockStudent,
        proctorForceSubmit,
        resetAllToFactoryDefaults,
      }}
    >
      {children}
    </CBTContext.Provider>
  );
};

export const useCBT = (): CBTContextType => {
  const context = useContext(CBTContext);
  if (!context) {
    throw new Error('useCBT must be used within a CBTProvider');
  }
  return context;
};
