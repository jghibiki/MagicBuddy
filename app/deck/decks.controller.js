'use strict';

var deckModule = angular.module('magicBuddy.decks', ['ui.router', angularDragula(angular)])

deckModule.config(['$stateProvider', function($stateProvider) {

  $stateProvider
    .state('decks', {
        url: '/decks',
        templateUrl: 'deck/decks.html',
        controller: 'DecksCtrl',
        controllerAs: 'decks'
    });
}]);


DecksCtrl.$inject = [ 
	"$scope", 
	"deckManager", 
	"bsLoadingOverlayService"
];
deckModule.controller('DecksCtrl',  DecksCtrl);

function DecksCtrl($scope, deckManager, bsLoadingOverlayService) {

    // start loader
    bsLoadingOverlayService.start();
    
    this.name = 'DecksCtrl';
    this.newDeckName = "";
    this.deckNames = [];


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
            deckManager.create($scope.newDeckName);
            $scope.newDeckName = "";
        }
    };

	// get list of decks
    deckManager.get().promise.then(function(deckNames){
        this.deckNames = deckNames; 
        bsLoadingOverlayService.stop();  
    }.bind(this));

}
