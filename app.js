const express = require('express');
const { readFileSync, writeFileSync } = require('fs');

const app = express();
const filePath = './data/users.json' 

app.use(express.json()) // for parsing application/json
app.use(express.static('static')) // serve static html files

app.get('/', (req, res) => {
  
});

app.post('/auth', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.split(/\s+/).pop() || '';
  const auth = Buffer.from(token, 'base64').toString();
  const parts = auth.split(/:/);
  const username = parts.shift();
  const password = parts.join(':');
  
  
  const data = readFileSync(filePath);
  const usersJson = JSON.parse(data);
  const users = usersJson.users;

  if (users.find((user) => username === user.username && password === user.password)) {
    res.send({
      message: 'OK',
    });
  }
  res.send({
    status: 404,
    message: 'Invalid username or password',
  });
});

app.post('/register', (req, res) => {
  const payload = req.body;

  const username = payload.username;
  const password = payload.password;

  // check if username already taken

  const data = readFileSync(filePath);
  const usersJson = JSON.parse(data);
  const users = usersJson.users;
  if (users.find((user) => username === user.username)) {
    res.statusCode = 409 // conflict
    res.send({message:'Username already taken, create another one'});
  } else {
    const newUserObj = {
      username:username,
      password:password
    };
  
    // append to users.json
    const newUsersData = {users:[...users, newUserObj]}
  
    try {
      writeFileSync(filePath, JSON.stringify(newUsersData, null, 2), 'utf8');
      console.log('Data successfully saved to disk');
    } catch (error) {
      console.log('An error has occurred ', error);
    }
  
    res.statusCode = 201; // created
    res.send({message:'Yay. You are successfully registered.'})
  }
});

app.listen(3000);
