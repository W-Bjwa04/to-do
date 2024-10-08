// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyABHCV03KwPstvbD2Dr33FAMGb9UWTfKzM",
    authDomain: "to-do-91e59.firebaseapp.com",
    projectId: "to-do-91e59",
    storageBucket: "to-do-91e59.appspot.com",
    messagingSenderId: "182952564137",
    appId: "1:182952564137:web:d5c940e22c10e8acb660b8",
    measurementId: "G-98R2R8LKQS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app); // Initialize messaging

document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.querySelector('.todo-list');
    const addTaskBtn = document.querySelector('#add-task');
    const taskInput = document.querySelector('#new-todo');
    const taskDate = document.querySelector('#task-date');
    const taskTime = document.querySelector('#task-time');
    const searchInput = document.querySelector('#search'); // Search input

    // Initialize tasks array
    let tasks = readFromLocalStorage();

    // Display tasks when the page loads
    if (tasks.length > 0) {
        displayTasks(tasks);
    }

    // Request permission for push notifications only on button click
    addTaskBtn.addEventListener('click', () => {
        requestNotificationPermission(); // Request notification permission
        addTask(); // Proceed to add the task
    });

    // Function to request notification permission and get token
    async function requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                const token = await getToken(messaging, { vapidKey: 'BH-7QPgtFWA-2l7JqvZL32eT6YEQAYHFVp0U9CUBcuWD-K1kGZ95gz6TjeQGcrQPsVlY74B3kmQOqkJkpU7-M5c' }); // Replace with your VAPID key
                console.log('FCM Token:', token);
                // Save the token to your server or local storage for sending notifications
            } else {
                console.error('Unable to get permission to notify.');
            }
        } catch (err) {
            console.error('Error getting notification permission:', err);
        }
    }

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

    // Check for upcoming deadlines every 2 hours
    setInterval(() => {
        const now = new Date();
        tasks.forEach(task => {
            const taskDeadline = new Date(`${task.deadlineDate} ${task.deadlineTime}`);
            if (taskDeadline > now) {
                const hoursUntilDeadline = (taskDeadline - now) / (1000 * 60 * 60);
                if (hoursUntilDeadline <= 5) {
                    sendNotification(task.title, task.deadlineDate, task.deadlineTime);
                }
            }
        });
    }, 2 * 60 * 60 * 1000); // Check every 2 hours

    // Send notification function
    function sendNotification(title, deadlineDate, deadlineTime) {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(function (registration) {
                registration.showNotification('Reminder', {
                    body: `Task: ${title} is due by ${deadlineDate} ${deadlineTime}`,
                    // Remove the icon property if you don't have an icon
                    // icon: './icons/icon-192.png',
                });
            });
        }
    }
});
