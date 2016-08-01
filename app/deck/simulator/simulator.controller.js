'use strict';

var decksModule = angular.module('magicBuddy.decks.sim', ['ui.router', angularDragula(angular)])


DeckStartingHandSimCtrl.$inject = [
    "$stateParams",
    "deckManager", 
    "$mdDialog", 
    "bsLoadingOverlayService"
]
decksModule.controller('DeckStartingHandSimCtrl',  DeckStartingHandSimCtrl);
function DeckStartingHandSimCtrl($stateParams, deckManager, $mdDialog, bsLoadingOverlayService) {
    // start loader
    bsLoadingOverlayService.start();
    var vm = this;
    
    vm.name = "Editor";
    vm.deckName = $stateParams.deckName;
    vm.selected = [];
    vm.deckManager = deckManager;
    vm.newDeckName = "";
    vm.importCards = "";
    vm.showColorless = false;
    vm.startingHand = {
        deck: [],
        cardCount: 7,
        hand: [],
    };


     vm.loadDeck = function(){
        bsLoadingOverlayService.start();  
        vm.deckName = $stateParams.deckName;
        vm.deckManager.selectDeck(vm.deckName);
        vm.deckManager.get($stateParams.deckName).promise.finally(function(){
            bsLoadingOverlayService.stop();  
        });
    };

    vm.getUrl = function(card){
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

    vm.newHand = function(){
       vm.startingHand.hand = [];
       if(vm.deckManager.deck.length < 7){
            $mdDialog.show(
                $mdDialog.alert()
                .clickOutsideToClose(true)
                .title("Uh oh!")
                .textContent("Please add at least 7 cards to your deck before using the Starting Hand Tool.")
                .ariaLabel("Please add at least 7 cards to your deck before using the Starting Hand Tool.")
                .ok('Got it!')
            );
            vm.selectedTabIndex = 0;
            return;
       }
       vm.startingHand.deck = vm.deckManager.deck.slice(0);
       vm.startingHand.cardCount = 7;
        
       for(var i=0; i<vm.startingHand.cardCount; i++){
           vm.addCardToHand();
        }

       
    }

    vm.addCardToHand = function(){
        if(vm.startingHand.deck.length > 0){
            var randomCard = vm.startingHand.deck[ Math.floor( Math.random() * vm.startingHand.deck.length )]

            vm.startingHand.hand.push(randomCard);

            var index = vm.startingHand.deck.indexOf(randomCard);
            if(index > -1) vm.startingHand.deck.splice(index, 1);
        }
        else{
            $mdDialog.show(
                $mdDialog.alert()
                .clickOutsideToClose(true)
                .title("Uh oh!")
                .textContent("No more cards left in deck to add to hand. Try a new hand.")
                .ariaLabel("No more cards left in deck to add to hand. Try a new hand.")
                .ok('Got it!')
            );
        }
    }

    vm.mulligan = function(){

       var cardCount = vm.startingHand.hand.length - 1
        if(cardCount > 0){
           vm.startingHand.deck = vm.deckManager.deck.slice(0);
           vm.startingHand.hand = [];
           vm.startingHand.cardCount = cardCount;

           for(var i=0; i<vm.startingHand.cardCount; i++){
               vm.addCardToHand();
            }
        }
        else{
            $mdDialog.show(
                $mdDialog.alert()
                .clickOutsideToClose(true)
                .title("Uh oh!")
                .textContent("Cannot mulligan any more. Try a new hand.")
                .ariaLabel("Cannot mulligan any more. Try a new hand.")
                .ok('Got it!')
            );
        }
    }

    /* Initialization */
    vm.loadDeck();

}
