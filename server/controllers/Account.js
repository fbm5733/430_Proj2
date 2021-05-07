const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

const settingsPage = (req, res) => {
  res.render('settings');
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (request, response) => {
  const req = request;
  const res = response;

  // force cast to strings to cover some security flaws
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'RAWR! All fields are required' });
  } // if

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/maker' });
  }); // authenticate
}; // login

const signup = (request, response) => {
  const req = request;
  const res = response;

  // cast to strings to cover up some security flaws
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'RAWR! All fields are required' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'RAWR! Passwords do not match' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({ redirect: '/maker' });
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occurred' });
    }); // catch
  }); // generateHash
}; // signup

const changePassword = (request, response) => {
  const req = request;
  const res = response;

  // force cast to strings to cover some security flaws
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;
  const newPass = `${req.body.pass2}`;

  if (!username || !password || !newPass) {
    return res.status(400).json({ error: 'RAWR! All fields are required' });
  } // if

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    // checks for an error, if it doesn't exist, or it isn't this user
    if (err || !account || (account._id !== req.session.account._id && `${account._id}` !== req.session.account._id)) {
      console.log(account);
      console.log(req.session.account);
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    // generate hash for the new password
    return Account.AccountModel.generateHash(newPass, (salt, hash) => {
      const accountData = {
        salt,
        password: hash,
      };

      // makes this one sharable, then responds with the ID again
      Account.AccountModel.findByIdAndUpdate(account._id,
        { $set: accountData },
        { new: true },
        (error) => {
          if (error) {
            return response.status(400).json({ error: 'An error occurred updating password' });
          }
          return res.json({ redirect: '/logout' });
        }); // uddate
    }); // generateHash
  }); // authenticate
};

const makePremium = (request, response) => {
  // makes this one sharable, then responds with the ID again
  Account.AccountModel.findByIdAndUpdate(request.session.account._id,
    { $set: { premium: true } },
    { new: true },
    (err, newAccount) => {
      if (err) {
        response.status(400).json({ error: 'Bad Team ID' });
      } else {
        request.session.account = Account.AccountModel.toAPI(newAccount);
        response.json({ redirect: '/maker' });
      }
    });
};

const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
    premium: req.session.account ? req.session.account.premium : 'false',
  };

  res.json(csrfJSON);
};

module.exports.loginPage = loginPage;
module.exports.settingsPage = settingsPage;
module.exports.passwordChange = changePassword;
module.exports.makePremium = makePremium;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.getToken = getToken;
