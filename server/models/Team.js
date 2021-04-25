const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

let TeamModel = {};

// mongoose.Types.ObjectID is a function that
// converts string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },

  //array of team members being saved
  members: [{
    name: {
      type: String,
      required: true,
      trim: true,
    }, 
    image: {
      type: String,
      required: true,
      trim: true,
    },
    number: {
      type: Number,
      required: true,
    },
    ability: {
      type: Number,
      default: 0,
    },
    moves: [Number]
  }],

  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },

  // I added sharable attribute since this is a feature I may likely add to my projects
  sharable: {
    type: Boolean,
    default: false,
  },

  createdData: {
    type: Date,
    default: Date.now,
  },
}); // Schema

TeamSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  age: doc.age,
});

TeamSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return TeamModel.find(search).select('name members sharable _id').lean().exec(callback);
};

TeamModel = mongoose.model('Team', TeamSchema);

module.exports.TeamModel = TeamModel;
module.exports.TeamSchema = TeamSchema;
