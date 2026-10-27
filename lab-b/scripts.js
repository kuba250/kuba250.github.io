const listElement = document.getElementById('list');
const searchInput = document.getElementById('search');
const newTaskTextInput = document.getElementById('new-text');
const newTaskDateInput = document.getElementById('new-date');

function isValid(taskText, taskDate) {
  const isLengthValid = taskText.length >= 3 && taskText.length <= 255;
  const isDateValid = !taskDate || new Date(taskDate) > new Date();
  const isTaskValid = isLengthValid && isDateValid;

  if (!isTaskValid) {
    alert('Tytuł zadania musi mieć od 3 do 255 znaków, a data musi być pusta albo w przyszłości');
  }
  return isTaskValid;
}

class Todo {
  tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  editingIndex = null;
  term = '';

  getFilteredTasks() {
    return this.tasks.filter((task) => this.term.length < 2 || task.text.toLowerCase().includes(this.term));
  }

  add(taskText, taskDate) {
    if (!isValid(taskText, taskDate))
    {
      return false;
    }

    this.tasks.push({ text: taskText, date: taskDate });
    this.draw();
    return true;
  }

  remove(taskIndex) {
    this.tasks.splice(taskIndex, 1);
    this.editingIndex = null;
    this.draw();
  }

  edit(taskIndex, taskText, taskDate) {
    if (isValid(taskText, taskDate)) {
      this.tasks[taskIndex] = { text: taskText, date: taskDate };
    }
    this.editingIndex = null;
    this.draw();
  }

  draw() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    listElement.innerHTML = '';

    this.getFilteredTasks().forEach((task) => {
      const taskIndex = this.tasks.indexOf(task);
      const taskElement = document.createElement('div');
      taskElement.className = 'task';
      listElement.append(taskElement);

      if (taskIndex === this.editingIndex) {
        taskElement.innerHTML = '<input> <input type="date">';
        const [textInput, dateInput] = taskElement.children;
        textInput.value = task.text;
        dateInput.value = task.date;
        textInput.focus();

        // AI (model Claude Opus 5.5) pomogło zrobić zapis edycji po kliknięciu poza zadaniem
        taskElement.addEventListener('focusout', (event) => {
          const isFocusStillInTask = taskElement.contains(event.relatedTarget);
          if (!isFocusStillInTask && this.editingIndex === taskIndex) {
            this.edit(taskIndex, textInput.value.trim(), dateInput.value);
          }
        });
      } else {
        taskElement.onclick = () => {
          this.editingIndex = taskIndex;
          this.draw();
        };

        // AI (model Claude Opus 5.5) pomogło zrobić wyróżnianie wyszukiwanej frazy
        const position = task.text.toLowerCase().indexOf(this.term);
        if (this.term.length >= 2 && position !== -1) {
          const markElement = document.createElement('mark');
          markElement.textContent = task.text.slice(position, position + this.term.length);
          taskElement.append(task.text.slice(0, position), markElement, task.text.slice(position + this.term.length));
        } else {
          taskElement.append(task.text);
        }
        if (task.date) taskElement.append(' (' + new Date(task.date).toLocaleDateString('pl-PL') + ')');
      }

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Usuń';
      deleteButton.onclick = (event) => {
        event.stopPropagation();
        this.remove(taskIndex);
      };
      taskElement.append(' ', deleteButton);
    });
  }
}

const todo = new Todo();
todo.draw();

document.getElementById('add').onclick = () => {
  if (todo.add(newTaskTextInput.value.trim(), newTaskDateInput.value)) {
    newTaskTextInput.value = '';
    newTaskDateInput.value = '';
  }
};

searchInput.oninput = () => {
  todo.term = searchInput.value.trim().toLowerCase();
  todo.draw();
};
