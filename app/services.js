'use strict';

var mbServices = angular.module('magicBuddy.services', []);

mbServices.factory("collectionManager", ["$http", "socket", function($http, socket){
    var collectionManager = {};
    collectionManager.collection = [];

    collectionManager.add = function(card){
        socket.emit("collection:card", card);
        collectionManager.get();
    };

    collectionManager.remove = function(card){
        socket.emit("collection:remove", card);
        collectionManager.get();
    };

    collectionManager.get = function(){
        socket.emit("collection:get");
    };

    //register listeners
    socket.on("collection:get::response", function(resp){
        collectionManager.collection = resp;
    });

    // Get the collection
    collectionManager.get();
    
    return collectionManager;
}]);
