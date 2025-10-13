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
const loadingState = document.getElementById("loading-state");

// ===== Navegación =====
function showScreen(screenName) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[screenName].classList.add("active");
}

// Ir a bienvenida desde tareas
if (goWelcomeBtn) {
  goWelcomeBtn.onclick = () => showScreen("welcome");
}
startBtn.onclick = () => {
  showScreen("todo");
  renderTasks();
};
addTaskBtn.onclick = () => openTaskForm();
closeFormBtn.onclick = () => {
  showScreen("todo");
  formMsg.textContent = "";
  taskForm.reset();
  renderTasks();
};

// ===== Filtros =====
filtersDiv.addEventListener("click", (e) => {
  const btn = e.target.closest && e.target.closest(".filter-btn");
  if (!btn || btn.disabled) return;
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter;
  renderTasks();
});

// ===== Loading/readability helpers =====
function setLoading(isLoading) {
  const todoScreen = screens.todo;
  if (todoScreen) {
    todoScreen.setAttribute("aria-busy", isLoading ? "true" : "false");
  }
  if (loadingState) {
    loadingState.hidden = !isLoading;
  }
  // Disable interactive controls while loading
  [
    "#add-task-btn",
    "#go-welcome",
    ".filter-btn",
    ".action-btn",
  ].forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.tagName === "BUTTON") {
        el.disabled = isLoading;
      } else {
        el.setAttribute("aria-disabled", isLoading ? "true" : "false");
      }
    });
  });
}

// ===== Mostrar tareas =====
function renderTasks() {
  setLoading(true);
  // Allow the loading message to paint before heavy DOM work
  const MIN_LOADING_MS = 150;
  const start = performance.now();

  // Slight deferral ensures visibility of loading state even on fast devices
  setTimeout(() => {
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
      info.style.color = "#232323";
      info.style.padding = "1.2em 0";
      info.style.fontWeight = "500";
      taskList.appendChild(info);
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
      return setTimeout(() => setLoading(false), remaining);
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
      editBtn.title = "Editar";
      editBtn.innerHTML = `<i class="ph ph-pencil-simple"></i> Editar`;
      editBtn.onclick = () => openTaskForm(task);

      const delBtn = document.createElement("button");
      delBtn.className = "action-btn delete";
      delBtn.title = "Eliminar";
      delBtn.innerHTML = `<i class="ph ph-trash"></i> Eliminar`;
      delBtn.onclick = () => deleteTask(task.id);

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      li.appendChild(checkbox);
      li.appendChild(title);
      if (task.desc) li.appendChild(desc);
      li.appendChild(actions);

      taskList.appendChild(li);
    });

    const elapsed = performance.now() - start;
    const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
    setTimeout(() => setLoading(false), remaining);
  }, 0);
}

// ===== Acciones de tareas =====
function openTaskForm(task = null) {
  taskForm.reset();
  formMsg.textContent = "";
  editingTaskId = null;
  if (task) {
    formTitle.innerHTML = `<i class="ph ph-pencil-simple"></i> Editar Tarea`;
    document.getElementById("task-id").value = task.id;
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-desc").value = task.desc;
    editingTaskId = task.id;
  } else {
    formTitle.innerHTML = `<i class="ph ph-plus-circle"></i> Agregar Tarea`;
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
