const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");

// Database connection
mongoose.connect("mongodb://localhost:27017/online_exam_database")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log(err));

// Question schema
const questionSchema = new mongoose.Schema({
    questionText: String,
    options: [String],
    correctAnswer: String,
    createdAt: { type: Date, default: Date.now }
});

const Question = mongoose.model("Question", questionSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Student routes
const studentsLogRegRouter = require('./studentsLogReg');
app.use('/students', studentsLogRegRouter);

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

//Student Registration and Login page
app.get("/studentsLogReg", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "studentsLogReg.html"));
    
});

// Create question
app.post("/api/questions", async (req, res) => {
    try {
        const { questionText, options, correctAnswer } = req.body;

        if (!questionText || !options || options.length !== 4 || !correctAnswer) {
            return res.status(400).json({ error: "Invalid data" });
        }

        const newQuestion = new Question({ questionText, options, correctAnswer });
        await newQuestion.save();

        res.status(201).json({ message: "Question saved", question: newQuestion });
    } catch (err) {
        res.status(500).json({ error: "Error saving question" });
    }
});

// Get all questions
app.get("/api/questions", async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: "Error fetching questions" });
    }
});

// Delete question
app.delete("/api/questions/:id", async (req, res) => {
    try {
        const result = await Question.findByIdAndDelete(req.params.id);

        if (!result) return res.status(404).json({ error: "Not found" });

        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting question" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
