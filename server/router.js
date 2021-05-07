const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getTeams', mid.requiresLogin, controllers.Team.getTeams);
  app.get('/getTeamDetails', mid.requiresLogin, controllers.Team.getTeamDetails);
  app.get('/getSpeciesData', mid.requiresLogin, controllers.Team.getSpeciesData);
  app.get('/speciesSearch', controllers.Team.speciesSearch);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/share', mid.requiresLogin, mid.requiresPremium, controllers.Team.makeSharable);
  app.get('/maker/:teamId', mid.requiresLogin, controllers.Team.sharedPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/maker', mid.requiresLogin, controllers.Team.makerPage);
  app.post('/maker', mid.requiresLogin, mid.requiresPremiumConditional, controllers.Team.make);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
