export type UserRole = 'proctor' | 'student';

export type QuestionType = 'single_choice' | 'multi_choice' | 'true_false' | 'short_answer' | 'essay';

export type DifficultyLevel = 'mudah' | 'sedang' | 'sukar';

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
  image?: string;
  isCorrect?: boolean;
}

export interface TrueFalseStatement {
  id: string;
  statement: string;
  isTrue: boolean;
}

export interface Question {
  id: string;
  examId: string;
  subject: string;
  type: QuestionType;
  prompt: string; // Markdown & LaTeX syntax ($...$ or $$...$$)
  image?: string;
  imageCaption?: string;
  audio?: string;
  audioCaption?: string;
  options?: QuestionOption[];
  answerKey?: string | string[]; // Single choice id, or array of ids for multi_choice, or string for short answer
  trueFalseStatements?: TrueFalseStatement[];
  weight: number;
  explanation?: string;
  difficulty: DifficultyLevel;
  topic?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  classLevel: string; // e.g. "Kelas XII (Semua Jurusan)", "Kelas X IPA"
  durationMinutes: number;
  kkm: number; // Kriteria Ketuntasan Minimal, e.g. 75
  token: string;
  tokenExpiresAt: number;
  status: 'active' | 'scheduled' | 'finished';
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResultToStudent: boolean;
  allowReview: boolean;
  maxViolations: number; // e.g. 3 violations locks student
  passingScore: number;
  createdAt: string;
  questionIds: string[];
}

export interface StudentAnswer {
  selectedOptionId?: string; // Single choice
  selectedOptionIds?: string[]; // Multi choice
  trueFalseAnswers?: Record<string, boolean>; // True/False statement ID -> boolean
  shortAnswerText?: string;
  essayText?: string;
  isDoubtful?: boolean; // Ragu-ragu
  lastAnsweredAt?: number;
}

export interface StudentViolation {
  timestamp: number;
  reason: string;
  type: 'tab_switch' | 'fullscreen_exit' | 'devtools' | 'copy_paste';
}

export interface Student {
  id: string;
  nisn: string;
  username: string;
  name: string;
  classRoom: string;
  session: number; // Sesi 1, 2, 3
  roomName: string; // Ruang Lab Komputer 1
  avatarUrl?: string;
}

export interface StudentExamSession {
  studentId: string;
  examId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  startedAt?: number;
  finishedAt?: number;
  remainingSeconds: number;
  answers: Record<string, StudentAnswer>; // questionId -> StudentAnswer
  violations: StudentViolation[];
  score?: number;
  totalPoints?: number;
  percentage?: number;
  isPassed?: boolean;
  deviceIp: string;
  userAgent: string;
  lastHeartbeat: number;
  questionOrder: string[]; // Order of question IDs for this student (supports randomization)
}

export interface SchoolProfile {
  name: string;
  institutionType: 'Madrasah Aliyah' | 'SMA' | 'SMK' | 'MTs' | 'SMP';
  npsn: string;
  nsm?: string;
  address: string;
  subdistrict: string;
  city: string;
  province: string;
  postalCode: string;
  principalName: string;
  principalNip: string;
  proctorName: string;
  proctorNip: string;
  academicYear: string;
  semester: string;
  examTitle: string; // e.g. "PENILAIAN AKHIR SEMESTER (PAS) BERBASIS KOMPUTER"
  logoUrl?: string;
  proctorPin: string; // PIN rahasia keamanan proktor/pengawas (hanya diketahui guru/proktor)
}

export interface ExamStatistics {
  totalParticipants: number;
  completedCount: number;
  inProgressCount: number;
  blockedCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  failCount: number;
}
