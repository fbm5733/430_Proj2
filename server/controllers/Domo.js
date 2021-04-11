const models = require('../models');

const { Domo } = models;

const makerPage = (req, res) => {
  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), domos: docs });
  });
};

const makeDomo = (req, res) => {
  if (!req.body.name || !req.body.age) {
    return res.status(400).json({ error: 'RAWR! Both name and age are required' });
  }

  // defaults to false (even though it's a checkbox it should never NOT send a value)
  const sharable = req.body.sharable || 'false';

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    sharable,
    owner: req.session.account._id,
  };

  const newDomo = new Domo.DomoModel(domoData);

  const domoPromise = newDomo.save();

  domoPromise.then(() => res.json({ redirect: '/maker' }));

  domoPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists.' });
    }

    return res.status(400).json({ error: 'An error occurred' });
  }); // catch

  return domoPromise;
}; // makeDomo

const getDomos = (request, response) => {
  const req = request;
  const res = response;

  return Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ domos: docs });
  });
};

const sharedPage = (request, response) => {
  const req = request;
  const res = response;

  // gets the ID from the parameters
  const searchID = req.params.domoId;
  if (!searchID) {
    return res.render('shared', { error: 'No ID Provided' });
  }

  //
  Domo.DomoModel.findById(req.params.domoId, (err, doc) => {
    // if it isn't sharable or it's a bad ID then don't show it
    if (err || !doc.sharable) {
      console.log(err);
      return res.render('shared', { error: 'An error occurred' });
    }

    return res.render('shared', { domos: { name: doc.name, age: doc.age } });
  });

  return false;
};

module.exports.make = makeDomo;
module.exports.makerPage = makerPage;
module.exports.getDomos = getDomos;
module.exports.sharedPage = sharedPage;
