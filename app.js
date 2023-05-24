const express = require('express');
const session = require('express-session');
const { readFileSync, writeFileSync } = require('fs');
const bodyParser = require('body-parser');
const { get } = require('lodash');

const app = express();
const filePath = './data/users.json' 

// middlewares
app.use(express.json()) // for parsing application/json
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.static('static')) // serve static files

app.set('view engine', 'ejs')

app.set('trust proxy', 1) // trust first proxy
app.use(session({  
  name: `challenge5`,
  secret: 'secret1234',  
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // This will only work if you have https enabled!
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  } 
}));

const sessionChecker = (req, res, next) => {    
  console.log(`Session Checker: ${req.session.id}`.green);
  console.log(req.session);
  if (req.session.profile) {
      console.log(`Found User Session`.green);
      next();
  } else {
      console.log(`No User Session Found`.red);
      res.redirect('/login');
  }
};

app.get('/', (req, res) => {
  res.render('index', {
    username: get(req,'session.profile.username')
  })
});

app.get('/works', (req, res) => {
  const data = readFileSync('./data/works.json');
  const works = JSON.parse(data);
  res.json(works)
});

app.get('/login', (req, res) => {
  res.render('login')
});

app.get('/signup', (req, res) => {
  res.render('signup')
});

app.get('/rock-paper-scissor', sessionChecker, (req, res) => {
  res.render('rock-paper-scissor', {
    username: get(req,'session.profile.username')
  })
});

app.post('/login', (req, res) => {

  const {username, password} = req.body;
  
  const data = readFileSync(filePath);
  const usersJson = JSON.parse(data);
  const users = usersJson.users;

  if (users.find((user) => username === user.username && password === user.password)) {
    req.session.profile = {
      username: username
    };
    res.render('index', {
      username: username,
    });
  } else {
    res.render('login', {
      errMsg: 'Invalid username or password',
    });
  }
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
    res.render('signup',
    {
      errMsg:'Username already taken, create another one'
    });
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
  
    res.render('signup-success');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(function(err) {
    console.log('Destroyed session')
  })
  res.redirect('/');
});

 

app.listen(3000);
