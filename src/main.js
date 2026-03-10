import './style.css'

let todos = JSON.parse(localStorage.getItem('todos')) || []

const form = document.getElementById('todo-form')
const input = document.getElementById('todo-input')
const list = document.getElementById('todo-list')
const progress = document.getElementById('progress')

function haptic(type = 'light') {
  if (navigator.vibrate) {
    navigator.vibrate(type === 'light' ? 10 : type === 'medium' ? 20 : 30)
  }
  if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptic) {
    const style = type === 'light' ? 'light' : type === 'medium' ? 'medium' : 'heavy'
    window.webkit.messageHandlers.haptic.postMessage(style)
  }
}

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
    haptic('light')
    todos[index].completed = !todos[index].completed
    save()
    render()
  } else if (e.target.classList.contains('delete-btn')) {
    haptic('medium')
    todos.splice(index, 1)
    save()
    render()
  }
})

let touchStartX = 0
let touchStartY = 0
let currentSwipeItem = null

list.addEventListener('touchstart', (e) => {
  const item = e.target.closest('.todo-item')
  if (item) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    currentSwipeItem = item
  }
}, { passive: true })

list.addEventListener('touchmove', (e) => {
  if (!currentSwipeItem) return
  
  const touchX = e.touches[0].clientX
  const diffX = touchX - touchStartX
  
  if (diffX < -30) {
    currentSwipeItem.style.transform = `translateX(${diffX}px)`
    currentSwipeItem.style.opacity = Math.min(1, Math.abs(diffX) / 150)
  }
}, { passive: true })

list.addEventListener('touchend', (e) => {
  if (!currentSwipeItem) return
  
  const touchX = e.changedTouches[0].clientX
  const diffX = touchX - touchStartX
  
  if (diffX < -80) {
    const checkbox = currentSwipeItem.querySelector('.todo-checkbox')
    if (checkbox) {
      const index = checkbox.dataset.index
      haptic('medium')
      todos.splice(index, 1)
      save()
      render()
    }
  } else {
    currentSwipeItem.style.transform = ''
    currentSwipeItem.style.opacity = ''
  }
  currentSwipeItem = null
})

render()
