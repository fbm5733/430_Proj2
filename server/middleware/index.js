const models = require('../models');

const { Team } = models;

const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/');
  }
  return next();
};

const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/maker');
  }
  return next();
};

const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
};

const requiresPremium = (req, res, next) => {
  if (req.session.account.premium !== true && req.session.account.premium !== 'true') {
    return res.json({ redirect: '/maker' }); // redirect to a premium page later
  }
  return next();
};

const requiresPremiumConditional = (req, res, next) => {
  // check if premium, and if this is a new Team
  if (req.session.account.premium !== true && req.session.account.premium !== 'true' && req.body.new === 'true') {
    // finds how many teams the user has
    Team.TeamModel.findByOwner(req.session.account._id, (err, docs) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occurred' });
      // if the user has 5 or more teams, cannot make more
      } if (docs.length >= 5) {
        return res.json({ redirect: '/maker' }); // redirect to a premium page later
      }
      // just do the next() call
      return next();
    });
    return false;
  }
  return next();
};

const bypassSecure = (req, res, next) => {
  next();
};

module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;
module.exports.requiresPremium = requiresPremium;
module.exports.requiresPremiumConditional = requiresPremiumConditional;

if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
