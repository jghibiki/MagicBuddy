'use strict';

var decksModule = angular.module('magicBuddy.decks.stats', ['ui.router', angularDragula(angular)])


DeckViewerCtrl.$inject = [
    "$stateParams",
    "$scope", 
    "deckManager", 
    "cardManager", 
    "$sce", 
    "bsLoadingOverlayService"
]
decksModule.controller('DeckStatsCtrl',  DeckStatsCtrl);
function DeckStatsCtrl($stateParams, $scope, deckManager, cardManager, $sce, bsLoadingOverlayService) {
    // start loader
    bsLoadingOverlayService.start();
    var vm = this;
    
    $scope.type = "deck";

    vm.name = "Statistics";
    vm.deckName = $stateParams.deckName;
    vm.deckManager = deckManager;
    vm.showColorless = false;


    vm.loadDeck = function(){
        bsLoadingOverlayService.start();  
        vm.deckName = $stateParams.deckName;
        vm.deckManager.selectDeck(vm.deckName);
		vm.deckManager.get($stateParams.deckName).promise.finally(function(){
			bsLoadingOverlayService.stop();  
		});
    };

    vm.toggleColorless = function(){
        vm.showColorless = !(vm.showColorless);
    }

    /* Initialization */
    vm.loadDeck();

}
