const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");

// Database connection
mongoose.connect("mongodb://localhost:27017/online_exam_database")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log(err));



// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

//home page route

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


//Student Registration and Login page
app.get("/studentsLogReg", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "authentication.html"));
    
});

// here we will import different routes
// user routes
 const authenticationRouter = require('./authentication');
app.use('/authentication', authenticationRouter);

// question routes
const questionRouter = require('./question');
app.use('/', questionRouter);

// result routes
const resultRouter = require('./Results');
app.use('/results', resultRouter);

// submission routes
const submissionRouter = require('./Submissions');
app.use('/submissions', submissionRouter);

// assignments routes
const assignmentRouter = require('./AssignedQuestions');
app.use('/assignments', assignmentRouter);







// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
