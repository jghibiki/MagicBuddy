'use strict';

var deckModule = angular.module('magicBuddy.decks.listing', ['ui.router', angularDragula(angular)])


DecksCtrl.$inject = [ 
	"$scope", 
	"deckManager", 
	"bsLoadingOverlayService"
];
deckModule.controller('DecksCtrl',  DecksCtrl);

function DecksCtrl($scope, deckManager, bsLoadingOverlayService) {

    var vm = this;


    // start loader
    bsLoadingOverlayService.start();
    
    vm.name = 'DecksCtrl';
    vm.newDeckName = "";
    vm.deckNames = [];


    $scope.createDeck = function(){
        if($scope.newDeckName.indexOf("/") != -1){
            $mdDialog.show(
                $mdDialoDialog.alert()
                .clickOutsideToClose(true)
                .title("Uh oh!")
                .textContent('Deck names cannot contain "/"')
                .ariaLabel('Deck names cannot contain "/"')
                .ok('Got it!')
            );
        }
        else{
            deckManager.create($scope.newDeckName).promise.then(function(){
                deckManager.get().promise.then(function(deckNames){
                    vm.deckNames = deckNames; 
                    bsLoadingOverlayService.stop();  
                });
            })

            $scope.newDeckName = "";
        }
    };

	// get list of decks
	deckManager.get().promise.then(function(deckNames){
		vm.deckNames = deckNames; 
		bsLoadingOverlayService.stop();  
	}.bind(vm));

}
