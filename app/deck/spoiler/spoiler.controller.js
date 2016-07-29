'use strict';

var decksModule = angular.module('magicBuddy.decks.spoiler', ['ui.router', angularDragula(angular)])


DeckViewerCtrl.$inject = [
    "$stateParams",
    "$scope", 
    "deckManager", 
    "bsLoadingOverlayService"
]
decksModule.controller('DeckSpoilerCtrl',  DeckSpoilerCtrl);
function DeckSpoilerCtrl($stateParams, $scope, deckManager, bsLoadingOverlayService) {
    // start loader
    bsLoadingOverlayService.start();
    var vm = this;
    
    vm.name = "Visual Spoiler";
    vm.deckName = $stateParams.deckName;
    vm.deckManager = deckManager;


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

    /* Initialization */
    vm.loadDeck();

}
