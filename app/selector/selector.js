'use strict';

angular.module('magicBuddy.selector', [])
.controller('SelectorCtrl', ["$rootScope", "$scope", "socket", "collectionManager", "deckManager", "cardManager", "bsLoadingOverlayService", function($rootScope, $scope, socket, collectionManager, deckManager, cardManager, bsLoadingOverlayService) {

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
        else if($scope.type === "deck"){
            if(cardId !== null && cardId !== undefined){
                    bsLoadingOverlayService.start();
                    var card = cardManager.searchResults[cardId];
                    if(event.shiftKey){
                      deckManager.add(card).promise.then(function(){
                        deckManager.add(card).promise.then(function() {
                          deckManager.add(card).promise.then(function(){
                            deckManager.add(card).promise.then(function(){
                              deckManager.get(deckManager.name).promise.then(function(){
                                bsLoadingOverlayService.stop();
                              });
                            })
                          })
                        })
                      })
                    }
                    else{
                      deckManager.add(card).promise.then(function(){
                        deckManager.get(deckManager.name).promise.then(function(){
                          bsLoadingOverlayService.stop();
                        });
                      })
                    }
            }
            else{
                if(cardManager.searchResults.length > 0){
                    //add search results index 0
                    deckManager.add(cardManager.searchResults[0]);
                }
            }
        }
    }

    $scope.viewCard = function(index){
        var card = cardManager.searchResults[index];
        $rootScope.$broadcast("viewer:showCard", card);
    }

    $scope.hideCard = function(){
        $rootScope.$broadcast("viewer:hideCard");
    }
}]);
