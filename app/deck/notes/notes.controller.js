'use strict';

var decksModule = angular.module('magicBuddy.decks.notes', ['ui.router', angularDragula(angular)])


DeckNotesCtrl.$inject = [
    "$stateParams",
    "deckManager", 
    "bsLoadingOverlayService"
]
decksModule.controller('DeckNotesCtrl',  DeckNotesCtrl);
function DeckNotesCtrl($stateParams, deckManager, bsLoadingOverlayService) {
    // start loader
    bsLoadingOverlayService.start();
    var vm = this;
    
    vm.name = "Notes";
    vm.deckName = $stateParams.deckName;
    vm.deckManager = deckManager;

    vm.loadDeck = function(){
        bsLoadingOverlayService.start();  
        vm.deckName = $stateParams.deckName;
        vm.deckManager.selectDeck(vm.deckName);
		vm.deckManager.getNotes($stateParams.deckName).promise.finally(function(){
			bsLoadingOverlayService.stop();  
		});
    };

    vm.saveNotes = function(){
        deckManager.saveNotes().then(function(){
            alert("Saved notes!")
        });
    }

    /* Initialization */
	setTimeout(function(){
        vm.loadDeck();
	}.bind(this), 2000);

}
