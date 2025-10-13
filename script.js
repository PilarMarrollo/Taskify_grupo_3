// Utils
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// NAVIGATION
const navHome = document.getElementById("nav-home");
const navTasks = document.getElementById("nav-tasks");
const navProfile = document.getElementById("nav-profile");
const homeSection = document.getElementById("home-section");
const tasksSection = document.getElementById("tasks-section");
const profileSection = document.getElementById("profile-section");
const fab = document.getElementById("add-task-btn");
const addTaskForm = document.getElementById("add-task-form");
const newTaskInput = document.getElementById("new-task-input");
const taskList = document.getElementById("task-list");

function navigate(section) {
  // Hide all
  homeSection.style.display = "none";
  tasksSection.style.display = "none";
  profileSection.style.display = "none";
  fab.style.display = "none";
  navHome.classList.remove("active");
  navTasks.classList.remove("active");
  navProfile.classList.remove("active");

  // Show selected
  if (section === "home") {
    homeSection.style.display = "block";
    navHome.classList.add("active");
  } else if (section === "tasks") {
    tasksSection.style.display = "block";
    fab.style.display = "flex";
    navTasks.classList.add("active");
    renderTasks();
  } else if (section === "profile") {
    profileSection.style.display = "flex";
    navProfile.classList.add("active");
  }
}

// NAV actions
navHome.onclick = () => navigate("home");
navTasks.onclick = () => navigate("tasks");
navProfile.onclick = () => navigate("profile");
fab.onclick = () => {
  navigate("tasks");
  newTaskInput.focus();
};

// FECHA HOY en header
document.addEventListener("DOMContentLoaded", () => {
  const d = new Date();
  const dateEl = document.getElementById("today-date");
  if (dateEl) {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    dateEl.textContent = `${days[d.getDay()]} ${d.getDate()} ${
      months[d.getMonth()]
    }.`;
  }
  navigate("home");
});

// TAREAS
function renderTasks() {
  const tasks = getTasks();
  taskList.innerHTML = "";
  if (!tasks.length) {
    const li = document.createElement("li");
    li.textContent = "No hay tareas aún. ¡Agregá tu primera!";
    li.style.textAlign = "center";
    li.style.color = "#bbb";
    li.style.padding = "1.2em 0";
    li.style.fontWeight = "500";
    taskList.appendChild(li);
    return;
  }
  tasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");
    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Marcar completada");
    checkbox.onclick = () => toggleTask(i);
    // Title
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    // Actions
    const actions = document.createElement("div");
    actions.className = "task-actions";
    const delBtn = document.createElement("button");
    delBtn.className = "action-btn delete";
    delBtn.title = "Eliminar";
    delBtn.innerHTML = `<i class="ph ph-trash"></i>`;
    delBtn.onclick = () => deleteTask(i);

    actions.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(title);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

function toggleTask(i) {
  const tasks = getTasks();
  tasks[i].completed = !tasks[i].completed;
  saveTasks(tasks);
  renderTasks();
}
function deleteTask(i) {
  if (!confirm("¿Eliminar esta tarea?")) return;
  const tasks = getTasks();
  tasks.splice(i, 1);
  saveTasks(tasks);
  renderTasks();
}

// ADD TASK (form y FAB)
if (addTaskForm) {
  addTaskForm.onsubmit = function (e) {
    e.preventDefault();
    const val = newTaskInput.value.trim();
    if (!val) return;
    const tasks = getTasks();
    tasks.unshift({ title: val, completed: false });
    saveTasks(tasks);
    newTaskInput.value = "";
    renderTasks();
  };
}
