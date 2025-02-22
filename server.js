// server.js - Node.js сервер для аутентификации
const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 3000;
const usersFile = 'users.json';

app.use(express.json());
app.use(cors());

// Чтение пользователей из JSON-файла
const readUsers = () => {
    const data = fs.readFileSync(usersFile);
    return JSON.parse(data).users;
};

// Запись пользователей в JSON-файл
const writeUsers = (users) => {
    fs.writeFileSync(usersFile, JSON.stringify({ users }, null, 2));
};

// Регистрация пользователя
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    let users = readUsers();

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: users.length + 1,
        username,
        email,
        password: hashedPassword
    };
    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: 'Регистрация успешна' });
});

// Вход в систему
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();
    
    const user = users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    res.json({ message: 'Вход выполнен', user: { id: user.id, username: user.username, email: user.email } });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// ================ Фронтенд ================ //
// index.html
// const frontendCode = `
// <!DOCTYPE html>
// <html lang='ru'>
// <head>
//     <meta charset='UTF-8'>
//     <meta name='viewport' content='width=device-width, initial-scale=1.0'>
//     <title>Логин и регистрация</title>
//     <link rel='stylesheet' href='styles.css'>
//     <script defer src='script.js'></script>
// </head>
// <body>
//     <div class='container'>
//         <h2>Регистрация</h2>
//         <input id='regUsername' type='text' placeholder='Имя пользователя'>
//         <input id='regEmail' type='email' placeholder='Email'>
//         <input id='regPassword' type='password' placeholder='Пароль'>
//         <button onclick='register()'>Зарегистрироваться</button>
        
//         <h2>Логин</h2>
//         <input id='loginUsername' type='text' placeholder='Имя пользователя'>
//         <input id='loginPassword' type='password' placeholder='Пароль'>
//         <button onclick='login()'>Войти</button>
//     </div>
//     <p id='message'></p>
// </body>
// </html>
// `;

// fs.writeFileSync('index.html', frontendCode);

// // styles.css
// const stylesCode = `
// body {
//     font-family: Arial, sans-serif;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     height: 100vh;
//     background-color: #f4f4f4;
// }
// .container {
//     background: white;
//     padding: 20px;
//     border-radius: 8px;
//     box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//     text-align: center;
// }
// input {
//     display: block;
//     width: 100%;
//     margin: 10px 0;
//     padding: 10px;
//     border: 1px solid #ddd;
//     border-radius: 5px;
// }
// button {
//     background: #28a745;
//     color: white;
//     border: none;
//     padding: 10px;
//     width: 100%;
//     cursor: pointer;
//     border-radius: 5px;
// }
// button:hover {
//     background: #218838;
// }
// `;

// fs.writeFileSync('styles.css', stylesCode);

// // script.js
// const scriptCode = `
// const API_URL = 'http://localhost:3000';

// async function register() {
//     const username = document.getElementById('regUsername').value;
//     const email = document.getElementById('regEmail').value;
//     const password = document.getElementById('regPassword').value;
//     const response = await fetch(API_URL + '/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, email, password })
//     });
//     const data = await response.json();
//     document.getElementById('message').innerText = data.message;
// }

// async function login() {
//     const username = document.getElementById('loginUsername').value;
//     const password = document.getElementById('loginPassword').value;
//     const response = await fetch(API_URL + '/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password })
//     });
//     const data = await response.json();
//     document.getElementById('message').innerText = data.message;
// }
// `;

// fs.writeFileSync('script.js', scriptCode);
