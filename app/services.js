'use strict';

var mbServices = angular.module('magicBuddy.services', []);

mbServices.factory("collectionManager", ["socket", function(socket){
    var collectionManager = {};
    collectionManager.collection = [];

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


    //register listeners
    socket.on("collection:get::response", function(resp){
        collectionManager.collection = resp;
    });

    socket.on("collection:save::response", function(resp){
        alert("Collection Saved!");
    });

    // Get the collection
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
