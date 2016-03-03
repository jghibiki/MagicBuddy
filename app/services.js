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
