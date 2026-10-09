import React, { useState, useEffect } from 'react';
import { CBTProvider, useCBT } from './context/CBTContext';
import { Navbar } from './components/common/Navbar';
import { LoginPortal } from './components/auth/LoginPortal';
import { StudentConfirm } from './components/student/StudentConfirm';
import { StudentExamRoom } from './components/student/StudentExamRoom';
import { StudentResult } from './components/student/StudentResult';
import { ProctorDashboard } from './components/proctor/ProctorDashboard';

function CBTApp() {
  const {
    userRole,
    setUserRole,
    currentStudent,
    currentStudentSession,
    isAdminLoggedIn,
    logoutStudent,
  } = useCBT();

  const [studentStage, setStudentStage] = useState<'login' | 'confirm' | 'exam' | 'result'>('login');

  // Sync stage if student session changes
  useEffect(() => {
    if (userRole === 'student') {
      if (!currentStudent) {
        setStudentStage('login');
      } else if (currentStudentSession?.status === 'completed') {
        setStudentStage('result');
      } else if (
        currentStudentSession?.status === 'in_progress' ||
        currentStudentSession?.status === 'blocked'
      ) {
        setStudentStage('exam');
      } else {
        setStudentStage('confirm');
      }
    }
  }, [userRole, currentStudent, currentStudentSession?.status]);

  const isExamActiveFullscreen = userRole === 'student' && studentStage === 'exam';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Hide navbar only during active student exam to preserve fullscreen immersion */}
      {!isExamActiveFullscreen && <Navbar />}

      <main className="flex-1">
        {userRole === 'proctor' ? (
          isAdminLoggedIn ? (
            <ProctorDashboard />
          ) : (
            <LoginPortal
              initialRole="proctor"
              onAdminLoginSuccess={() => setUserRole('proctor')}
              onStudentLoginSuccess={() => {
                setUserRole('student');
                setStudentStage('confirm');
              }}
            />
          )
        ) : (
          <>
            {!currentStudent && (
              <LoginPortal
                initialRole="student"
                onStudentLoginSuccess={() => setStudentStage('confirm')}
                onAdminLoginSuccess={() => setUserRole('proctor')}
              />
            )}

            {currentStudent && studentStage === 'confirm' && (
              <StudentConfirm onStartExam={() => setStudentStage('exam')} />
            )}

            {currentStudent && studentStage === 'exam' && (
              <StudentExamRoom onExamFinished={() => setStudentStage('result')} />
            )}

            {currentStudent && studentStage === 'result' && (
              <StudentResult
                onBackToHome={() => {
                  logoutStudent();
                  setStudentStage('login');
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CBTProvider>
      <CBTApp />
    </CBTProvider>
  );
}
