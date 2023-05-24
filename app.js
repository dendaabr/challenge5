const express = require('express');
const { readFileSync, writeFileSync } = require('fs');

const app = express();
const filePath = './data/users.json' 

// middlewares
app.use(express.json()) // for parsing application/json
app.use(express.static('static')) // serve static html files

app.set('view engine', 'ejs')

app.get('/dashboard', (req, res) => {
  res.render('index', {
    name: 'Denda'
  })
});

app.get('/foobar', (req, res) => {
  res.sendFile('static/foobar.html', {root: __dirname });
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
    res.status(200).json({
      message: 'OK',
    });
  }
  res.status(404).json({
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
    res.status(409).json( // conflict
      {message:'Username already taken, create another one'} 
      );
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
