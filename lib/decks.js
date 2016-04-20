var jsonfile = require('jsonfile');
var fs = require('fs');
var readline = require('readline');
var nodeUtil = require('util');
var utils = require('./utils.js');

module.exports = function(opts, cards, callback){

    var deckManager = {};

    deckManager.decks = {};

    deckManager.manifest = {};

    callback(deckManager);

    /* Public Methods */

    deckManager.bindListeners = function(opts, socket){
        if(opts.debug) console.log("Binding Deck Listeners");
        socket.on("deck:save", function(name){
            deckManager.save(name);  
        });

        // Adds a card to a deck
        socket.on("deck:add", function(obj){
            deckManager.add(obj.name, obj.card);
        });

        // Removes a card from a deck
        socket.on("deck:remove", function(obj){
            deckManager.remove(obj.name, obj.card);
        });
        
        // Create a new deck
        socket.on("deck:create", function(name){
            console.log("Creating deck: \"" + name + "\".")
            deckManager.manifest[name] = {
                tags: []
            };
            deckManager.decks[name] = [];
            deckManager.save(name);
            socket.emit("deck:create::response", true);
        });

        // Deletes a deck
        socket.on("deck:delete", function(name){
            deckManager.delete(name); 
            socket.emit("deck:delete::response", true);
        });

        // Moves a deck
        // NOTE: this should be updated to rename
        //socket.on("deck:move", function(obj){
        //    var oldPath = deckManager.manifest[obj.name];
        //    deckManager.manifest[obj.name] = obj.path;
        //    deckManager.delete(oldPath, name);
        //    deckManager.save();
        //    socket.emit("deck:move::response", true);
        //});

        socket.on("deck:get:all", function(){
            socket.emit("deck:get:all::response", 
                 Object.keys(deckManager.decks)
            );
        });

        socket.on("deck:get:one", function(name){
            console.log("Getting \"" + name + "\".");
            socket.emit("deck:get:one::response", 
                deckManager.decks[name]
            );
        });

        socket.on("deck:import", function(obj){
            if(opts.debug) console.log("Importing Bulk Cards to Deck \"" + obj.name + "\".");
            console.log(obj);
            var cards = deckManager._inflate(obj.cards.split("\n"));
            for(var i=0; i<cards.length; i++){
                var card = cards[i];
                deckManager.decks[obj.name].push(card);
            }
            console.log("Finished Importing Cards.");
            socket.emit("deck:import::response", true);
        });
    };

    deckManager.delete = function(name){
        delete deckManager.decks[name];
        delete deckManager.manifest[name];
        var fullPath = opts.data + "/decks/" + name + ".mbc";
        console.log("Deleting file \"" + fullPath + "\".");
        fs.unlinkSync(fullPath);
    };

    deckManager.save = function(name, callback){
        var deck = deckManager.decks[name];
        var timestamp = new Date();

        if(opts.debug) console.log("Saving Deck \"" + name + "\".");
        fs.writeFileSync(opts.data + "/decks/manifest.json", JSON.stringify(deckManager.manifest));

        var out = deckManager._deflate(name).join("\n") + "\n";
        fs.writeFileSync(opts.data + "/decks/" + name.replace("/", "\\\/") + ".mbc", out);

        if(opts.debug) console.log("Deck \"" + name + "\" Saved.");

        if(typeof callback === 'function'){
            callback();
        }
    };

    deckManager.add = function(name, card){
        console.log("Adding card " + card.name + " to deck " + name + ".");
        deckManager.decks[name].push(card);  
    };

    deckManager.remove = function(name, card){
        console.log("Removing card " + card.name + " from deck " + name + ".");
        for(var i=0; i<deckManager.decks[name].length; i++){
            var deckCard = deckManager.decks[name][i];
            if(deckCard.name === card.name){
                deckManager.decks[name].splice(i, 1);
                break;
            }
        };

    };

    
    /* Private Methods */

    deckManager._loadDecks = function(callback){
        if(opts.debug) console.log("Loading Decks"); 

        deckManager.manifest = JSON.parse(fs.readFileSync(opts.data + "/decks/manifest.json").toString());

        var deckNames = Object.keys(deckManager.manifest);
        for(var i=0; i<deckNames.length; i++){
            var deckName = deckNames[i]; 
            var deckInfo = deckManager.manifest[deckName];

            if(opts.debug) console.log("Loading deck \"" + deckName + "\"."); 

            try{
                var deckString = fs.readFileSync(opts.data + "/decks/" + deckName + ".mbc").toString()
            }
            catch (e){
                console.log("Failed to load deck: \"" + deckName + "\".");
                delete deckManager.manifest[deckName];
                continue;
            }

            var inflated = deckManager._inflate(deckString.split("\n"));
            deckManager.decks[deckName] = inflated;
        }
        if(opts.debug) console.log("Loaded decks: " + Object.keys(deckManager.decks));

        if(typeof callback === 'function'){
            callback(deckManager.decks);
        }
        else{
            return deckManager.decks;
        }
    };

    deckManager._deflate = function(name, callback){
        if(opts.debug) console.log("Defalting Cards");
        var cardNames = [];

        for(var i=0; i<deckManager.decks[name].length; i++){
            var card = deckManager.decks[name][i];
            cardNames.push(card.name);
        }
        var cardCounts = {};
        cardNames.forEach(function(x){ cardCounts[x] = (cardCounts[x] || 0)+1; });

        var deflated = [];
        for(var i=0; i<Object.keys(cardCounts).length; i++){
            var card = Object.keys(cardCounts)[i];
            var count = cardCounts[card];
            deflated.push(nodeUtil.format("%s %s", count, card));
        }

        if(typeof callback === 'function'){
            callback(deflated);
        }
        else{
            return deflated;
        }
    };

    deckManager._inflate = function(deflatedCards, callback){
        if(opts.debug) console.log("Inflating Cards");

        var inflated = [];
        for(var i=0; i<deflatedCards.length; i++){
            var str = deflatedCards[i];
            var count = str.substr(0, str.indexOf(' '));
            var card = str.substr(str.indexOf(' ')+1);
            var fullCard = cards.get(card);

            for(var j=0; j<count; j++){
                inflated.push(fullCard); 
            }
        }

        if(typeof callback === 'function'){
            callback(inflated);
        }
        else{
            return inflated;
        }

    };


    /* Load Decks */
    if(!fs.existsSync(opts.data + "/decks")){
        utils.mkdirSync(opts.data + "/decks");
    }
    if(!fs.existsSync(opts.data + "/decks/manifest.json")){
        fs.writeFileSync(opts.data + "/decks/manifest.json", JSON.stringify({}));
    }
    deckManager._loadDecks();
    return deckManager;
}
