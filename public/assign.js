async function loadStudents() {
  try {
    const res = await fetch('http://localhost:3000/assignments/api/students');
    if (!res.ok) throw new Error("Students API not responding");
    const students = await res.json();

    const studentList = document.getElementById('studentsList');
    studentList.innerHTML = "";

    students.forEach(s => {
      const div = document.createElement('div');
      div.className = "flex items-center gap-2 bg-gray-50 p-2 rounded-lg shadow-sm";

      div.innerHTML = `
        <input type="checkbox" class="student-checkbox w-4 h-4" value="${s._id}">
        <label class="text-gray-800">${s.name} (${s.email})</label>
      `;

      studentList.appendChild(div);
    });

  } catch (err) {
    console.error("Error loading students:", err);
    alert("Failed to load students");
  }
}


async function loadStudents() {
  try {
    const res = await fetch('http://localhost:3000/assignments/api/students');
    if (!res.ok) throw new Error("Students API not responding");
    const students = await res.json();

    const studentList = document.getElementById('studentsList');
    studentList.innerHTML = "";

    students.forEach(s => {
      const div = document.createElement('div');
      div.className = "flex items-center gap-2 bg-gray-50 p-2 rounded-lg shadow-sm";

      div.innerHTML = `
        <input type="checkbox" class="student-checkbox w-4 h-4" value="${s._id}">
        <label class="text-gray-800">${s.name} (${s.email})</label>
      `;

      studentList.appendChild(div);
    });

  } catch (err) {
    console.error("Error loading students:", err);
    alert("Failed to load students");
  }
}




async function assignQuestions() {
  const teacherId = localStorage.getItem("teacherId");

  const studentIds = Array.from(document.querySelectorAll('.student-checkbox:checked'))
                          .map(cb => cb.value);

  const questionIds = Array.from(document.querySelectorAll('.question-checkbox:checked'))
                           .map(cb => cb.value);

  if (studentIds.length === 0 || questionIds.length === 0) {
    alert("Select at least one student and one question");
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/assignments/api/assigned-questions', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, studentIds, questionIds })
    });

    const data = await res.json();
    if (res.ok) alert(data.message);
    else alert(data.error);

  } catch (err) {
    console.error("Error assigning questions:", err);
    alert("Failed to assign questions");
  }
}
