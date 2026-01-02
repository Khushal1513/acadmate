// routes/attendance.js
const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

/**
 * Attendance Routes
 * All routes are prefixed with /api/attendance
 */

// Subject Management
router.post("/subject/add", attendanceController.addSubject.bind(attendanceController));
router.delete("/subject/:userId/:subject", attendanceController.deleteSubject.bind(attendanceController));

// Attendance Operations
router.post("/mark", attendanceController.markAttendance.bind(attendanceController));
router.delete("/record/:userId/:subject/:date", attendanceController.resetAttendanceForDate.bind(attendanceController));

// Data Retrieval
router.get("/:userId/summary", attendanceController.getSummaryWithRecords.bind(attendanceController));
router.get("/:userId", attendanceController.getAllRecords.bind(attendanceController));

module.exports = router;
