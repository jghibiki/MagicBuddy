var jsonfile = require('jsonfile');

module.exports = function(opts, cards, callback){

    var deckManager = {};

    deckManager.decks = [];

    callback(deckManager);

}
