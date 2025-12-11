// assignedQuestions.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Auth: Auth } = require('./authentication'); // User model
const { Question: Question } = require('./question'); // Question model

// AssignedQuestions Schema
const AssignedSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true }],
  createdAt: { type: Date, default: Date.now }
});

const AssignedQuestion = mongoose.model('AssignedQuestion', AssignedSchema);

// POST: Assign questions
router.post("/api/assigned-questions", async (req, res) => {
  try {
    const { teacherId, studentIds, questionIds } = req.body;

    if (!teacherId || !studentIds || studentIds.length === 0 || !questionIds || questionIds.length === 0) {
      return res.status(400).json({ error: "Teacher, Students and Questions are required" });
    }

    const newAssignment = new AssignedQuestion({ teacherId, studentIds, questionIds });
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
    const assignments = await AssignedQuestion.find({ studentIds: studentId }).populate("questionIds");
    const questions = assignments.flatMap(assignment => assignment.questionIds);
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching assigned questions" });
  }
});


module.exports = { router, AssignedQuestion };
