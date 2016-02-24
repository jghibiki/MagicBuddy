var uuid = require('node-uuid');

module.exports = function(){
    
    var card = {};

    card.id = uuid.v4();

    return card;
}
