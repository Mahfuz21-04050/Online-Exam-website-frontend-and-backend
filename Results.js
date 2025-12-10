const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//Result Schema

const resultSchema = new mongoose.Schema({
    studentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' }, // Reference to the student
  examID: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }, // Reference to the exam
  totalQuestions: Number,
  correct: Number,
  wrong: Number,
  percentage: Number,
  generatedAt: { type: Date, default: Date.now }
});

const Result = mongoose.model('Result', resultSchema);

module.exports = router;