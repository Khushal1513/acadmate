
// controllers/attendanceController.js
const attendanceService = require("../utils/attendanceService");

/**
 * Attendance Controller - Handles HTTP requests and responses
 */
class AttendanceController {
  /**
   * Add a new subject
   * POST /api/attendance/subject/add
   */
  async addSubject(req, res) {
    try {
      const { userId, subject } = req.body;

      if (!userId || !subject) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const result = await attendanceService.addSubject(userId, subject);

      res.json({ 
        message: "Subject added successfully",
        ...result
      });
    } catch (err) {
      console.error("❌ Add subject error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Mark attendance for a subject
   * POST /api/attendance/mark
   */
  async markAttendance(req, res) {
    try {
      const { userId, subject, date, status } = req.body;

      if (!userId || !subject || !date || !status) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const result = await attendanceService.markAttendance(userId, subject, date, status);

      res.json({ 
        message: "Attendance marked successfully",
        ...result
      });
    } catch (err) {
      console.error("❌ Mark attendance error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Reset attendance for a specific date
   * DELETE /api/attendance/record/:userId/:subject/:date
   */
  async resetAttendanceForDate(req, res) {
    try {
      const { userId, subject, date } = req.params;
      const decodedSubject = decodeURIComponent(subject);

      await attendanceService.resetAttendanceForDate(userId, decodedSubject, date);

      res.json({ message: "Date record deleted" });
    } catch (err) {
      console.error("❌ Delete record error:", err);
      const statusCode = err.message === "User document not found" ? 404 : 500;
      res.status(statusCode).json({ error: err.message });
    }
  }

  /**
   * Delete entire subject
   * DELETE /api/attendance/subject/:userId/:subject
   */
  async deleteSubject(req, res) {
    try {
      const { userId, subject } = req.params;
      const decodedSubject = decodeURIComponent(subject);

      if (!userId || !subject) {
        return res.status(400).json({ error: "Missing userId or subject" });
      }

      const result = await attendanceService.deleteSubject(userId, decodedSubject);

      res.json({ 
        message: "Subject deleted successfully",
        ...result
      });
    } catch (err) {
      console.error("❌ Delete subject error:", err);
      const statusCode = err.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ error: err.message });
    }
  }

  /**
   * Get all attendance records for a user
   * GET /api/attendance/:userId
   */
  async getAllRecords(req, res) {
    try {
      const { userId } = req.params;

      const records = await attendanceService.getAllRecords(userId);

      res.json(records);
    } catch (err) {
      console.error("❌ Get attendance error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Get summary with attendance records
   * GET /api/attendance/:userId/summary
   */
  async getSummaryWithRecords(req, res) {
    try {
      const { userId } = req.params;

      const summary = await attendanceService.getSummaryWithRecords(userId);

      res.json(summary);
    } catch (err) {
      console.error("❌ Get summary error:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new AttendanceController();