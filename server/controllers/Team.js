const models = require('../models');

const { Team } = models;

const makerPage = (req, res) => {
  Team.TeamModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), teams: docs });
  });
};

const makeTeam = (req, res) => {
  // defaults to false - only changed when you click the share link
  const sharable = req.body.sharable || 'false';
  //defaults for everything else
  const name = req.body.name || 'New Team';
  const members = req.body.members || [];

  const teamData = {
    name,
    members,
    sharable,
    owner: req.session.account._id,
  };

  //sets the id so it will save instead of making new
  if(req.body._id) { teamData._id = req.body._id; }

  //saves the team
  const newTeam = new Team.TeamModel(teamData);
  const teamPromise = newTeam.save();

  //redirects or gives error
  teamPromise.then(() => {
    res.json({ redirect: '/maker' });
  });

  teamPromise.catch((err) => {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred' });
  }); // catch

  return teamPromise;
}; // makeTeam

const getTeams = (request, response) => {
  const req = request;
  const res = response;

  return Team.TeamModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ teams: docs });
  });
};

const sharedPage = (request, response) => {
  const req = request;
  const res = response;

  // gets the ID from the parameters
  const searchID = req.params.teamId;
  if (!searchID) {
    return res.render('shared', { error: 'No ID Provided' });
  }

  //
  Team.TeamModel.findById(req.params.teamId, (err, doc) => {
    // if it isn't sharable or it's a bad ID then don't show it
    if (err || !doc.sharable) {
      console.log(err);
      return res.render('shared', { error: 'An error occurred' });
    }

    return res.render('shared', { csrfToken: req.csrfToken(), teams: { name: doc.name, members: doc.members } });
  });

  return false;
};

module.exports.make = makeTeam;
module.exports.makerPage = makerPage;
module.exports.getTeams = getTeams;
module.exports.sharedPage = sharedPage;
