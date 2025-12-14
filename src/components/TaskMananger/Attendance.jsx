/**
 * Attendify - Attendance Tracking Component
 */

import React, { useState, useEffect } from 'react';
import './AttendanceTracker.css';

const AttendanceTracker = ({ onBack }) => {
  const [subjects, setSubjects] = useState([]);
  const [targetPercentage, setTargetPercentage] = useState(75);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [undoStack, setUndoStack] = useState([]);
  const [selectedDates, setSelectedDates] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedSubjectForCalendar, setSelectedSubjectForCalendar] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentDay, setCurrentDay] = useState(new Date().getDate());
  const [sessionsDisplayLimit, setSessionsDisplayLimit] = useState({}); // Track display limit per subject
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('attendanceTrackerData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setSubjects(parsed.subjects || []);
      setTargetPercentage(parsed.targetPercentage || 75);
    }
  }, []);

  // By default, do not auto-select subject; calendar remains empty until user selects

  useEffect(() => {
    const dataToSave = { subjects, targetPercentage };
    localStorage.setItem('attendanceTrackerData', JSON.stringify(dataToSave));
  }, [subjects, targetPercentage]);

  // Auto-hide sessions list and calendar when scrolling up and reaching header part (top of page)
  useEffect(() => {
    const HEADER_THRESHOLD = 200; // Distance from top to consider as "header area"
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY;
      
      // Update last scroll position
      lastScrollY = currentScrollY;
      
      // Only hide when scrolling up AND reaching header area
      if (isScrollingUp && currentScrollY <= HEADER_THRESHOLD) {
        // Hide calendar if it's open
        if (showCalendar) {
          setShowCalendar(false);
        }
        
        // Check if any sessions are currently shown
        const hasOpenSessions = subjects.some(subject => subject.showSessions);
        if (hasOpenSessions) {
          // Hide all open sessions and reset display limits
          setSubjects(prevSubjects => 
            prevSubjects.map(subject => ({
              ...subject,
              showSessions: false
            }))
          );
          setSessionsDisplayLimit({});
        }
      }
    };

    // Add scroll event listener to window
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [subjects, showCalendar]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowMonthDropdown(false);
        setShowDayDropdown(false);
        setShowYearDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const saveToUndoStack = () => {
    setUndoStack(prev => [...prev, { subjects: JSON.parse(JSON.stringify(subjects)), targetPercentage }]);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setSubjects(lastState.subjects);
      setTargetPercentage(lastState.targetPercentage);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      const normalized = newSubjectName.trim().toLowerCase();
      const exists = subjects.some(s => (s.name || '').trim().toLowerCase() === normalized);
      if (exists) {
        alert('This subject has already been added.');
        return;
      }
      saveToUndoStack();
      const newSubject = {
        id: Date.now().toString(),
        name: newSubjectName.trim(),
        sessions: [],
        showAttendanceForm: false,
        showSessions: false
      };
      setSubjects([...subjects, newSubject]);
      setNewSubjectName('');
    }
  };

  const handleRemoveSubject = (subjectId) => {
    saveToUndoStack();
    setSubjects(subjects.filter(s => s.id !== subjectId));
  };

  const handleMarkAttendance = (subjectId, status, isExtra = false) => {
    saveToUndoStack();
    const date = selectedDates[subjectId] || new Date().toISOString().split('T')[0];

    setSubjects(subjects.map(subject => {
      if (subject.id === subjectId) {
        if (isExtra) {
          const newSession = {
            id: Date.now().toString() + Math.random(),
            date,
            status,
            isExtra: true
          };
          return {
            ...subject,
            sessions: [...subject.sessions, newSession].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          };
        } else {
          const existingRegularIndex = subject.sessions.findIndex(s => s.date === date && !s.isExtra);
          if (existingRegularIndex >= 0) {
            const updatedSessions = [...subject.sessions];
            updatedSessions[existingRegularIndex] = { ...updatedSessions[existingRegularIndex], status };
            return { ...subject, sessions: updatedSessions };
          } else {
            const newSession = {
              id: Date.now().toString() + Math.random(),
              date,
              status,
              isExtra: false
            };
            return {
              ...subject,
              sessions: [...subject.sessions, newSession].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            };
          }
        }
      }
      return subject;
    }));
  };

  const handleDeleteSession = (subjectId, sessionId) => {
    saveToUndoStack();
    setSubjects(subjects.map(subject => {
      if (subject.id === subjectId) {
        return { ...subject, sessions: subject.sessions.filter(s => s.id !== sessionId) };
      }
      return subject;
    }));
  };

  const toggleAttendanceForm = (subjectId) => {
    setSubjects(subjects.map(subject => subject.id === subjectId ? { ...subject, showAttendanceForm: !subject.showAttendanceForm } : subject));
  };

  const toggleShowSessions = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const currentLimit = sessionsDisplayLimit[subjectId] || 0;
    const totalSessions = subject.sessions.length;
    
    if (!subject.showSessions) {
      // First click: show first 5 sessions
      setSubjects(subjects.map(s => s.id === subjectId ? { ...s, showSessions: true } : s));
      setSessionsDisplayLimit(prev => ({ ...prev, [subjectId]: 5 }));
    } else {
      // Subsequent clicks: add 10 more sessions
      const newLimit = Math.min(currentLimit + 10, totalSessions);
      setSessionsDisplayLimit(prev => ({ ...prev, [subjectId]: newLimit }));
    }
  };

  const calculateAttendance = (sessions) => {
    if (sessions.length === 0) return 0;
    const presentCount = sessions.filter(s => s.status === 'present').length;
    return Math.round((presentCount / sessions.length) * 100);
    };

  const getStatusClass = (percentage) => {
    if (percentage >= targetPercentage) return 'status-good';
    return 'status-warning';
  };

  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();
  const fmt = (n) => (n < 10 ? `0${n}` : `${n}`);
  const toLocalDateString = (y, m, d) => `${y}-${fmt(m + 1)}-${fmt(d)}`; // m is 0-based
  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
    // Adjust day if it's invalid for the new month
    adjustDayForMonth();
  };

  const adjustDayForMonth = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    setCurrentDay(prevDay => {
      if (prevDay > daysInMonth) {
        return daysInMonth;
      }
      if (prevDay < 1) {
        return 1;
      }
      return prevDay;
    });
  };

  // Adjust day when month or year changes
  useEffect(() => {
    adjustDayForMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, currentYear]);

  const handleMonthChange = (month) => {
    setCurrentMonth(month);
    adjustDayForMonth();
    setShowMonthDropdown(false);
  };

  const handleDayChange = (day) => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    if (day <= daysInMonth) {
      setCurrentDay(day);
    }
    setShowDayDropdown(false);
  };

  const handleYearChange = (year) => {
    setCurrentYear(year);
    // Check if current day is valid for February in leap year
    adjustDayForMonth();
    setShowYearDropdown(false);
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getAvailableDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const getAvailableYears = () => {
    const currentYearValue = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYearValue - 5 + i);
  };

  const getDayStatusForSubject = (day) => {
    if (!selectedSubjectForCalendar) return null;
    // Use local YYYY-MM-DD to match input[type=date] values and stored session dates
    const dateStr = toLocalDateString(currentYear, currentMonth, day);
    const subj = subjects.find(s => s.id === selectedSubjectForCalendar);
    if (!subj) return null;
    const daySessions = subj.sessions.filter(s => s.date === dateStr);
    if (daySessions.length === 0) return null;
    const hasPresent = daySessions.some(s => s.status === 'present');
    const hasAbsent = daySessions.some(s => s.status === 'absent');
    const hasOnlyExtra = daySessions.every(s => s.isExtra);
    if (hasPresent && hasAbsent) return 'mixed';
    if (hasOnlyExtra) return 'extra';
    return hasPresent ? 'present' : 'absent';
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
              <div className="control-group date-row-group">
                <div className="date-row-container">
                  <div className="dropdown-container subject-dropdown">
                    <select
                      className="subject-select pill-select"
                      value={selectedSubjectForCalendar}
                      onChange={(e) => setSelectedSubjectForCalendar(e.target.value)}
                    >
                      <option value="">Select subject</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="dropdown-container date-dropdown">
                    <label className="date-label">Day</label>
                    <button 
                      className="pill-dropdown-btn"
                      onClick={() => {
                        setShowDayDropdown(!showDayDropdown);
                        setShowMonthDropdown(false);
                        setShowYearDropdown(false);
                      }}
                    >
                      {currentDay}
                      <span className="dropdown-arrow">▼</span>
                    </button>
                    {showDayDropdown && (
                      <div className="pill-dropdown-menu day-dropdown">
                        {getAvailableDays().map((day) => (
                          <button
                            key={day}
                            className={`pill-dropdown-item ${day === currentDay ? 'active' : ''}`}
                            onClick={() => handleDayChange(day)}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="dropdown-container month-dropdown">
                    <label className="date-label">Month</label>
                    <button 
                      className="pill-dropdown-btn"
                      onClick={() => {
                        setShowMonthDropdown(!showMonthDropdown);
                        setShowDayDropdown(false);
                        setShowYearDropdown(false);
                      }}
                    >
                      {monthNames[currentMonth]}
                      <span className="dropdown-arrow">▼</span>
                    </button>
                    {showMonthDropdown && (
                      <div className="pill-dropdown-menu month-menu-grid">
                        {monthNames.map((month, index) => (
                          <button
                            key={index}
                            className={`pill-dropdown-item ${index === currentMonth ? 'active' : ''}`}
                            onClick={() => handleMonthChange(index)}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="dropdown-container year-dropdown">
                    <label className="date-label">Year</label>
                    <button 
                      className="pill-dropdown-btn"
                      onClick={() => {
                        setShowYearDropdown(!showYearDropdown);
                        setShowMonthDropdown(false);
                        setShowDayDropdown(false);
                      }}
                    >
                      {currentYear}
                      <span className="dropdown-arrow">▼</span>
                    </button>
                    {showYearDropdown && (
                      <div className="pill-dropdown-menu year-menu">
                        {getAvailableYears().map((year) => (
                          <button
                            key={year}
                            className={`pill-dropdown-item ${year === currentYear ? 'active' : ''}`}
                            onClick={() => handleYearChange(year)}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                        {subject.showSessions ? '▲ Hide' : '▼ Show More'}
                      </button>
                    </div>
                    {subject.showSessions && (() => {
                      const displayLimit = sessionsDisplayLimit[subject.id] || 5;
                      const displayedSessions = subject.sessions.slice(0, displayLimit);
                      const hasMore = subject.sessions.length > displayLimit;
                      const remaining = subject.sessions.length - displayLimit;
                      
                      return (
                        <>
                          <div className="sessions-list">
                            {displayedSessions.map((session) => (
                              <div key={session.id} className="session-item">
                                <span className="session-date">{session.date}</span>
                                <span className={`session-status ${session.isExtra ? 'status-extra' : `status-${session.status}`}`}>
                                  {session.isExtra ? 'Extra' : session.status === 'present' ? 'Present' : 'Absent'}
                                </span>
                                <button className="btn-delete-session" onClick={() => handleDeleteSession(subject.id, session.id)} title="Delete session">🗑</button>
                              </div>
                            ))}
                          </div>
                          {hasMore ? (
                            <button className="btn-toggle-sessions" onClick={() => toggleShowSessions(subject.id)} style={{ marginTop: '0.5rem', width: '100%' }}>
                              Show More ({remaining} remaining)
                            </button>
                          ) : (
                            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.7rem', color: '#666' }}>
                              All sessions displayed
                            </div>
                          )}
                        </>
                      );
                    })()}
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