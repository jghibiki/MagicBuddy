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
    $scope.toolMode = 0;
    $scope.toolModes = {
        editor: 0,
        deckStats: 1,
        visualSpoiler: 2,
        startingHand: 3,
        probabilities: 4,
        notes: 5
    };
    $scope.startingHand = {
        deck: [],
        cardCount: 7,
        hand: [],
    };

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
                    if(event.shiftKey){
                        deckManager.add(card);
                        deckManager.add(card);
                        deckManager.add(card);
                        deckManager.add(card);
                    }
                    else{
                        deckManager.add(card);
                    }
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
                    if(event.shiftKey){
                        deckManager.remove(card);
                        deckManager.remove(card);
                        deckManager.remove(card);
                        deckManager.remove(card);
                    }
                    else{
                        deckManager.remove(card);
                    }
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

    $scope.saveDeck = function(){ deckManager.save();
    };
    
    $scope.deleteDeck = function(){
        deckManager.delete();
        deckManager.name = "";
        deckManager.get();
    };

    $scope.loadDeck = function(name){
        $scope.deckManager.name = name;
        $scope.deckManager.get(name);
        $scope.deckManager.getNotes();
    };

    $scope.viewCard = function(index){
        var card = deckManager.pretty[index];
        $scope.$broadcast("viewer:showCard", card);
    }

    $scope.hideCard = function(){
        $scope.$broadcast("viewer:hideCard");
    }


    $scope.bulkImport = function(){
        deckManager.bulkImport($scope.importCards);
        $scope.importCards = "";
    }

    $scope.toggleColorless = function(){
        $scope.showColorless = !($scope.showColorless);
    }

    $scope.getUrl = function(card){
        var url = encodeURI(card.name
                .toLowerCase()
                .replace(/ /g, "_")
                .replace(/\'/g, "")
                .replace(/-/g, "_")
                .replace(/\?/g, "")
                .replace(/:/g, "") + ".jpg");

        return "http://www.mtg-forum.de/db/karten/" + url[0] + "/" + url;
    }


    /* Starting Hand Functions */

    $scope.newHand = function(){
       $scope.startingHand.deck = deckManager.deck.slice(0);
       $scope.startingHand.hand = [];
       $scope.startingHand.cardCount = 7;
        
       for(var i=0; i<$scope.startingHand.cardCount; i++){
           $scope.addCardToHand();
        }

       
    }

    $scope.addCardToHand = function(){
        if($scope.startingHand.deck.length > 0){
            var randomCard = $scope.startingHand.deck[ Math.floor( Math.random() * $scope.startingHand.deck.length )]

            $scope.startingHand.hand.push(randomCard);

            var index = $scope.startingHand.deck.indexOf(randomCard);
            if(index > -1) $scope.startingHand.deck.splice(index, 1);
        }
        else{
            alert("No more cards left in deck to add to hand. Try a new hand.");
        }
    }

    $scope.mulligan = function(){

       var cardCount = $scope.startingHand.hand.length - 1
        if(cardCount > 0){
           $scope.startingHand.deck = deckManager.deck.slice(0);
           $scope.startingHand.hand = [];
           $scope.startingHand.cardCount = cardCount;

           for(var i=0; i<$scope.startingHand.cardCount; i++){
               $scope.addCardToHand();
            }
        }
        else{
            alert("Cannot mulligan any more. Try a new hand.");
        }
    }

    /* Initialization */
    deckManager.get();

}]);
