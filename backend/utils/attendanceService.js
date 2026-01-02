// utils/attendanceService.js
const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * Attendance Service - Handles all Firestore operations for attendance
 * Located in utils folder for consistency with existing project structure
 */
class AttendanceService {
  /**
   * Add a new subject for a user
   */
  async addSubject(userId, subjectName) {
    const userDocRef = db.collection("attendance").doc(userId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      
      let subjects = {};
      
      if (userDoc.exists) {
        subjects = userDoc.data().subjects || {};
      }

      if (subjects[subjectName]) {
        throw new Error("Subject already exists");
      }

      subjects[subjectName] = {};

      transaction.set(userDocRef, { 
        subjects,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });

    return { subject: subjectName };
  }

  /**
   * Mark attendance for a subject on a specific date
   */
  async markAttendance(userId, subject, date, status) {
    const userDocRef = db.collection("attendance").doc(userId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      
      let subjects = {};
      
      if (userDoc.exists) {
        subjects = userDoc.data().subjects || {};
      }

      if (!subjects[subject]) {
        subjects[subject] = {};
      }

      if (!subjects[subject][date]) {
        subjects[subject][date] = { present: 0, absent: 0 };
      }

      if (status === "present") {
        subjects[subject][date].present += 1;
      } else if (status === "absent") {
        subjects[subject][date].absent += 1;
      }

      transaction.set(userDocRef, { 
        subjects,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });

    return { date, status };
  }

  /**
   * Reset attendance for a specific date
   */
  async resetAttendanceForDate(userId, subject, date) {
    const userDocRef = db.collection("attendance").doc(userId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      
      if (!userDoc.exists) {
        throw new Error("User document not found");
      }

      const subjects = userDoc.data().subjects || {};

      if (!subjects[subject] || !subjects[subject][date]) {
        throw new Error("No records found for this date");
      }

      delete subjects[subject][date];
      
      if (Object.keys(subjects[subject]).length === 0) {
        delete subjects[subject];
      }

      transaction.set(userDocRef, { 
        subjects,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    });
  }

  /**
   * Delete entire subject with all its attendance records
   */
  async deleteSubject(userId, subject) {
    const userDocRef = db.collection("attendance").doc(userId);

    // Check if document exists
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
      throw new Error("User document not found");
    }

    const currentSubjects = userDoc.data().subjects || {};

    if (!currentSubjects[subject]) {
      throw new Error("Subject not found");
    }

    // Delete using transaction
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(userDocRef);
      
      if (!doc.exists) {
        throw new Error("Document disappeared during transaction");
      }

      const subjects = { ...(doc.data().subjects || {}) };
      
      delete subjects[subject];
      
      transaction.set(userDocRef, { 
        subjects,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Verify deletion
    const verifyDoc = await userDocRef.get();
    const remainingSubjects = verifyDoc.data()?.subjects || {};

    if (remainingSubjects[subject]) {
      throw new Error("Deletion verification failed");
    }

    return {
      deletedSubject: subject,
      remainingSubjects: Object.keys(remainingSubjects)
    };
  }

  /**
   * Get all attendance records for a user
   */
  async getAllRecords(userId) {
    const userDoc = await db.collection("attendance").doc(userId).get();

    if (!userDoc.exists) {
      return [];
    }

    const subjects = userDoc.data().subjects || {};
    const allRecords = [];

    Object.keys(subjects).forEach(subjectName => {
      Object.keys(subjects[subjectName]).forEach(date => {
        const { present = 0, absent = 0 } = subjects[subjectName][date];

        for (let i = 0; i < present; i++) {
          allRecords.push({
            id: `${subjectName}-${date}-present-${i}`,
            subject: subjectName,
            date: date,
            status: "present",
          });
        }

        for (let i = 0; i < absent; i++) {
          allRecords.push({
            id: `${subjectName}-${date}-absent-${i}`,
            subject: subjectName,
            date: date,
            status: "absent",
          });
        }
      });
    });

    return allRecords;
  }

  /**
   * Get summary with attendance records for all subjects
   */
  async getSummaryWithRecords(userId) {
    const userDoc = await db.collection("attendance").doc(userId).get();

    if (!userDoc.exists) {
      return [];
    }

    const subjects = userDoc.data().subjects || {};
    const summary = [];

    Object.keys(subjects).forEach(subjectName => {
      let totalPresent = 0;
      let totalAbsent = 0;
      const attendance = [];

      Object.keys(subjects[subjectName]).forEach(date => {
        const { present = 0, absent = 0 } = subjects[subjectName][date];
        totalPresent += present;
        totalAbsent += absent;

        // Add individual records
        for (let i = 0; i < present; i++) {
          attendance.push({
            id: `${subjectName}-${date}-present-${i}`,
            date: date,
            status: "present",
          });
        }
        for (let i = 0; i < absent; i++) {
          attendance.push({
            id: `${subjectName}-${date}-absent-${i}`,
            date: date,
            status: "absent",
          });
        }
      });

      const total = totalPresent + totalAbsent;

      summary.push({
        subject: subjectName,
        present: totalPresent,
        absent: totalAbsent,
        total: total,
        percentage: total > 0 ? Math.round((totalPresent / total) * 100) : 0,
        attendance: attendance.sort((a, b) => new Date(b.date) - new Date(a.date)),
      });
    });

    return summary;
  }
}

module.exports = new AttendanceService();