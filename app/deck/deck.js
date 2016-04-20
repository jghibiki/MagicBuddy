'use strict';

angular.module('magicBuddy.deck', ['ngRoute', angularDragula(angular)])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/deck', {
    templateUrl: 'deck/deck.html',
    controller: 'DeckCtrl'
  });
}])

.controller('DeckCtrl', ["$scope", "deckManager", "cardManager", "dragulaService", function($scope, deckManager, cardManager, dragulaService) {
    
    $scope.type = "deck";
    $scope.deckManager = deckManager;
    $scope.newDeckName = "";
    $scope.importCards = "";
    $scope.showColorless = false;

    dragulaService.options($scope, 'bag-one', {
        copy: function (el, source) {
          return el.className.indexOf('you-may-copy-us') > -1;
        },
        copySortSource: false,
        moves: function(el, source, handle, sibling){
            return (el.className.indexOf("you-may-copy-us") > -1) || el.className.indexOf("you-may-remove-us") > -1;
        },
        accepts: function(el, target, source, sibling){
            if(el.className.indexOf("you-may-copy-us") > -1 && target.className.indexOf("copy-target") > -1){
                return true;
            }
            else if (el.className.indexOf("you-may-remove-us") > -1 && target.className.indexOf("remove-target") > -1){
                return true;
            }
            else if (source === target){
                return true;
            }
            else{
                return false;
            }
        },
        revertOnSpill: true,
    });

    $scope.$on("bag-one.drop", function(e, el, target, source, sibling){
        if(el.hasClass("you-may-copy-us") && target.hasClass("copy-target")){
            var newCard = el.text();
            
            for(var i=0; i<cardManager.searchResults.length; i++){
                var card = cardManager.searchResults[i];
                if(card.name === newCard){
                    deckManager.add(card);
                    break;
                }
            }
            el.remove();
        }
        else if(el.hasClass("you-may-remove-us") && target.hasClass("remove-target") ){
            var str = el.text();
            var count = str.substr(0, str.indexOf(' '));
            var newCard = str.substr(str.indexOf(' ')+1);
            
            for(var i=0; i<deckManager.deck.length; i++){
                var card = deckManager.deck[i];
                if(card.name === newCard){
                    deckManager.remove(card);
                    break;
                }
            }
            el.remove();
        }

    });


    $scope.createDeck = function(){
        if($scope.newDeckName.indexOf("/") != -1){
            alert("Deck Names cannot contain '/'");
        }
        else{
            deckManager.create($scope.newDeckName);
            $scope.newDeckName = "";
        }
    };

    $scope.saveDeck = function(){
        deckManager.save();
    };
    
    $scope.deleteDeck = function(){
        deckManager.delete();
        deckManager.name = "";
        deckManager.get();
    };

    $scope.loadDeck = function(name){
        $scope.deckManager.name = name;
        $scope.deckManager.get(name);
    };

    $scope.viewCard = function(index){
        var card = deckManager.pretty[index];
        $scope.$broadcast("viewer:showCard", card);
    }

    $scope.hideCard = function(){
        $scope.$broadcast("viewer:hideCard");
    }

    deckManager.get();

    $scope.bulkImport = function(){
        deckManager.bulkImport($scope.importCards);
        $scope.importCards = "";
    }

    $scope.toggleColorless = function(){
        $scope.showColorless = !($scope.showColorless);
    }
}]);
