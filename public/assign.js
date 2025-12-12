async function loadStudents() {
  try {
    const res = await fetch('http://localhost:3000/assignments/api/students');
    if(!res.ok) throw new Error("Students API not responding");
    const students = await res.json();

    const studentSelect = document.getElementById('students');
    studentSelect.innerHTML = '';

    students.forEach(s => {
      const option = document.createElement('option');
      option.value = s._id;
      option.text = `${s.name} (${s.email})`;
      studentSelect.appendChild(option);
    });

  } catch (err) {
    console.error("Error loading students:", err);
    alert("Failed to load students");
  }
}

async function loadQuestions() {
  try {
    const teacherId = localStorage.getItem("teacherId");
    const res = await fetch(`http://localhost:3000/api/questions/${teacherId}`);
    if(!res.ok) throw new Error("Questions API not responding");
    const questions = await res.json();

    const questionSelect = document.getElementById('questions');
    questionSelect.innerHTML = '';

    questions.forEach(q => {
      const option = document.createElement('option');
      option.value = q._id;
      option.text = q.questionText;
      questionSelect.appendChild(option);
    });

  } catch (err) {
    console.error("Error loading questions:", err);
    alert("Failed to load questions");
  }
}


async function assignQuestions() {
  const teacherId = localStorage.getItem("teacherId"); // login থেকে save করা ID
  const studentSelect = document.getElementById('students');
  const questionSelect = document.getElementById('questions');

  const studentIds = Array.from(studentSelect.selectedOptions).map(o => o.value);
  const questionIds = Array.from(questionSelect.selectedOptions).map(o => o.value);

  if(studentIds.length === 0 || questionIds.length === 0){
    alert("Select at least one student and one question");
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/assignments/api/assigned-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId, studentIds, questionIds })
    });
    
    const data = await res.json();
    if(res.ok) alert(data.message);
    else alert(data.error);
  } catch (err) {
    console.error("Error assigning questions:", err);
    alert("Failed to assign questions");
  }
}

// পেজ লোড হলে auto-run
loadStudents();
loadQuestions();