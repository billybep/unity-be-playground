const mongoose = require('mongoose')
const Account = mongoose.model('accounts')

module.exports = app => {
  // Routes

  // ---- LOGIN
  app.post('/account/login', async(req, res) =>  {
    console.log(req.body);
    const { username, password } = req.body

    if (username == null || password == null) {
      res.send("Invalid credential")
      return
    }

    let userAccount = await Account.findOne({ username: username })
    console.log(userAccount);
    if (userAccount !== null) {
      //! in prod should hash the password
      if (password == userAccount.password) {
        userAccount.lastAuthentication = Date.now()
        await userAccount.save()
  
        console.log("Retrieving account...");
        res.send(userAccount)
        return
      }
    }

    res.send("Invalid credential")
    console.log("Invalid credential")
    return
  })

  // ---- REGISTER
  app.post('/account/register', async(req, res) =>  {
    console.log(req.body);
    const { username, password } = req.body

    if (username == null || password == null) {
      res.send("Invalid credential")
      return
    }

    let userAccount = await Account.findOne({ username })

    if (userAccount == null) {
      // Create new account
      console.log("Creating new account...");

      let newAccount = new Account({
        username,
        password,

        lastAuthentication: Date.now()
      })

      await newAccount.save()

      res.send(newAccount)
      return
    } else {
      res.send("Username has been registered")
      console.log("User has been registered")
    }
    return
  })
}
