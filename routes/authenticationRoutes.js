const mongoose = require('mongoose')
const Account = mongoose.model('accounts')
const argon2 = require('argon2')
const crypto = require('crypto')

// const passwordRegex = new RegExp('/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/gm')

module.exports = app => {
  // Routes

  // ---- LOGIN
  app.post('/account/login', async(req, res) =>  {
    console.log(req.body);
    const { username, password } = req.body

    let response = {}

    if (username == null || password.length < 3 || password.length > 24) {
      response.code = 1
      response.msg = 'Invalid credentials'
      res.send(response)
      console.log(response.msg);
      return
    }

    let userAccount = await Account.findOne({ username: username }, 'username password')
    console.log(userAccount);

    if (userAccount !== null) {
      // verify password
      argon2
        .verify(userAccount.password, password)
        .then(async success => {
          if (!success) {
            response.code = 1
            response.msg = 'Invalid credentials'
            res.send(response)
            console.log(response.msg);
            return
          }

          userAccount.lastAuthentication = Date.now()
          await userAccount.save()

          console.log("Retrieving account...");
          console.log("Welcome " + userAccount.username);

          response.code = 0
          response.msg = 'Account found'
          response.data = (({ username, _id }) => ({ username, _id }))(userAccount)

          res.send(response)
          console.log(response.data);
          return
        })
    } else {
      response.code = 1
      response.msg = 'Invalid credentials'
      res.send(response)
      console.log(response.msg);
      return
    }
  })

  // ---- REGISTER
  app.post('/account/register', async(req, res) =>  {
    console.log(req.body);
    const { username, password } = req.body

    let response = {}

    if (username == null || username.length < 3 || username.length > 24) {
      response.code = 1
      response.msg = 'Invalid credentials'
      res.send(response)
      console.log(response.msg);
      return
    }

    if (password.length < 3 || password.length > 24) {
      response.code = 3
      response.msg = 'Unsafe password'
      res.send(response)
      console.log(response.msg);
      return
    }

    let userAccount = await Account.findOne({ username }, '_id')
    console.log(userAccount);

    if (userAccount == null) {
      // Create new account
      console.log("Creating new account...");

      // Encrypt password
      crypto.randomBytes(32, (err, salt) => {

        if (err) console.log(err);

        argon2
          .hash(password, salt)
          .then(async hash => {
            let newAccount = new Account({
              username,
              password: hash,
              salt,
      
              lastAuthentication: Date.now()
            })
      
            await newAccount.save()

            response.code = 0
            response.msg = 'Account found'
            response.data = (({ username, _id }) => ({ username }))(newAccount)

            res.send(response)
            console.log(response);
            return
          })
      })
    } else {
      response.code = 2
      response.msg = 'Username has been registered'
      res.send(response)
      console.log(response.msg);
      return
    }
    return
  })
}
