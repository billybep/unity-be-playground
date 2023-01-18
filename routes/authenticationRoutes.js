const mongoose = require('mongoose')
const Account = mongoose.model('accounts')

module.exports = app => {
  // Routes
  app.get('/account', async(req, res) =>  {
    const { username, password } = req.query

    if (username == null || password == null) {
      res.send("Invalid credential")
      return
    }

    let userAccount = await Account.findOne({ username: username })

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
    return
  })
}
