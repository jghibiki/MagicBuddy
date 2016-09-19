'use strict';

var decksModule = angular.module('magicBuddy.decks')


var inject = [
    "$stateParams",
    "$scope",
    "deckManager", 
    "cardManager", 
    "$mdDialog", 
    "$mdMedia", 
    "$sce", 
    "bsLoadingOverlayService",
    DeckViewerCtrl
]
decksModule.controller('DeckViewerCtrl',  inject);
function DeckViewerCtrl($stateParams, $scope, deckManager, cardManager, $mdDialog, $mdMedia, $sce, bsLoadingOverlayService) {
    var vm = this;
    
    // start loader
    bsLoadingOverlayService.start();
        
    vm.name="Viewer"
    vm.type = "deck";
    vm.deckManager = deckManager;
    vm.deckName = $stateParams.deckName;
    vm.showColorless = false;
    vm.startingHand = {
        deck: [],
        cardCount: 7,
        hand: [],
    };

    vm.text = "{g}{t} abc {t}";

    vm.loadDeck = function(){
        bsLoadingOverlayService.start();  
        vm.deckName = $stateParams.deckName;
		deckManager.get($stateParams.deckName).promise.finally(function(){
			bsLoadingOverlayService.stop();  
		});
    };


	vm.showCard = function(card, ev){
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
		$mdDialog.show({
		  controller: DialogController,
		  templateUrl: 'deck/viewer/card.tmpl.html',
		  parent: angular.element(document.body),
		  targetEvent: ev,
		  clickOutsideToClose:true,
		  fullscreen: useFullScreen,
		  locals: {
			card: card
		  }
		})
		$scope.$watch(function() {
		  return $mdMedia('xs') || $mdMedia('sm');
		}, function(wantsFullScreen) {
		  vm.customFullscreen = (wantsFullScreen === true);
		});
	};

	function DialogController($mdDialog, $scope, card) {
		$scope.card = card
		$scope.symbolRe = /[^{}]+(?=\})/g;
		$scope.viewerMode = "both";

		$scope.hide = function() {
		  $mdDialog.hide();
		};
		$scope.cancel = function() {
		  $mdDialog.cancel();
		};
		$scope.answer = function(answer) {
		  $mdDialog.hide(answer);
		};

		$scope.getUnderName = function(){
			return encodeURI($scope.card.name
					.toLowerCase()
					.replace(/ /g, "_")
					.replace(/\'/g, "")
					.replace(/-/g, "_")
					.replace(/\?/g, "")
					.replace(/,/g, "")
					.replace(/:/g, "") + ".jpg");
		}

		$scope.showImage = function(){
			return $scope.viewerMode == "image";
		}

		$scope.showText = function(){
			return $scope.viewerMode == "text";
		}

		$scope.showBoth = function(){
			return $scope.viewerMode == "both";
		}
	}

    /* Initialization */
    vm.loadDeck();

}
