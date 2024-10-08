// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase messaging instance
const messaging = firebase.messaging();

document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.querySelector('.todo-list');
    const addTaskBtn = document.querySelector('#add-task');
    const taskInput = document.querySelector('#new-todo');
    const taskDate = document.querySelector('#task-date');
    const taskTime = document.querySelector('#task-time');

    // Request permission for push notifications
    messaging.requestPermission()
        .then(() => {
            console.log('Notification permission granted.');
            return messaging.getToken(); // Get the FCM token
        })
        .then((token) => {
            console.log('FCM Token:', token);
            // Save the token to your server or local storage for sending notifications
        })
        .catch((err) => {
            console.error('Error getting notification permission:', err);
        });

    // Register the service worker for handling push notifications
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then((reg) => console.log('Service Worker registered', reg))
                .catch((err) => console.error('Service Worker registration failed', err));
        });
    }

    // Read from local storage
    const readFromLocalStorage = function() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    };

    // Function to store tasks in local storage
    const addToLocalStorage = function(task) {
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));  // Store tasks array in local storage
    };

    // Function to display tasks in the task list
    const displayTasks = function (tasks = []) {
        taskList.innerHTML = tasks.map((t) => {
            return `
                <li id="${t.id}">
                    <span id="task-title">${t.title}</span>
                    <span id="deadline">${t.deadlineDate} ${t.deadlineTime}</span>
                    <button class="delete-btn" data-id="${t.id}">🗑️</button>
                </li>
            `;
        }).join('');
    };

    // Load tasks from local storage
    let tasks = readFromLocalStorage();

    // Display tasks when the page loads
    if (tasks.length > 0) {
        displayTasks(tasks);
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

            // Refresh the task list
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

    // Event listener for adding a task
    addTaskBtn.addEventListener('click', addTask);

    // Use event delegation for task deleting (event bubbling)
    taskList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const taskIdToDelete = Number(event.target.getAttribute('data-id'));

            // Filter the tasks array to remove the task with the matching ID
            tasks = tasks.filter(t => t.id !== taskIdToDelete);

            // Update the tasks in local storage
            localStorage.setItem('tasks', JSON.stringify(tasks));

            // Refresh the displayed task list
            displayTasks(tasks);

            alert('Task Deleted Successfully');
        }
    });

    // Check for upcoming deadlines every hour
    setInterval(() => {
        const now = new Date();
        tasks.forEach(task => {
            const taskDeadline = new Date(`${task.deadlineDate} ${task.deadlineTime}`);
            // Check if the task deadline is in the future
            if (taskDeadline > now) {
                // Calculate the time difference in hours
                const hoursUntilDeadline = (taskDeadline - now) / (1000 * 60 * 60);
                if (hoursUntilDeadline <= 5) { // Notify if within 5 hours
                    sendNotification(task.title, task.deadlineDate, task.deadlineTime);
                }
            }
        });
    }, 5 * 60 * 60 * 1000); // Check every 5 hours

    // Send notification function
    function sendNotification(title, deadlineDate, deadlineTime) {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(function (registration) {
                registration.showNotification('Reminder', {
                    body: `Task: ${title} is due by ${deadlineDate} ${deadlineTime}`,
                    icon: './icons/icon-192.png',
                });
            });
        }
    }
});
