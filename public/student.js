
let quizQuestions1 = [];
let studentAnswers = {}; // { questionIndex: optionIndex }
let currentQuestionIndex = 0;
let activeExams = [];
let pastExams = [];
let studentResults = [];
let attemptedExamIds = [];





  


       
       

        // Initialize student dashboard
    
 async function initStudentDashboard() {
  await loadStudentExams();   // ✅ MUST
  await fetchResult();
   renderStudentResults();
   localStorage.setItem("absence",attemptedExamIds.length) ;

   

}


//Exam Load (replace hardcoded activeExams)


async function loadStudentExams() {
  

  const studentId = localStorage.getItem("userId");

  const res = await fetch(
    `http://localhost:3000/assignments/api/exams/student/${studentId}`
  );

  const examdata = await res.json();
  console.log("examdatalength", attemptedExamIds);
  let abslen = localStorage.getItem("absence");
  document.getElementById("absentExamsCount").textContent = examdata.length - abslen;

 
  examdata.forEach(exam => {
    if (exam.status === "active") {
      activeExams.push(exam);
    } else {
      pastExams.push(exam);
    }
  });

  // ✅ render once
  renderActiveExams();
  renderPastExams();
}





// Load question from database for students
  const examID = localStorage.getItem("currentExamId")      
    async function loadAssignedQuestions(examId) {
      const studentId = localStorage.getItem("userId");
      

  const res = await fetch(
    `http://localhost:3000/assignments/api/exam/${examId}/student/${studentId}`
  );

  const questionsData = await res.json();

  quizQuestions1 = questionsData.map(q => ({
    _id: q._id,
    question: q.questionText,
    choices: q.options,
    correct: q.correctAnswer.charCodeAt(0) - 65
  }));

  currentQuestionIndex = 0;
  studentAnswers = {};

  initQuestionsNavigation();
  loadQuestion(0);
}

//fetch student result

async function fetchResult() {
  try {
    const studentId = localStorage.getItem("userId");

    const resResult = await fetch(
      `http://localhost:3000/results/api/studentsResult/${studentId}`
    );
 

    const resultData = await resResult.json();

    studentResults = resultData.data || [];
    
   

    
    attemptedExamIds = [...new Set(studentResults.map(r => r.examID))];
   localStorage.setItem("attendID", JSON.stringify(attemptedExamIds));
    
    
    document.getElementById("averageScore").textContent = `${resultData.averagePercentage} %`;
    document.getElementById("completedExamsCount").textContent = attemptedExamIds.length;
    

  } catch (err) {
    console.error("Failed to fetch results", err);
  }
}


 





        // Render active exams
function renderActiveExams() {
          
  
            const container = document.getElementById('activeExamsList');
            if (!container) return;



  document.getElementById("activeExamsCount").textContent =
    activeExams.length;

  if (activeExams.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h3>No Active Exams</h3>
        <p>You don't have any active exams at the moment.</p>
      </div>
    `;
    return;
  }

            let html = '';
         activeExams.forEach(exam => {
              
            const endTime = new Date(exam.endTime);
            let statusClass = 'status-active';
        
 
                html += `
                    <div class="exam-card active" onclick="startExam('${exam.examId}',${exam.markPerQuestion},${exam.examTime},'${exam.startTime}','${exam.teacherID}','${exam.examTitle}')">
                        <div class="exam-title">${exam.examTitle}</div>
                        <div class="exam-meta">
                            <span><i class="fas fa-question-circle"></i> ${exam.questionCount} Questions</span>
                            <span><i class="fas fa-star"></i> ${exam.totalMarks} Marks</span>
                            <span><i class="fas fa-clock"></i> ${exam.examTime}</span>
                        </div>
                        <div class="exam-status ${statusClass}">${exam.status}</div>
                        <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
                            <i class="fas fa-calendar-alt"></i> Available until: ${formatDate(endTime)}
                        </div>
                        <button class="btn btn-primary" style="margin-top: 15px; width: 100%;">
                            <i class="fas fa-play-circle"></i> Start Exam
                        </button>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        // Render past exams
async function renderPastExams() {
  const container = document.getElementById('pastExamsList');
  if (!container) return;

  if (pastExams.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-history"></i>
        <h3>No Past Exams</h3>
        <p>You haven't completed any exams yet.</p>
      </div>
    `;
    return;
  }

  let html = '';
  
const AttendId =
  JSON.parse(localStorage.getItem("attendID"))||[];

console.log("attemptedExamIds:", AttendId);
  for (const exam of pastExams) {

    // ✅ ATTENDED
    if (AttendId.includes(exam.examId)) {

      const res = await fetch(
        `http://localhost:3000/results/api/studentsResultbyExamID/${exam.examId}`
      );
      const attendExresult = await res.json();

      attendExresult.forEach(result => {
        html += `
          <div class="exam-card completed" onclick="viewExamResult('${result.examID}')">
            <div class="exam-title">${result.examTitle}</div>

            <div class="exam-meta">
              <span><i class="fas fa-question-circle"></i> ${result.totalQuestions} Questions</span>
              <span><i class="fas fa-star"></i> ${result.score}/${result.totalMarks} Marks</span>
              <span><i class="fas fa-percentage"></i> ${result.percentage}%</span>
            </div>

            <div class="exam-status status-completed">Completed</div>

            <div style="margin-top:10px; font-size:0.9rem; color:#666;">
              <i class="fas fa-calendar-check"></i>
              Completed on: ${formatDate(new Date(result.date))}
            </div>

            <button class="btn btn-success" style="margin-top:15px; width:100%;">
              <i class="fas fa-chart-bar"></i> View Results
            </button>
          </div>
        `;
      });
    }

    // ❌ ABSENT
    else {
      html += `
        <div class="exam-card completed" style="border-left:5px solid #dc3545;">
          <div class="exam-title">${exam.examTitle}</div>

          <div class="exam-meta">
            <span><i class="fas fa-question-circle"></i> ${exam.questionCount} Questions</span>
            <span><i class="fas fa-star"></i> ${exam.totalMarks} Marks</span>
          </div>

          <div class="exam-status status-absent">Absent</div>

          <div style="margin-top:10px; font-size:0.9rem; color:#dc3545;">
            <i class="fas fa-times-circle"></i>
            You did not attend this exam
          </div>

          <button class="btn btn-secondary" disabled style="margin-top:15px; width:100%;">
            Absent
          </button>
        </div>
      `;
    }
  }

  container.innerHTML = html;
}

 




        // Render student results
        function renderStudentResults() {
            const container = document.getElementById('detailedResultsList');
            if (!container) return;

            if (studentResults.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-chart-bar"></i>
                        <h3>No Results Available</h3>
                        <p>Complete some exams to see your results here.</p>
                    </div>
                `;
                return;
            }

            let html = '<div style="display: grid; gap: 20px;">';

            studentResults.forEach(result => {
                html += `
                    <div class="result-card" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 5px solid #4361ee;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="color: #212529;">${result.examTitle}</h3>
                            <span class="exam-status ${result.percentage >= 80 ? 'status-active' : 'status-completed'}" 
                                  style="background: ${result.percentage >= 80 ? '#d4edda' : '#e2e3e5'}; 
                                         color: ${result.percentage >= 80 ? '#155724' : '#383d41'}">
                                ${result.percentage}%
                            </span>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
                            <div>
                                <div style="font-size: 0.9rem; color: #666;">Score</div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: #4361ee;">
                                    ${result.score}/${result.totalMarks}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 0.9rem; color: #666;">Time Taken</div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: #4361ee;">
                                    ${formatTime(result.timeTaken)}
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 20px; margin-top: 10px;">
                            <div style="text-align: center;">
                                <div style="font-size: 1.2rem; font-weight: bold; color: #28a745;">${result.correctAnswers}</div>
                                <div style="font-size: 0.8rem; color: #666;">Correct</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.2rem; font-weight: bold; color: #f72585;">${result.wrongAnswers}</div>
                                <div style="font-size: 0.8rem; color: #666;">Wrong</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.2rem; font-weight: bold; color: #4525f7ff;">${result.skippedQuestion}</div>
                                <div style="font-size: 0.8rem; color: #666;">SKip</div>
                            </div>
                            
                        </div>
                        
                        <button class="btn btn-primary" onclick="viewDetailedResult('${result.examId}')" 
                                style="margin-top: 15px; width: 100%;">
                            <i class="fas fa-search"></i> View Detailed Analysis
                        </button>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;
        }

        // Switch tabs
        function switchTab(tabName) {
            // Hide all sections
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.classList.add('hidden');
            });

            // Deactivate all tabs
            document.querySelectorAll('.tab-btn').forEach(tab => {
                tab.classList.remove('active');
            });

            // Show selected section
            document.getElementById(tabName + 'Section').classList.remove('hidden');

            // Activate selected tab
            document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1))
                .classList.add('active');
        }

        // Start an exam

function startExam(examId, mpq, duration, startTime, teacherID, examTitle)
{    

          let now = new Date();
          localStorage.setItem("currentExamId", examId);
          localStorage.setItem("markPerquestion", mpq);
          localStorage.setItem("duration", duration);
          localStorage.setItem("startTime", startTime);
          localStorage.setItem("teacherID", teacherID);
          localStorage.setItem("examTitle", examTitle);
   const now1 = new Date();
  const examStartTime = new Date(startTime);

  // ❌ exam not started yet
  if (now1 < examStartTime) {
    const diffMs = examStartTime - now;
    const diffMin = Math.ceil(diffMs / 60000);

    alert(`Exam will start in ${diffMin} minute(s). Please wait.`);
    return;
  }
  
  else if (attemptedExamIds.includes(examId)) {
    alert("You have already attempted this exam.");
    return;
  }
  else {
    document.getElementById('studentDashboard').classList.add('hidden');
    document.getElementById('examContainer').classList.remove('hidden');
         
    loadAssignedQuestions(examId);
    // ✅ exam wise
    remainingTime(duration);
  }
}


        // Initialize questions navigation
        function initQuestionsNavigation() {
            const container = document.getElementById('questionsNav');
          const questionsCount = quizQuestions1.length; // For demo
          document.getElementById("questionMarks").textContent =(localStorage.getItem("markPerquestion")) + "Mark";
          document.getElementById("examQuestionsCount").textContent = `${questionsCount} Questions`;
          document.getElementById("examTotalMarks").textContent = "Total: " + questionsCount * localStorage.getItem("markPerquestion") + " marks";
          document.getElementById("examTimeRemaining").textContent ="Time : " + localStorage.getItem("duration");

            let html = '';
            for (let i = 0; i < questionsCount; i++) {
                html += `
                    <button class="question-nav-btn" onclick="loadQuestion(${i})" id="navBtn${i}">
                        ${i + 1}
                    </button>
                `;
            }

            container.innerHTML = html;
            updateQuestionNavigation(0);
        }

        // Update question navigation
        function updateQuestionNavigation(currentIndex) {
            const allButtons = document.querySelectorAll('.question-nav-btn');
            allButtons.forEach(btn => btn.classList.remove('current'));

            const currentButton = document.getElementById(`navBtn${currentIndex}`);
            if (currentButton) {
                currentButton.classList.add('current');
            }
        }

        // Load question
        function loadQuestion(index) {
            // For demo, just update the UI
            document.getElementById('questionNumberDisplay').textContent = `Question ${index + 1}`;
            document.getElementById('currentQuestionNumber').textContent = `Question ${index + 1}`;
            document.getElementById('examProgressText').textContent = `${index + 1}/${quizQuestions1.length}`;

            // Update progress bar
            const progress = ((index + 1) / quizQuestions1.length) * 100;
            document.getElementById('examProgressFill').style.width = `${progress}%`;

            // Update question text 
         
            const questions = quizQuestions1.map(q => q.question);

            document.getElementById('questionTextDisplay').textContent = questions[index] || "Question not available";

            // Update options 
            const options = quizQuestions1.map(q => q.choices);

            if (options[index]) {
                document.getElementById('optionA').textContent = options[index][0] || "Option A";
                document.getElementById('optionB').textContent = options[index][1] || "Option B";
                document.getElementById('optionC').textContent = options[index][2] || "Option C";
                document.getElementById('optionD').textContent = options[index][3] || "Option D";
            }

          updateQuestionNavigation(index);
           updateMCQUI();
        }
// updateMCQUI
function updateMCQUI() {
  const container = document.getElementById('mcqOptions');
  const optionRows = container.querySelectorAll('.option-row');
  const status = document.getElementById('answerStatus');

  // reset all selections
  optionRows.forEach(row => row.classList.remove('selected'));

  const savedAnswer = studentAnswers[currentQuestionIndex];

  if (savedAnswer !== undefined) {
    // restore selected option
    optionRows[savedAnswer]?.classList.add('selected');
    status.textContent = 'Answered';
    status.className = 'answer-status answered';
  } else {
    // no answer given
    status.textContent = 'Not answered';
    status.className = 'answer-status';
  }
}

// Select MCQ option
function selectMCQOption(optionIndex) {
  studentAnswers[currentQuestionIndex] = optionIndex;
  updateMCQUI();
}




        // Navigation functions
      

function previousQuestionExam() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion(currentQuestionIndex);
    updateMCQUI();
  }
}

function nextQuestionExam() {
  if (currentQuestionIndex < quizQuestions1.length - 1) {
    currentQuestionIndex++;
    loadQuestion(currentQuestionIndex);
    updateMCQUI();
  }
}


        
        function confirmSubmitExam() {
            if (confirm('Are you sure you want to submit the exam? You cannot change answers after submission.')) {
                submitExam();
            }
        }

        // Submit exam
function submitExam() {
   displayQuestionAnalysis();
  const endexamTime = localStorage.getItem("endexamTime");
  const duration = Number(localStorage.getItem("duration")); // minutes
  const now = new Date().getTime();

  const totalDuration = duration * 60; // in seconds
  const remainingSeconds = Math.ceil((endexamTime - now) / 1000);
  const timeTaken = totalDuration - remainingSeconds; // seconds

  localStorage.setItem("timeTaken", timeTaken);

  showExamResults();

  // send result to backend
  sendResultToDB(timeTaken);
}

        // Show exam results
        function showExamResults() {
            document.getElementById('examContainer').classList.add('hidden');
            document.getElementById('resultsContainer').classList.remove('hidden');

            // Display sample question analysis
            displayQuestionAnalysis();
        }

        // Display question analysis
function displayQuestionAnalysis() {
  const markPerQuestion = Number(localStorage.getItem("markPerquestion"));
  
  

  let totalMarks = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalSkipped = 0;

  const container = document.getElementById('questionAnalysis');
  let html = '';

  quizQuestions1.forEach((q, i) => {
    const studentAnswer = studentAnswers[i];
    const isCorrect = studentAnswer === q.correct;

    let obtainedMark = 0;

    if (studentAnswer === undefined) {
      totalSkipped++;
    } else if (isCorrect) {
      obtainedMark = markPerQuestion;
      totalCorrect++;
    } else {
      totalWrong++;
    }

    totalMarks += obtainedMark;

    html += `
      <div class="question-analysis-item ${isCorrect ? 'correct' : studentAnswer === undefined ? '' : 'incorrect'}">
        <div style="display:flex; justify-content:space-between;">
          <strong>Question ${i + 1}</strong>
          <span class="marks-badge">${obtainedMark} / ${markPerQuestion} mark</span>
        </div>
        <div style="margin-top:10px;">
          <div><strong>Your Answer:</strong> ${
            studentAnswer !== undefined
              ? 'Option ' + String.fromCharCode(65 + studentAnswer)
              : 'Not Answered'
          }</div>
          <div><strong>Correct Answer:</strong> Option ${String.fromCharCode(65 + q.correct)}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  const totalPossibleMarks = quizQuestions1.length * markPerQuestion;
  const percentage =
    totalPossibleMarks > 0 ? ((totalMarks / totalPossibleMarks) * 100).toFixed(2) : 0;

  document.getElementById('scoreDetails').textContent =
    `${totalMarks} / ${totalPossibleMarks}`;
  document.getElementById("finalScoreDisplay").textContent = `${percentage}%`;
  document.getElementById("correctAnswers").textContent = totalCorrect;
  document.getElementById("wrongAnswers").textContent = totalWrong;
  document.getElementById("skipedAnswer").textContent = totalSkipped;

  // Save all result in localStorage
  localStorage.setItem("totalMarks", totalMarks);
  localStorage.setItem("totalCorrect", totalCorrect);
  localStorage.setItem("totalWrong", totalWrong);
  localStorage.setItem("totalSkipped", totalSkipped);
  localStorage.setItem("percentage", percentage);
}

//send result to database

async function sendResultToDB(timeTaken) {
  const stId = localStorage.getItem("userId");
  const teacherID = localStorage.getItem("teacherID");
  const examID = localStorage.getItem("currentExamId");
  const examTitle = localStorage.getItem("examTitle");

  const totalCorrect = Number(localStorage.getItem("totalCorrect"));
  const totalWrong = Number(localStorage.getItem("totalWrong"));
  const totalMarks = Number(localStorage.getItem("totalMarks"));
  const percentage = Number(localStorage.getItem("percentage"));
  const totalSkipped = Number(localStorage.getItem("totalSkipped"));
  const markPerQuestion = Number(localStorage.getItem("markPerquestion"));

const stuResult = {
  studentID: stId,
  teacherID: teacherID,
  examID: examID,
  examTitle: examTitle,
  totalQuestions: quizQuestions1.length,
  score: totalMarks,
  totalMarks: markPerQuestion * quizQuestions1.length,
  percentage: percentage,
  correctAnswers: totalCorrect,
  skippedQuestion:totalSkipped,
  wrongAnswers: totalWrong,
  timeTaken: timeTaken,
  date: new Date()
};

  console.log("result", JSON.stringify(stuResult));
  
    const res = await fetch("http://localhost:3000/results/api/studentresult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stuResult)
    });
  }


//exam dynamic timing

function remainingTime(duration) {
  // exam start time = এখনকার সময়
  const start = new Date().getTime(); // timestamp in ms
  const Duration = duration * 60 * 1000; // convert minutes to ms

  const endexamTime = start + Duration;
  localStorage.setItem("endexamTime", endexamTime);

  const timerElement = document.getElementById("examTimeRemaining");

  const interval = setInterval(() => {
    const now = new Date().getTime();
    const remaining = endexamTime - now;

    if (remaining <= 0) {
      clearInterval(interval);
      timerElement.textContent = "00:00";
      submitExam(); // auto submit when time ends
      return;
    }

    const minutes = Math.floor((remaining / 1000) / 60);
    const seconds = Math.floor((remaining / 1000) % 60);

    timerElement.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, 1000);
}





        // View results directly
        function viewResultsNow() {
            document.getElementById('autoSubmitModal').classList.add('hidden');
            showExamResults();
        }

        // Flag question for review
        function flagQuestion() {
            const currentButton = document.getElementById(`navBtn${currentQuestionIndex}`);
            if (currentButton) {
                currentButton.classList.toggle('flagged');
            }
        }

        // Review flagged questions
        function reviewFlagged() {
            const flaggedButtons = document.querySelectorAll('.question-nav-btn.flagged');
            if (flaggedButtons.length > 0) {
                const firstFlagged = flaggedButtons[0];
                const index = parseInt(firstFlagged.textContent) - 1;
                currentQuestionIndex = index;
                loadQuestion(index);
            }
        }

        // Save and continue
        function saveAndContinue() {
            nextQuestionExam();
        }

        // Back to dashboard
        function backToDashboard() {
            document.getElementById('examContainer').classList.add('hidden');
            document.getElementById('resultsContainer').classList.add('hidden');
            document.getElementById('studentDashboard').classList.remove('hidden');
        }

        // View exam result
        function viewExamResult(examId) {
            alert(`Viewing result for exam: ${examId}\nIn a real application, this would show detailed results.`);
        }

        // View detailed result
        function viewDetailedResult(examId) {
            alert(`Viewing detailed analysis for exam: ${examId}`);
        }

        // Download result
        function downloadResult() {
            alert('Downloading result as PDF...');
        }

// Retake exam
        const examid = localStorage.getItem("currentExamId");
        function retakeExam(examid) {
            if (confirm('Do you want to retake this exam? Previous results will be saved.')) {
                startExam(examid);
            }
        }

        // Show landing page
        function showLandingPage() {
            alert('This would go back to the landing page in a real application.');
        }

        // Utility functions
        function formatDate(date) {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
          
  

}

        function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
}
        

// function viewDetailedResult(examId) {
//             alert(`Viewing detailed analysis for exam: ${examId}`);
//         } 

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function () {
          initStudentDashboard();
          //student name display

          let studentName = localStorage.getItem('userName');
          document.getElementById('studentName').textContent = studentName;
            // Initialize first question
            loadQuestion(0);
        });
    