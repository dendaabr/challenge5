const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Challenge 5')
})

app.listen(3000)