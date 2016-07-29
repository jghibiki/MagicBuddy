'use strict';

var decksModule = angular.module('magicBuddy.decks.import', ['ui.router', angularDragula(angular)])


DeckImportCtrl.$inject = [
    "$stateParams",
    "$state",
    "deckManager", 
    "bsLoadingOverlayService"
]
decksModule.controller('DeckImportCtrl',  DeckImportCtrl);
function DeckImportCtrl($stateParams, $state, deckManager, bsLoadingOverlayService) {
    // start loader
    var vm = this;
    
    vm.name = "Import";
    vm.deckName = $stateParams.deckName;
    vm.deckManager = deckManager;
    vm.deckManager.selectDeck($stateParams.deckName);
    vm.importCards = "";

    vm.bulkImport = function(){
        bsLoadingOverlayService.start();
        vm.deckManager.bulkImport(vm.importCards).promise.finally(function(){
            bsLoadingOverlayService.stop();
            $state.go('decks.edit', $stateParams)
        });
    }


}
