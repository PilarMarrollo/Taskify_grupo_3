// ===== Helpers =====
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===== State =====
let currentFilter = "all"; // 'all' | 'pending' | 'completed'
let editingTaskId = null;

// ===== DOM Elements =====
const screens = {
  welcome: document.getElementById("welcome-screen"),
  todo: document.getElementById("todo-screen"),
  form: document.getElementById("task-form-screen"),
};
const startBtn = document.getElementById("start-btn");
const addTaskBtn = document.getElementById("add-task-btn");
const closeFormBtn = document.getElementById("close-form-btn");
const filtersDiv = document.getElementById("filters");
const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const formTitle = document.getElementById("form-title");
const saveTaskBtn = document.getElementById("save-task-btn");
const formMsg = document.getElementById("form-msg");
const goWelcomeBtn = document.getElementById("go-welcome");

// ===== Navegación =====
function showScreen(screenName) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[screenName].classList.add("active");
}

// Ir a bienvenida desde tareas
if (goWelcomeBtn) {
  goWelcomeBtn.onclick = () => showScreen("welcome");
}
startBtn.onclick = () => showScreen("todo");
addTaskBtn.onclick = () => openTaskForm();
closeFormBtn.onclick = () => {
  showScreen("todo");
  formMsg.textContent = "";
  taskForm.reset();
};

// ===== Filtros =====
filtersDiv.addEventListener("click", (e) => {
  if (e.target.classList.contains("filter-btn")) {
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");
    currentFilter = e.target.dataset.filter;
    renderTasks();
  }
});

// ===== Mostrar tareas =====
function renderTasks() {
  const tasks = getTasks();
  taskList.innerHTML = "";

  let filtered = tasks;
  if (currentFilter === "pending") {
    filtered = tasks.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    filtered = tasks.filter((t) => t.completed);
  }

  if (filtered.length === 0) {
    const info = document.createElement("li");
    info.textContent = "No hay tareas.";
    info.style.textAlign = "center";
    info.style.color = "#aaa";
    info.style.padding = "1.2em 0";
    taskList.appendChild(info);
    return;
  }

  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Marcar completada");
    checkbox.onclick = () => toggleCompleteTask(task.id);

    // Title
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    // Desc
    const desc = document.createElement("span");
    desc.className = "task-desc";
    desc.textContent = task.desc;

    // Actions
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "action-btn edit";
    editBtn.textContent = "Editar";
    editBtn.onclick = () => openTaskForm(task);

    const delBtn = document.createElement("button");
    delBtn.className = "action-btn delete";
    delBtn.textContent = "Eliminar";
    delBtn.onclick = () => deleteTask(task.id);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(title);
    if (task.desc) li.appendChild(desc);
    li.appendChild(actions);

    taskList.appendChild(li);
  });
}

// ===== Acciones de tareas =====
function openTaskForm(task = null) {
  taskForm.reset();
  formMsg.textContent = "";
  editingTaskId = null;
  if (task) {
    formTitle.textContent = "Editar Tarea";
    document.getElementById("task-id").value = task.id;
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-desc").value = task.desc;
    editingTaskId = task.id;
  } else {
    formTitle.textContent = "Agregar Tarea";
  }
  showScreen("form");
}

function toggleCompleteTask(taskId) {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    tasks[idx].completed = !tasks[idx].completed;
    saveTasks(tasks);
    renderTasks();
  }
}

function deleteTask(taskId) {
  if (!confirm("¿Eliminar la tarea?")) return;
  const tasks = getTasks().filter((t) => t.id !== taskId);
  saveTasks(tasks);
  renderTasks();
}

// ===== Guardar tarea =====
taskForm.onsubmit = function (e) {
  e.preventDefault();
  formMsg.textContent = "";
  const id = document.getElementById("task-id").value;
  const title = document.getElementById("task-title").value.trim();
  const desc = document.getElementById("task-desc").value.trim();

  if (!title) {
    formMsg.textContent = "¡El título es obligatorio!";
    document.getElementById("task-title").focus();
    return;
  }

  let tasks = getTasks();

  if (editingTaskId) {
    // Editar
    tasks = tasks.map((t) =>
      t.id === editingTaskId ? { ...t, title, desc } : t
    );
  } else {
    // Agregar
    const newTask = {
      id: Date.now().toString(),
      title,
      desc,
      completed: false,
    };
    tasks.unshift(newTask);
  }

  saveTasks(tasks);
  showScreen("todo");
  renderTasks();
  taskForm.reset();
  formMsg.textContent = "";
  editingTaskId = null;
};

// ===== Inicializar =====
document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
});
