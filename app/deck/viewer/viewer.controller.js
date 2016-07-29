'use strict';

var decksModule = angular.module('magicBuddy.decks.viewer', ['ui.router', angularDragula(angular)])


var inject = [
    "$stateParams",
    "deckManager", 
    "cardManager", 
    "$mdDialog", 
    "$mdMedia", 
    "$sce", 
    "bsLoadingOverlayService",
    DeckViewerCtrl
]
decksModule.controller('DeckViewerCtrl',  inject);
function DeckViewerCtrl($stateParams, deckManager, cardManager, $mdDialog, $mdMedia, $sce, bsLoadingOverlayService) {
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


    vm.loadDeck = function(){
        bsLoadingOverlayService.start();  
        vm.deckName = $stateParams.deckName;
		deckManager.get($stateParams.deckName).promise.finally(function(){
			bsLoadingOverlayService.stop();  
		});
    };

    vm.viewCard = function(index){
        var card = deckManager.pretty[index];
        vm.$broadcast("viewer:showCard", card);
    }

    vm.hideCard = function(){
        vm.$broadcast("viewer:hideCard");
    }


    vm.bulkImport = function(){
        deckManager.bulkImport(vm.importCards);
        vm.importCards = "";
    }

    vm.toggleColorless = function(){
        vm.showColorless = !(vm.showColorless);
    }

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
       if(deckManager.deck.length < 7){
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
       vm.startingHand.deck = deckManager.deck.slice(0);
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
           vm.startingHand.deck = deckManager.deck.slice(0);
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


	vm.showCard = function(card, ev){
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
		$mdDialog.show({
		  controller: DialogController,
		  templateUrl: 'deck/card.tmpl.html',
		  parent: angular.element(document.body),
		  targetEvent: ev,
		  clickOutsideToClose:true,
		  fullscreen: useFullScreen,
		  locals: {
			card: card
		  }
		})
		vm.$watch(function() {
		  return $mdMedia('xs') || $mdMedia('sm');
		}, function(wantsFullScreen) {
		  vm.customFullscreen = (wantsFullScreen === true);
		});
	}    

	function DialogController(vm, $mdDialog, card) {
		vm.card = card
		vm.symbolRe = /[^{}]+(?=\})/g;
		vm.viewerMode = "both";

		vm.hide = function() {
		  $mdDialog.hide();
		};
		vm.cancel = function() {
		  $mdDialog.cancel();
		};
		vm.answer = function(answer) {
		  $mdDialog.hide(answer);
		};


		vm.manaSymbols = function(){
			var symbols = [];
			if(vm.card.type !== "Land" && vm.card.type !== "Scheme"){

			  vm.card.manaCost.match(vm.symbolRe).forEach(function(el){
				  symbols.push(el.toLowerCase());
			  });
			}

			return symbols
		}

		vm.getUnderName = function(){
			return encodeURI(vm.card.name
					.toLowerCase()
					.replace(/ /g, "_")
					.replace(/\'/g, "")
					.replace(/-/g, "_")
					.replace(/\?/g, "")
					.replace(/,/g, "")
					.replace(/:/g, "") + ".jpg");
		}

		vm.showImage = function(){
			return vm.viewerMode == "image";
		}

		vm.showText = function(){
			return vm.viewerMode == "text";
		}

		vm.showBoth = function(){
			return vm.viewerMode == "both";
		}

		vm.cardText = function(){
			var text = vm.card.text;
			text = text.replace(vm.symbolRe, function(x){
				return "<span class='mi mi-mana mi-" + x.toLowerCase() + "'></span>"
			});
			text = text.replace(/{/g, "").replace(/}/g, "");
			return $sce.trustAsHtml(text);
		}

	}

    /* Initialization */
    vm.loadDeck();

}
