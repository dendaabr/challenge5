const express = require('express');
const md5 = require('md5');

const app = express();

app.get('/', (req, res) => {
  res.send('Challenge 5');
});

app.post('/auth', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.split(/\s+/).pop() || '';
  const auth = Buffer.from(token, 'base64').toString();
  const parts = auth.split(/:/);
  const username = parts.shift();
  const password = parts.join(':');

  const users = [
    { username: 'denda', password: md5('12345') },
  ];

  if (users.find((user) => username === user.username && md5(password) === user.password)) {
    res.send({
      status: 200,
      message: 'OK',
    });
  }
  res.send({
    status: 404,
    message: 'Invalid username or password',
  });
});

app.listen(3000);
