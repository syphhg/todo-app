import './style.css'

let todos = JSON.parse(localStorage.getItem('todos')) || []

const form = document.getElementById('todo-form')
const input = document.getElementById('todo-input')
const list = document.getElementById('todo-list')
const progress = document.getElementById('progress')

function save() {
  localStorage.setItem('todos', JSON.stringify(todos))
}

function render() {
  list.innerHTML = ''
  
  if (todos.length === 0) {
    list.innerHTML = '<p class="empty-state">No tasks yet. Add one above!</p>'
  } else {
    todos.forEach((todo, index) => {
      const li = document.createElement('li')
      li.className = `todo-item${todo.completed ? ' completed' : ''}`
      li.innerHTML = `
        <div class="todo-checkbox" data-index="${index}"></div>
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="delete-btn" data-index="${index}">&times;</button>
      `
      list.appendChild(li)
    })
  }
  
  const done = todos.filter(t => t.completed).length
  progress.textContent = `${done} of ${todos.length} done`
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const text = input.value.trim()
  if (!text) return
  
  todos.push({ text, completed: false })
  input.value = ''
  save()
  render()
})

list.addEventListener('click', (e) => {
  const index = e.target.dataset.index
  if (e.target.classList.contains('todo-checkbox')) {
    todos[index].completed = !todos[index].completed
    save()
    render()
  } else if (e.target.classList.contains('delete-btn')) {
    todos.splice(index, 1)
    save()
    render()
  }
})

render()
