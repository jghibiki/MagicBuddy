'use strict';

var decksModule = angular.module('magicBuddy.decks.probabilities', ['ui.router', angularDragula(angular)])


DeckViewerCtrl.$inject = [
    "$stateParams",
    "$scope", 
    "deckManager", 
    "bsLoadingOverlayService"
]
decksModule.controller('DeckProbabilitiesCtrl',  DeckViewerCtrl);
function DeckViewerCtrl($stateParams, $scope, deckManager, bsLoadingOverlayService) {
    // start loader
    bsLoadingOverlayService.start();
    var vm = this;
    
    vm.name = "Probabilities";
    vm.deckName = $stateParams.deckName;
    $scope.type = "deck";
    vm.deckManager = deckManager;

    vm.loadDeck = function(){
        bsLoadingOverlayService.start();  
        vm.deckName = $stateParams.deckName;
        vm.deckManager.selectDeck(vm.deckName);
		vm.deckManager.get($stateParams.deckName).promise.finally(function(){
			bsLoadingOverlayService.stop();  
		});
    };

    /* Initialization */
    vm.loadDeck();

}
