document.addEventListener("DOMContentLoaded", () => {
  const columns = document.querySelectorAll(".column");
  let draggedTask = null;

  function saveTasks() {
    const boardData = {};
    columns.forEach(col => {
      const colName = col.dataset.column;
      const tasks = [...col.querySelectorAll(".task")].map(task => task.querySelector(".task-text").textContent);
      boardData[colName] = tasks;
    });
    localStorage.setItem("kanbanBoard", JSON.stringify(boardData));
  }

  function loadTasks() {
    const boardData = JSON.parse(localStorage.getItem("kanbanBoard"));
    if (!boardData) return;
    columns.forEach(col => {
      const colName = col.dataset.column;
      const taskList = col.querySelector(".task-list");
      taskList.innerHTML = "";
      boardData[colName].forEach(text => {
        const task = createTaskElement(text);
        taskList.appendChild(task);
      });
    });
  }

  function createTaskElement(text) {
    const li = document.createElement("li");
    li.className = "task";
    li.draggable = true;

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = text;

    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";

    delBtn.addEventListener("click", () => {
      li.remove();
      saveTasks();
    });

    li.appendChild(span);
    li.appendChild(delBtn);

    li.addEventListener("dragstart", () => {
      draggedTask = li;
      li.classList.add("dragging");
    });

    li.addEventListener("dragend", () => {
      draggedTask = null;
      li.classList.remove("dragging");
      saveTasks();
    });

    return li;
  }

  document.querySelectorAll(".add-task-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const taskText = prompt("Enter task:");
      if (!taskText) return;
      const task = createTaskElement(taskText);
      btn.nextElementSibling.appendChild(task);
      saveTasks();
    });
  });

  columns.forEach(col => {
    const taskList = col.querySelector(".task-list");
    taskList.addEventListener("dragover", e => {
      e.preventDefault();
      const afterElement = getDragAfterElement(taskList, e.clientY);
      if (afterElement == null) {
        taskList.appendChild(draggedTask);
      } else {
        taskList.insertBefore(draggedTask, afterElement);
      }
    });
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".task:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  loadTasks();
});
