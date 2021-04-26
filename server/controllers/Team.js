// https://github.com/PokeAPI/pokedex-promise-v2
const Pokedex = require('pokedex-promise-v2');
const models = require('../models');

const { Team } = models;

// creates the pokedex object
const P = new Pokedex();

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
  // defaults for everything else
  const name = req.body.name || 'New Team';
  const members = req.body.members || [];

  const teamData = {
    name,
    members,
    sharable,
    owner: req.session.account._id,
  };

  // sets the id so it will save instead of making new
  if (req.body._id) { teamData._id = req.body._id; }

  // saves the team
  const newTeam = new Team.TeamModel(teamData);
  const teamPromise = newTeam.save();

  // redirects or gives error
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

const getTeamDetails = (request, response) => {
  // get the id
  const searchID = request.query._id;
  // ensures the id is there
  if (!searchID) {
    return response.status(400).json({ error: 'Team id not provided' });
  }

  // finds the team
  Team.TeamModel.findById(searchID, (err, doc) => {
    // if it isn't sharable or it's a bad ID then don't show it
    if (err) {
      console.log(err);
      return response.status(400).json({ error: 'Unknown error finding requested team' });
    }

    // start making the response
    const team = doc;
    const obj = { name: team.name, _id: team._id };
    obj.members = {};

    // this will decrement every time that a pokemon is added to the teams part of the obj
    // This will let it check for when it's done and respond appropriately.
    obj.remainingMembers = team.members.length;

    // special case for an empty team, respond immediately
    if (obj.remainingMembers === 0) {
      return response.json(obj);
    }

    // iterate through the team members and find their names using the Pokedex,
    // adding them to the object when they are found.
    for (let i = 0; i < team.members.length; i++) {
      const member = team.members[i];

      // gets all the pokemon and calls a callback function each time
      // the callback takes advantage of the closure of the for loop it's created within
      P.getPokemonByName(member.number, (res, error) => { // callback function
        if (!error) {
          const newMember = {};

          newMember.name = res.name; // sets the name
          newMember.image = res.sprites.other['official-artwork'].front_default; // sets the image
          if (member.ability || member.ability === 0) {
            newMember.ability = res.abilities[member.ability].ability.name; // sets the ability
          } else {
            newMember.ability = '';
          }
          newMember.moves = []; // sets the moves to empty
          // adds each move
          for (let j = 0; j < member.moves.length; j++) {
            newMember.moves[j] = res.moves[member.moves[j]].move.name;
          }
          // sets the values (the plain numbers)
          newMember.moveValues = member.moves;
          newMember.abilityValue = member.ability;
          newMember.number = member.number;

          // success, set the object
          obj.members[i] = newMember;
        } else {
          // failed, give an error
          obj.members[i] = null;
        }

        // decrement each time that one finishes
        obj.remainingMembers -= 1;

        // respond when all the names have been recieved
        if (obj.remainingMembers <= 0) {
          response.json(obj);
        }
      }); // getPokemonByName
    } // for loop
    return null; // return null, prevents bubbling but still waits for the rest to be done.
  }); // findByID
  return null;
};

const getSpeciesData = (request, response) => {
  // get the pokemon's id and species
  const { id } = request.query;
  const { species } = request.query;
  // parameter is missing (includes 0 check because 0 is falsey)
  if ((!id && id !== 0) || (!species && species !== 0)) {
    return response.status(400).json({ error: 'Either id or species is not provided' });
  }

  // starts building object to respond with
  const obj = { id };

  // newSpecies parameter is for if you need to reset all the values of the pokemon
  if (request.params.newSpecies) {
    obj.newSpecies = request.params.newSpecies;
  }

  // finds the species given
  P.getPokemonByName(species, (res, error) => { // callback function
    if (!error) {
      // success, set the object
      obj.data = res;
    } else {
      // failed, give an error
      obj.data = null;
    }
    // respond
    return res.json(obj);
  });
  return null;
};

const getPokemonsList = (request, response) => {
  // creates respond object
  const obj = {};

  P.getPokemonsList({ limit: 100000, offset: 0 }, (res, error) => {
    if (!error) {
      // filters it out so it's just an array of every name that includes what was searched for
      obj.results = res.results
        .map((species) => species.name);
      // .filter((name) => name.includes(searchString));
      // write response
      return response.json(obj);
    }
    // just act as if there were no pokemon
    obj.results = [];
    return response.json(obj);
  });
};

const sharedPage = (request, response) => {
  const req = request;
  const res = response;

  // gets the ID from the parameters
  const searchID = req.params.teamId;
  if (!searchID) {
    // show the page anyway since that part still worked
    return res.render('shared', { error: 'No ID Provided' });
  }

  //
  Team.TeamModel.findById(searchID, (err, doc) => {
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
module.exports.getTeamDetails = getTeamDetails;
module.exports.sharedPage = sharedPage;
module.exports.getSpeciesData = getSpeciesData;
module.exports.getPokemonsList = getPokemonsList;
