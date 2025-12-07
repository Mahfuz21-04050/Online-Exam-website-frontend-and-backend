const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors"); // CORS package যোগ করুন

// Database connection
mongoose.connect("mongodb://localhost:27017/online_exam_database")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log(err));

const questionSchema = new mongoose.Schema({
    questionText: String,
    options: [String],
    correctAnswer: String,
    createdAt: { type: Date, default: Date.now }
});

const Question1 = mongoose.model("Question", questionSchema);

// CORS middleware যোগ করুন
app.use(cors()); // সব রিকোয়েস্টের জন্য CORS allow করবে

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API route to post questions
app.post("/api/questions", async (req, res) => {
    try {
        console.log("📥 Received question data:", req.body);
        
        const { questionText, options, correctAnswer } = req.body;
        
        // Validation
        if (!questionText || !options || options.length !== 4 || !correctAnswer) {
            return res.status(400).json({ 
                error: "Missing required fields or invalid data" 
            });
        }
        
        const newQuestion = new Question1({ 
            questionText, 
            options, 
            correctAnswer 
        });
        
        await newQuestion.save();
        
        console.log("✅ Question saved to MongoDB:", newQuestion._id);
        
        res.status(201).json({ 
            message: "Question saved successfully",
            question: newQuestion
        });
    } catch (error) {
        console.error("❌ Error saving question:", error);
        res.status(500).json({ 
            error: "Failed to save question",
            details: error.message 
        });
    }
});

// API route to get all questions
app.get("/api/questions", async (req, res) => {
    try {
        const questions = await Question1.find().sort({ createdAt: -1 });
        console.log(`📤 Sending ${questions.length} questions to client`);
        res.json(questions);
    } catch (error) {
        console.error("❌ Error fetching questions:", error);
        res.status(500).json({ error: "Failed to fetch questions" });
    }
});

// API route to delete a question
app.delete("/api/questions/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Question1.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({ error: "Question not found" });
        }
        
        console.log(`🗑️ Deleted question: ${id}`);
        res.json({ message: "Question deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting question:", error);
        res.status(500).json({ error: "Failed to delete question" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log("🚀 Server is running on http://localhost:3000");
});