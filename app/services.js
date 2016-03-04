'use strict';

var mbServices = angular.module('magicBuddy.services', []);

mbServices.factory("collectionManager", ["socket", function(socket){
    var collectionManager = {};
    collectionManager.collection = [];
    collectionManager.pretty = [];

    collectionManager.add = function(card){
        socket.emit("collection:add", card);
        collectionManager.get();
    };

    collectionManager.remove = function(card){
        socket.emit("collection:remove", card);
        collectionManager.get();
    };

    collectionManager.get = function(){
        socket.emit("collection:get");
    };

    collectionManager.save = function(){
        socket.emit("collection:save");
    };

    collectionManager.bulkImport = function(cards){
        socket.emit("collection:import", cards);
        collectionManager.get();
    };


    //register listeners
    socket.on("collection:get::response", function(resp){
        collectionManager.collection = resp;


        //build pretty collection
        var cardCounts = {};
        collectionManager.collection.forEach(function(x){ cardCounts[x.name] = (cardCounts[x.name] || 0)+1; });
        var seen = {};
        var unique = collectionManager.collection.filter(function(item){
            return seen.hasOwnProperty(item.name) ? false : (seen[item.name] = true);
        });

        for(var idx in unique){
            unique[idx].count = cardCounts[unique[idx].name];                 
        }
        collectionManager.pretty = unique;

    });


    socket.on("collection:resolution::alert", function(){
        var conf = confirm("There was a recent checkpoint click \"OK\" to recover data?");
        socket.emit("collection:checkpoint:resolve", conf);
        socket.emit("collection:get");
    });

    socket.on("collection:save::response", function(resp){
        alert("Collection Saved!");
    });

    collectionManager.get();

    
    return collectionManager;
}]);

mbServices.factory("cardManager", ["socket", function(socket){
    var cardManager = {};
    cardManager.searchResults = [];



    socket.on("cards:search::response", function(resp){
        cardManager.searchResults = resp;
    });

    cardManager.search= function(query){
        socket.emit("cards:search", query);
    }

    
    return cardManager;
}]);

mbServices.factory("deckManager", ["socket", function(socket){
    var deckManager = {};
    deckManager.deck = [];
    deckManager.names = [];
    deckManager.name = "";
    deckManager.path = "/";

    deckManager.pretty = [];

    /* API */

    deckManager.add = function(card){
        socket.emit("collection:add", {
            name: deckManager.name,
            card: card
        });
        deckManager.get();
    };

    deckManager.remove = function(card){
        socket.emit("collection:remove", {
            card: card,
            name: deckManager.name
        });
        deckManager.get();
    };

    deckManager.get = function(name){
        if(name === undefined || name === null){
            socket.emit("collection:get:all", deckManager.path);
        }
        else{
            socket.emit("collection:get:one", {
                name: name,
                path: deckManager.path
            });
        }
    };

    deckManager.save = function(){
        socket.emit("collection:save");
    };

    deckManager.bulkImport = function(cards){
        socket.emit("collection:import", cards);
        collectionManager.get();
    };

    /* Listeners */
    //register listeners
    
    socket.on("collection:get:one::response", function(resp){

        deckManager.deck= resp.deck;
        deckManager.name = resp.name;

        //build pretty collection
        var cardCounts = {};
        deckManager.deck.forEach(function(x){ cardCounts[x.name] = (cardCounts[x.name] || 0)+1; });
        var seen = {};
        var unique = deckManager.deck.filter(function(item){
            return seen.hasOwnProperty(item.name) ? false : (seen[item.name] = true);
        });

        for(var idx in unique){
            unique[idx].count = cardCounts[unique[idx].name];                 
        }
        deckManager.pretty = unique;

    });

    socket.on("collection:get:all::response", function(resp){
        deckManager.names = resp
    });

    deckManager.get();

    return deckManager;

}]);
