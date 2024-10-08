// Remove Firebase imports
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
// import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging.js";

// Initialize your tasks array
let tasks = readFromLocalStorage();

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.querySelector('.todo-list');
    const addTaskBtn = document.querySelector('#add-task');
    const taskInput = document.querySelector('#new-todo');
    const taskDate = document.querySelector('#task-date');
    const taskTime = document.querySelector('#task-time');
    const searchInput = document.querySelector('#search'); // Search input

    // Display tasks when the page loads
    if (tasks.length > 0) {
        displayTasks(tasks);
    }

    // Add task functionality
    addTaskBtn.addEventListener('click', addTask);

    // Function to read from local storage
    function readFromLocalStorage() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    // Function to store tasks in local storage
    function addToLocalStorage(task) {
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Store tasks array in local storage
    }

    // Function to display tasks in the task list
    function displayTasks(tasks = []) {
        taskList.innerHTML = tasks.map((t) => {
            return `
                <li id="${t.id}">
                    <span id="task-title">${t.title}</span>
                    <span id="deadline">${t.deadlineDate} ${t.deadlineTime}</span>
                    <button class="delete-btn" data-id="${t.id}">🗑️</button>
                </li>
            `;
        }).join('');
    }

    // Function to format date to "October 08, 2024"
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    }

    // Function to format time to "5:30 PM"
    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        let hour = parseInt(hours);
        let period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;  // Convert to 12-hour format
        return `${hour}:${minutes} ${period}`;
    }

    // Function to add a task
    const addTask = function () {
        const taskContent = taskInput.value;
        const taskDeadlineDate = taskDate.value;
        const taskDeadlineTime = taskTime.value;

        if (taskContent && taskDeadlineDate && taskDeadlineTime) {
            // Check if task already exists
            const existingTask = tasks.find(t => t.title === taskContent);
            if (existingTask) {
                alert('Task Already Added');
                return;
            }

            // Create task object
            const taskToAdd = {
                id: Date.now(),  // Use timestamp as a unique ID
                title: taskContent,
                deadlineDate: formatDate(taskDeadlineDate),
                deadlineTime: formatTime(taskDeadlineTime)
            };

            // Add task to local storage and display
            addToLocalStorage(taskToAdd);
            displayTasks(tasks);
            alert('Task Added Successfully');

            // Clear input fields
            taskInput.value = '';
            taskDate.value = '';
            taskTime.value = '';
        } else {
            alert('Please fill out all fields.');
        }
    };

    // Use event delegation for task deleting (event bubbling)
    taskList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const taskIdToDelete = Number(event.target.getAttribute('data-id'));

            // Filter the tasks array to remove the task with the matching ID
            tasks = tasks.filter(t => t.id !== taskIdToDelete);
            localStorage.setItem('tasks', JSON.stringify(tasks)); // Update tasks in local storage
            displayTasks(tasks);
            alert('Task Deleted Successfully');
        }
    });

    // Search functionality
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm));
        displayTasks(filteredTasks);
    });
});
