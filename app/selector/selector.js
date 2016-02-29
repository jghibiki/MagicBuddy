'use strict';

angular.module('magicBuddy.selector', [])
.controller('SelectorCtrl', ["$scope","$parentScope", "socket", "collectionManager", function($scope, $parentScope, socket, collectionManager) {

    $scope.searchQuery = null;
    $scope.searchResults = [];

    socket.on("cards:search::response", function(resp){
        $scope.searchResults = resp;
    });

    $scope.search = function(){
            
        socket.emit("cards:search", $scope.searchQuery);
    };

    $scope.add = function(cardId){
        // ???
    }
}]);
