var jsonfile = require('jsonfile');


module.exports = function(opts, cards, callback){

    var collectionManager = {};

    collectionManager.collection = [];

    callback(collectionManager);

}
