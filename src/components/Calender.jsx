
import React, { useState, useEffect } from "react";
import "./Calendar.css";
import ApiService from "../services/api";

const Calendar = ({ user, onBack }) => {
  // Enhanced debug logging
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    type: "event",
  });
  const [notification, setNotification] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- FETCH EVENTS ---------------- */
  useEffect(() => {
    // Check for .id OR .uid (common in different auth providers)
    const userId = user?.id || user?.uid;
    
    if (!userId) {
      console.error("No userId found in user object:", user);
      setError("User ID not found. Please try logging in again.");
      setIsLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const res = await ApiService.getUserReminders(userId);
        
        const data = Array.isArray(res.events) ? res.events : [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureEvents = [];

        for (const event of data) {
          const eventDate = new Date(`${event.date}T00:00:00`);
          if (eventDate < today) {
            try {
              await ApiService.deleteReminder(event.id);
            } catch (err) {
              console.error("Failed to delete expired event:", err);
            }
          } else {
            futureEvents.push(event);
          }
        }

        setEvents(futureEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again.");
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  /* ---------------- FEE NOTIFICATION ---------------- */
  useEffect(() => {
    if (!events.length) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const feeEvents = events.filter(
      (e) =>
        e.type === "fee" &&
        e.date &&
        new Date(`${e.date}T00:00:00`) > today &&
        new Date(`${e.date}T00:00:00`) <=
          new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    );

    if (feeEvents.length > 0) {
      const daysLeft = Math.ceil(
        (new Date(feeEvents[0].date) - today) / (1000 * 60 * 60 * 24)
      );

      setNotification(`⚠️ Fee due in ${daysLeft} days!`);

      const timer = setTimeout(() => setNotification(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [events]);

  /* ---------------- ADD EVENT ---------------- */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") addEvent();
  };

  const addEvent = async () => {
    const userId = user?.id || user?.uid;
    if (!newEvent.title || !newEvent.date || !userId) {
      alert("Please fill in all fields");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(`${newEvent.date}T00:00:00`);
    if (eventDate < today) {
      alert("Please select today or a future date.");
      return;
    }

    try {
      const saved = await ApiService.addReminder({
        userId: userId,
        email: user.email,
        title: newEvent.title,
        date: newEvent.date,
        type: newEvent.type,
      });

      setEvents((prev) => [
        ...prev,
        {
          id: saved.id,
          title: saved.title,
          date: saved.date,
          type: saved.type,
          isCollege: false,
        },
      ]);

      setNewEvent({ title: "", date: "", type: "event" });
    } catch (err) {
      console.error("Failed to save event:", err);
      alert("Failed to save event");
    }
  };

  /* ---------------- DELETE EVENT (manual) ---------------- */
  const deleteEvent = async (eventId) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await ApiService.deleteReminder(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Failed to delete event");
    }
  };

  /* ---------------- DATE HELPERS ---------------- */
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const dayEvents = events.filter((event) => event.date === dateStr);
      days.push({ day, events: dayEvents });
    }
    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Loading State
  if (!user) {
    return (
      <div className="calendar-container">
        <div className="loading-spinner">
          <p>No user data available. Please log in again.</p>
          {onBack && (
            <button onClick={onBack} className="btn">
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="calendar-container">
        <div className="loading-spinner">
          <p>Loading your calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-container">
        <div className="error-message">
          <p>{error}</p>
          {onBack && (
            <button onClick={onBack} className="btn">
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">
        <img
          src="/calendar.png"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/logo.png";
          }}
          alt="EventBuddy Icon"
          className="calendar-icon"
        />
        EventBuddy
      </h2>

      {notification && <div className="notification">{notification}</div>}

      <div className="event-form-section">
        <h3>Add New Event</h3>
        <div className="event-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="event-title">Event Title</label>
              <input
                id="event-title"
                type="text"
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                onKeyPress={handleKeyPress}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="event-date">Date</label>
              <input
                id="event-date"
                type="date"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="event-type">Type</label>
              <select
                id="event-type"
                value={newEvent.type}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, type: e.target.value })
                }
                className="form-input"
              >
                <option value="event">Event</option>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
                <option value="fee">Fee Due</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button onClick={addEvent} className="btn btn-add">
              Add Event
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-nav-section">
        <div className="calendar-nav">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1
                )
              )
            }
            className="btn nav-btn"
          >
            ←
          </button>

          <h3>
            {monthNames[currentMonth.getMonth()]}{" "}
            {currentMonth.getFullYear()}
          </h3>

          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1
                )
              )
            }
            className="btn nav-btn"
          >
            →
          </button>
        </div>
      </div>

      <div className="calendar-grid-section">
        <div className="calendar-grid">
          {weekDays.map((day) => (
            <div key={day} className="calendar-header-day">
              {day}
            </div>
          ))}

          {getDaysInMonth(currentMonth).map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${
                day?.events?.length ? "has-event" : ""
              }`}
            >
              {day && (
                <>
                  <div className="day-number">{day.day}</div>
                  {day.events.map((event) => (
                    <div
                      key={event.id}
                      className={`event-item ${event.type}`}
                      onDoubleClick={() => deleteEvent(event.id)}
                    >
                      {event.title}
                      {event.isCollege && (
                        <span className="college-badge">📚</span>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="upcoming-events-section">
        <h3>Upcoming Events</h3>
        <div className="events-grid">
          {events.length === 0 ? (
            <p>No upcoming events. Add one above!</p>
          ) : (
            events
              .filter((event) => new Date(event.date) >= new Date())
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 6)
              .map((event) => (
                <div key={event.id} className={`event-card ${event.type}`}>
                  <div className="event-info">
                    <strong>{event.title}</strong>
                    <span className="event-date">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    {event.isCollege && (
                      <span className="college-badge">College Event</span>
                    )}
                  </div>
                </div>
              ))
          )}
          {events.filter(event=>new Date(event.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,6)
            .map(event=>(
              <div key={event.id} className={`event-card ${event.type}`}>
                <div className="event-info-row">
                  <strong className="event-title">{event.title}</strong>
                  <span className="event-date-badge">{new Date(event.date).toLocaleDateString()}</span>
                  <span className="event-type-badge">{event.type}</span>
                  {event.isCollege && <span className="college-badge">College</span>}
                </div>
                <button 
                  className="event-delete-btn"
                  onClick={() => deleteEvent(event.id)}
                  title="Delete event"
                >
                  🗑️
                </button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default Calendar;