const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
//exam Schema
const examSchema = new mongoose.Schema({
  teacherID: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' }, // Reference to the teacher
  studentIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Auth' }], // Reference to the students
  examTitle: String,
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  startTime: Date,
  endTime: Date,
  markPerQuestion: Number,
  totalMarks: Number,
  createdAt: { type: Date, default: Date.now }
});

const Exam = mongoose.model('Exam', examSchema);


router.post("/api/exams", async (req, res) => {
  try {
    const { teacherID, examTitle, questionIds, startTime, endTime, markPerQuestion } = req.body;
    if (!teacherID || !studentIDs || !examTitle || !questionIds || questionIds.length === 0 || !startTime || !endTime || !markPerQuestion) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const totalMarks = questionIds.length * markPerQuestion;
    const newExam = new Exam({ teacherID, studentIDs, examTitle, questionIds, startTime, endTime, markPerQuestion, totalMarks });
    await newExam.save();
    res.status(201).json({ message: "Exam created successfully", exam: newExam });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating exam" });
  }
});

module.exports = { router, Exam };