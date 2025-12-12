// assignedQuestions.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Auth: Auth } = require('./authentication'); // User model
const { Question: Question } = require('./question'); // Question model

// AssignedQuestions Schema
const AssignedSchema = new mongoose.Schema({
 teacherID: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' }, // Reference to the teacher
   studentIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Auth' }], // Reference to the students
   examTitle: String,
   questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
   startTime: Date,
  endTime: Date,
   examTime: Number, // in minutes
   markPerQuestion: Number,
   totalMarks: Number,
   createdAt: { type: Date, default: Date.now }
 });

const AssignedQuestion = mongoose.model('AssignedQuestion', AssignedSchema);

// POST: Assign questions
router.post("/api/assigned-questions", async (req, res) => {
  try {
    const { teacherID, studentIDs, examTitle, questionIds, startTime, endTime, examTime, markPerQuestion, totalMarks } = req.body;

 if (!teacherID || !studentIDs || !examTitle || !questionIds || questionIds.length === 0 || !startTime || !endTime || !markPerQuestion || !examTime) {
      return res.status(400).json({ error: "Teacher, Students, Questions, Start Time, End Time and Exam Time are required" });
    }

    
    const newAssignment = new AssignedQuestion({
      teacherID, studentIDs, examTitle, questionIds, startTime, endTime, examTime, markPerQuestion, totalMarks
    });
    await newAssignment.save();

    res.status(201).json({ message: "Questions assigned successfully", assignment: newAssignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error assigning questions" });
  }
});

// GET: All students (for frontend selection)
router.get("/api/students", async (req, res) => {
  try {
    const students = await Auth.find({ role: "student" }, { _id: 1, name: 1, email: 1 });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching students" });
  }
});

//show all questions for students
router.get("/api/assigned-questions/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const assignments = await AssignedQuestion.find({ studentIDs: studentId }).populate("questionIds");
    const questions = assignments.flatMap(assignment => assignment.questionIds);
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching assigned questions" });
  }
});


// AssignedQuestions.js-তে এই রাউট যোগ করুন

// GET: All exams for a specific teacher
router.get("/api/assigned-questions/teacher/:teacherId", async (req, res) => {
    try {
        const { teacherId } = req.params;
        const exams = await AssignedQuestion.find({ teacherID: teacherId })
            .populate("studentIDs", "name email")
            .populate("questionIds", "questionText");
        res.json(exams);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching exams" });
    }
});


module.exports = { router, AssignedQuestion };
