const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-backend-domain.com/api"
    : "http://localhost:5000/api";

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      credentials: "include", // This sends cookies with the request
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };


    try {
      const response = await fetch(url, config);
      const data = await response.json();

    
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error("API Error:", { url, error: error.message });
      throw error;
    }
  }

  // -------- Auth --------
  static register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  static login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  static getMe() {
    return this.request("/auth/me");
  }

  static getProfile() {
    return this.request("/profile");
  }

  static logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  // -------- Attendance --------
  static getAttendance(userId) {
    if (!userId) {
      throw new Error("userId is required for getAttendance");
    }
    return this.request(`/attendance/${userId}`);
  }

  static getSubjects(userId) {
    return this.request(`/attendance/subjects/list/${userId}`);
  }

  static syncSubjects(userId, subjects) {
    return this.request("/attendance/subjects/sync", {
      method: "POST",
      body: JSON.stringify({ userId, subjects }),
    });
  }

  static markAttendance({ userId, subject, date, status }) {
    if (!userId) {
      throw new Error("userId is required to mark attendance");
    }

    return this.request("/attendance/mark", {
      method: "POST",
      body: JSON.stringify({ userId, subject, date, status }),
    });
  }

  static deleteAttendanceSession(userId, subject, date, status) {
    if (!userId) {
      throw new Error("userId is required to delete attendance");
    }

    return this.request(
      `/attendance/${userId}/${subject}/${date}/${status}`,
      { method: "DELETE" }
    );
  }

  // -------- Reminders / Calendar --------
  static getUserReminders(userId) {
    if (!userId) {
      throw new Error("userId is required for getUserReminders");
    }
  
    return this.request(`/reminder/user/${userId}`);
  }

  static addReminder({ userId, email, title, date, type }) {
    if (!userId) {
      throw new Error("userId is required to add reminder");
    }
    return this.request("/reminder/add", {
      method: "POST",
      body: JSON.stringify({ userId, email, title, date, type }),
    });
  }

  static deleteReminder(eventId) {
    if (!eventId) {
      throw new Error("eventId is required to delete reminder");
    }
    return this.request(`/reminder/${eventId}`, { method: "DELETE" });
  }

  static sendReminderEmail(email, eventTitle, eventDate) {
    return this.request("/reminder/send", {
      method: "POST",
      body: JSON.stringify({ email, eventTitle, eventDate }),
    });
  }
}

export default ApiService;