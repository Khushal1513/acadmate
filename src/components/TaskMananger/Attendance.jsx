/**
 * Attendify - Attendance Tracking Component (Firebase + API)
 */

import React, { useState, useEffect } from "react";
import "./AttendanceTracker.css";
import ApiService from "../../services/api";

const AttendanceTracker = ({ onBack }) => {
  const [user, setUser] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [targetPercentage, setTargetPercentage] = useState(75);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedDates, setSelectedDates] = useState({});
  const [undoStack, setUndoStack] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedSubjectForCalendar, setSelectedSubjectForCalendar] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  /* ============================
     INITIAL LOAD (USER + DATA)
  ============================ */
  useEffect(() => {
    const init = async () => {
      try {
        const me = await ApiService.getMe();
        setUser(me.user);

        const subjectNames = await ApiService.getSubjects(me.user.id);

        const baseSubjects = subjectNames.map((name) => ({
          id: name,
          name,
          sessions: [],
          showAttendanceForm: false,
          showSessions: false,
        }));

        setSubjects(baseSubjects);

        const records = await ApiService.getAttendance(me.user.id);
        hydrateSessions(baseSubjects, records);
      } catch (err) {
        console.error("Attendance load failed:", err);
      }
    };

    init();
  }, []);

  /* ============================
     MAP DB RECORDS → UI
  ============================ */
  const hydrateSessions = (baseSubjects, records) => {
    setSubjects(
      baseSubjects.map((subj) => ({
        ...subj,
        sessions: records
          .filter((r) => r.subject === subj.name)
          .map((r) => ({
            id: `${r.date}_${r.status}`,
            date: r.date,
            status: r.status,
            isExtra: false,
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
      }))
    );
  };

  /* ============================
     UNDO SUPPORT (UI ONLY)
  ============================ */
  const saveToUndoStack = () => {
    setUndoStack((prev) => [
      ...prev,
      JSON.parse(JSON.stringify(subjects)),
    ]);
  };

  const handleUndo = () => {
    if (!undoStack.length) return;
    setSubjects(undoStack[undoStack.length - 1]);
    setUndoStack((prev) => prev.slice(0, -1));
  };

  /* ============================
     SUBJECT MANAGEMENT
  ============================ */
  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !user) return;

    const exists = subjects.some(
      (s) => s.name.toLowerCase() === newSubjectName.trim().toLowerCase()
    );
    if (exists) {
      alert("Subject already exists");
      return;
    }

    saveToUndoStack();

    const updated = [
      ...subjects,
      {
        id: newSubjectName.trim(),
        name: newSubjectName.trim(),
        sessions: [],
        showAttendanceForm: false,
        showSessions: false,
      },
    ];

    setSubjects(updated);
    setNewSubjectName("");

    await ApiService.syncSubjects(
      user.id,
      updated.map((s) => s.name)
    );
  };

  const handleRemoveSubject = async (subjectId) => {
    saveToUndoStack();

    const updated = subjects.filter((s) => s.id !== subjectId);
    setSubjects(updated);

    await ApiService.syncSubjects(
      user.id,
      updated.map((s) => s.name)
    );
  };

  /* ============================
     ATTENDANCE ACTIONS
  ============================ */
  const handleMarkAttendance = async (subjectId, status) => {
    if (!user) return;

    const date =
      selectedDates[subjectId] ||
      new Date().toISOString().split("T")[0];

    await ApiService.markAttendance({
      userId: user.id,
      subject: subjectId,
      date,
      status,
    });

    const records = await ApiService.getAttendance(user.id);
    hydrateSessions(subjects, records);
  };

  const handleDeleteSession = async (subjectId, sessionDate, sessionStatus) => {
  if (!window.confirm("Delete this session?")) return;
  
  saveToUndoStack();

  try {
    await ApiService.deleteAttendanceSession(
      user.id,
      subjectId,
      sessionDate,
      sessionStatus
    );

    const records = await ApiService.getAttendance(user.id);
    hydrateSessions(subjects, records);
    
    console.log("✅ Session deleted successfully");
  } catch (err) {
    console.error("❌ Failed to delete session:", err);
    alert("Failed to delete session. Please try again.");
  }
};

  /* ============================
     UI HELPERS (UNCHANGED)
  ============================ */
  const calculateAttendance = (sessions) => {
    if (!sessions.length) return 0;
    const present = sessions.filter((s) => s.status === "present").length;
    return Math.round((present / sessions.length) * 100);
  };

  const getStatusClass = (percentage) =>
    percentage >= targetPercentage ? "status-good" : "status-warning";

  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

  const fmt = (n) => (n < 10 ? `0${n}` : `${n}`);
  const toLocalDateString = (y, m, d) => `${y}-${fmt(m + 1)}-${fmt(d)}`;

  const navigateMonth = (dir) => {
    if (dir === "prev") {
      currentMonth === 0
        ? (setCurrentMonth(11), setCurrentYear(currentYear - 1))
        : setCurrentMonth(currentMonth - 1);
    } else {
      currentMonth === 11
        ? (setCurrentMonth(0), setCurrentYear(currentYear + 1))
        : setCurrentMonth(currentMonth + 1);
    }
  };

  const getDayStatusForSubject = (day) => {
    if (!selectedSubjectForCalendar) return null;
    const dateStr = toLocalDateString(currentYear, currentMonth, day);
    const subj = subjects.find((s) => s.id === selectedSubjectForCalendar);
    if (!subj) return null;

    const daySessions = subj.sessions.filter((s) => s.date === dateStr);
    if (!daySessions.length) return null;

    const hasPresent = daySessions.some((s) => s.status === "present");
    const hasAbsent = daySessions.some((s) => s.status === "absent");
    if (hasPresent && hasAbsent) return "mixed";
    return hasPresent ? "present" : "absent";
  };

  // ============================
//  UI TOGGLES
// ============================
const toggleAttendanceForm = (subjectId) => {
  setSubjects((prev) =>
    prev.map((s) =>
      s.id === subjectId
        ? { ...s, showAttendanceForm: !s.showAttendanceForm }
        : s
    )
  );
};

const toggleShowSessions = (subjectId) => {
  setSubjects((prev) =>
    prev.map((s) =>
      s.id === subjectId
        ? { ...s, showSessions: !s.showSessions }
        : s
    )
  );
};


  return (
    <div className="attendance-tracker">
      <header className="tracker-header">
        <div className="grade-header" style={{ width: 'min(1100px, 92vw)', margin: '0 auto 1.5rem', padding: '1rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', minWidth: '56px' }}>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', paddingLeft: '8px', minWidth: 0 }}>
              <img src={'/attend.jpg'} alt="Attendance" className="title-logo" style={{ marginLeft: 8 }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/attend.jpg'; }} />
              <h3 className="grade-title" style={{ margin: 0, fontWeight: 800, textTransform: 'uppercase', fontSize: 'clamp(1.8rem, 6vw, 3rem)', lineHeight: 1, whiteSpace: 'nowrap' }}>Attendify</h3>
            </div>
            <div style={{ flex: 1 }} />
          </div>
        </div>
        <div className="header-actions" style={{ justifyContent: 'center', margin: '0 auto', width: 'min(1100px, 92vw)' }}>
          <button className="btn-calendar" onClick={() => setShowCalendar(v => !v)}>
            {showCalendar ? '▲ Hide Calendar' : '📅 Calendar View'}
          </button>
          {undoStack.length > 0 && (
            <button className="btn-undo" onClick={handleUndo}>↶ Undo</button>
          )}
        </div>
      </header>

      <div style={{ width: 'min(1100px, 92vw)', margin: '0 auto' }}>
      <section className="config-panel">
        <div className="config-content">
          <div className="config-item">
            <label className="config-label">Target Attendance %</label>
            <input type="number" className="config-input" value={targetPercentage} onChange={(e) => setTargetPercentage(Number(e.target.value))} min="0" max="100" />
          </div>

          <div className="config-item">
            <label className="config-label">Add Subject</label>
            <div className="add-subject-group">
              <input type="text" className="config-input" placeholder="Subject name" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()} />
              <button className="btn-add" onClick={handleAddSubject}>+ Add</button>
            </div>
          </div>

          {subjects.length > 0 && (
            <div className="config-item">
              <label className="config-label">Subjects ({subjects.length})</label>
              <div className="subjects-list">
                {subjects.map(subject => (
                  <div key={subject.id} className="subject-tag">
                    <span>{subject.name}</span>
                    <button className="btn-remove-tag" onClick={() => handleRemoveSubject(subject.id)}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      </div>

      {showCalendar && (
        <section className="calendar-grid-section">
          <div className="calendar-controls">
            <div className="controls-content">
              <div className="control-group">
                <label className="control-label">Subject</label>
                <select
                  className="subject-select"
                  value={selectedSubjectForCalendar}
                  onChange={(e) => setSelectedSubjectForCalendar(e.target.value)}
                >
                  <option value="">Select a subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label className="control-label">Month</label>
                <div className="month-navigation">
                  <button className="btn-nav" onClick={() => navigateMonth('prev')}>‹ Prev</button>
                  <div className="current-month">
                    {new Date(currentYear, currentMonth).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                  <button className="btn-nav" onClick={() => navigateMonth('next')}>Next ›</button>
                </div>
              </div>
            </div>
          </div>

          {selectedSubjectForCalendar && (
            <>
              <div className="calendar-legend">
                <div className="legend-content">
                  <div className="legend-title">Legend</div>
                  <div className="legend-items">
                    <div className="legend-item"><div className="legend-color legend-present"></div><span className="legend-text">Present</span></div>
                    <div className="legend-item"><div className="legend-color legend-absent"></div><span className="legend-text">Absent</span></div>
                    <div className="legend-item"><div className="legend-color legend-extra"></div><span className="legend-text">Extra</span></div>
                    <div className="legend-item"><div className="legend-color legend-mixed"></div><span className="legend-text">Mixed</span></div>
                  </div>
                </div>
              </div>

              <div className="calendar-container">
                <div className="calendar-weekdays">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                    <div key={d} className="weekday">{d}</div>
                  ))}
                </div>
                <div className="calendar-grid">
                  {Array.from({ length: getFirstDayOfMonth(currentMonth, currentYear) }).map((_, i) => (
                    <div key={`empty-${i}`} className="calendar-day empty" />
                  ))}
                  {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, idx) => {
                    const day = idx + 1;
                    const status = getDayStatusForSubject(day);
                    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
                    const classes = ['calendar-day'];
                    if (status) classes.push(status);
                    if (isToday) classes.push('today');
                    return (
                      <div key={day} className={classes.join(' ')}>
                        <div className="day-number">{day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>
      )}

      <section className="subjects-grid">
        {subjects.length === 0 ? (
          <div className="empty-state">
            <p>No subjects added yet. Add your first subject to start tracking attendance!</p>
          </div>
        ) : (
          subjects.map(subject => {
            const percentage = calculateAttendance(subject.sessions);
            const statusClass = getStatusClass(percentage);

            return (
              <div key={subject.id} className="subject-card">
                <div className="card-header">
                  <h3 className="card-title">{subject.name}</h3>
                  <div className={`attendance-badge ${statusClass}`}>
                    {percentage}%
                  </div>
                </div>

                <div className="card-stats">
                  <span className="stat-item">Total Classes: {subject.sessions.length}</span>
                  <span className="stat-item">Present: {subject.sessions.filter(s => s.status === 'present').length}</span>
                  <span className="stat-item">Extra Classes: {subject.sessions.filter(s => s.isExtra).length}</span>
                </div>

                <button className={`btn-toggle-form ${subject.showAttendanceForm ? 'btn-toggle-form-active' : ''}`} onClick={() => toggleAttendanceForm(subject.id)}>
                  {subject.showAttendanceForm ? '▲ Hide Attendance Form' : '▼ Mark Attendance'}
                </button>

                {subject.showAttendanceForm && (
                  <div className="card-actions">
                    <input type="date" className="date-input" value={selectedDates[subject.id] || new Date().toISOString().split('T')[0]} onChange={(e) => setSelectedDates({ ...selectedDates, [subject.id]: e.target.value })} />

                    <div className="attendance-section">
                      <label className="section-label">Regular Attendance</label>
                      <div className="action-buttons-regular">
                        <button className="btn-present" onClick={() => handleMarkAttendance(subject.id, 'present', false)}>✓ Present</button>
                        <button className="btn-absent" onClick={() => handleMarkAttendance(subject.id, 'absent', false)}>✗ Absent</button>
                      </div>
                    </div>

                    <div className="attendance-section">
                      <label className="section-label">Extra Class</label>
                      <div className="action-buttons-extra">
                        <button className="btn-extra-present" onClick={() => handleMarkAttendance(subject.id, 'present', true)}>+ Extra (Present)</button>
                        <button className="btn-extra-absent" onClick={() => handleMarkAttendance(subject.id, 'absent', true)}>+ Extra (Absent)</button>
                      </div>
                    </div>
                  </div>
                )}

                {subject.sessions.length > 0 && (
                  <div className="sessions-history">
                    <div className="history-header">
                      <h4 className="history-title">All Sessions ({subject.sessions.length})</h4>
                      <button className="btn-toggle-sessions" onClick={() => toggleShowSessions(subject.id)}>
                        {subject.showSessions ? '▲ Hide' : '▼ Show'}
                      </button>
                    </div>
                    {subject.showSessions && (
                      <div className="sessions-list">
                        {subject.sessions.map((session) => (
                          <div key={session.id} className="session-item">
                            <span className="session-date">{session.date}</span>
                            <span className={`session-status status-${session.status}`}>
                              {session.isExtra && '⭐ Extra - '}
                              {session.status === 'present' ? '✓ Present' : '✗ Absent'}
                            </span>
                            <button className="btn-delete-session" onClick={() => handleDeleteSession(subject.id, session.id)} title="Delete session">🗑</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

export default AttendanceTracker;