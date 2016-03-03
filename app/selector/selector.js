'use strict';

angular.module('magicBuddy.selector', [])
.controller('SelectorCtrl', ["$scope", "socket", "collectionManager", "cardManager", function($scope, socket, collectionManager, cardManager) {

    // ensure that scope has a type field from parent
    if($scope.type === undefined){
        throw new Error("Scope missing 'type' selector will not know which mode to be in.");
    }

    $scope.searchQuery = null;


    $scope.search = function(){
        cardManager.search($scope.searchQuery);
    };

    $scope.getSearchResults = function(){
        return cardManager.searchResults;
    }

    $scope.add = function(cardId, $event){
        if($scope.type === "collection"){
            if(cardId !== null && cardId !== undefined){
                if($event.shiftKey){
                    //Add 4 if shift is held
                    collectionManager.add(cardManager.searchResults[cardId]);
                    collectionManager.add(cardManager.searchResults[cardId]);
                    collectionManager.add(cardManager.searchResults[cardId]);
                    collectionManager.add(cardManager.searchResults[cardId]);
                }
                else{
                    collectionManager.add(cardManager.searchResults[cardId]);
                }
            }
            else{
                if(cardManager.searchResults.length > 0){
                    collectionManager.add(cardManager.searchResults[0]);
                }
            }
        }
    }
}]);
