const express = require('express')
const keys = require('./config/keys.js')

const app = express()

// Setup MongoDB
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })

// Setup DB models
require('./model/Account')

// Setup Routes
require('./routes/authenticationRoutes')(app)

app.listen(keys.port, () => {
  console.log("Backend for Unity is listening on port " + keys.port)
})
