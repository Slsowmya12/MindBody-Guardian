const mongoose = require('mongoose');

const resultsModel = new mongoose.Schema({
  email:{
    type: String,
    required: true,
    unique: true
  },

  results: {
    type: [{
      category: String,
      userInputs: Array,
      percentage: String,
      severity_level: String,
      date: String
    }],
    default: [],
    required: true,
  },

  currentStatus:{
    type:[{
      category: String,
      percentage: String,
      severity_level: String,
      date: String
    }],
    required: true,
    default: []
  }
})

const userResults = mongoose.model('results', resultsModel);
module.exports = userResults;