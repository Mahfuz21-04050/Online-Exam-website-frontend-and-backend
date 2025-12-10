const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//Assigned Questions Schema

const AssignedSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  createdAt: { type: Date, default: Date.now }
});
const AssignedQuestion = mongoose.model('AssignedQuestion', AssignedSchema);

module.exports = router;