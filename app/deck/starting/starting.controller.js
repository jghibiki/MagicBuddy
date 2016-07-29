'use strict';

var decksModule = angular.module('magicBuddy.decks.editor', ['ui.router', angularDragula(angular)])


DeckViewerCtrl.$inject = [
    "$stateParams",
    "$scope", 
    "deckManager", 
    "cardManager", 
    "dragulaService", 
    "$mdDialog", 
    "$mdMedia", 
    "$sce", 
    "bsLoadingOverlayService"
]
decksModule.controller('DeckEditorCtrl',  DeckViewerCtrl);
function DeckViewerCtrl($stateParams, $scope, deckManager, cardManager, dragulaService, $mdDialog, $mdMedia, $sce, bsLoadingOverlayService) {
    // start loader
    bsLoadingOverlayService.start();
    var vm = this;
    
    vm.name = "Editor";
    vm.deckName = $stateParams.deckName;
    $scope.type = "deck";
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


    dragulaService.options($scope, 'bag-one', {
        copy: function (el, source) {
          return el.className.indexOf('you-may-copy-us') > -1;
        },
        copySortSource: false,
        moves: function(el, source, handle, sibling){
            return (el.className.indexOf("you-may-copy-us") > -1) || el.className.indexOf("you-may-remove-us") > -1;
        },
        accepts: function(el, target, source, sibling){
            if(el.className.indexOf("you-may-copy-us") > -1 && target.className.indexOf("copy-target") > -1){
                return true;
            }
            else if (el.className.indexOf("you-may-remove-us") > -1 && target.className.indexOf("remove-target") > -1){
                return true;
            }
            else if (source === target){
                return true;
            }
            else{
                return false;
            }
        },
        revertOnSpill: true,
    });

    $scope.$on("bag-one.drop", function(e, el, target, source, sibling){
        if(el.hasClass("you-may-copy-us") && target.hasClass("copy-target")){
            var newCard = el.text();
            
            for(var i=0; i<cardManager.searchResults.length; i++){
                var card = cardManager.searchResults[i];
                if(card.name === newCard){
                    bsLoadingOverlayService.start();
                    if(event.shiftKey){
                      vm.deckManager.add(card).promise.then(function(){
                        vm.deckManager.add(card).promise.then(function() {
                          vm.deckManager.add(card).promise.then(function(){
                            vm.deckManager.add(card).promise.then(function(){
                              vm.deckManager.get($stateParams.deckName).promise.then(function(){
                                bsLoadingOverlayService.stop();
                              });
                            })
                          })
                        })
                      })
                    }
                    else{
                      vm.deckManager.add(card).promise.then(function(){
                        vm.deckManager.get($stateParams.deckName).promise.then(function(){
                          bsLoadingOverlayService.stop();
                        });
                      })
                    }
                    break;
                }
            }
            el.remove();
        }
        else if(el.hasClass("you-may-remove-us") && target.hasClass("remove-target") ){
            var str = el.text();
            var count = str.substr(0, str.indexOf(' '));
            var newCard = str.substr(str.indexOf(' ')+1);
            
            for(var i=0; i<vm.deckManager.deck.length; i++){
                var card = vm.deckManager.deck[i];
                if(card.name === newCard){
                    if(event.shiftKey){
                      vm.deckManager.remove(card).promise.then(function(){
                        vm.deckManager.remove(card).promise.then(function(){
                          vm.deckManager.remove(card).promise.then(function(){
                            vm.deckManager.remove(card).promise.then(function(){
                              vm.deckManager.get($stateParams.deckName).promise.then(function(){

                              });
                            });
                          })
                        })
                      })
                    }
                    else{
                      vm.deckManager.remove(card).promise.then(function(){
                        vm.deckManager.get($stateParams.deckName).promise.then(function(){
                        
                        });
                      })
                    }
                    break;
                }
            }
            el.remove();
        }

    });



    vm.saveDeck = function(){ vm.deckManager.save();
    };
    
    vm.deleteDeck = function(){
        vm.deckManager.delete();
        vm.deckManager.name = "";
        vm.deckManager.get();
    };

    vm.loadDeck = function(){
        bsLoadingOverlayService.start();  
        vm.deckName = $stateParams.deckName;
        vm.deckManager.selectDeck(vm.deckName);
		vm.deckManager.get($stateParams.deckName).promise.finally(function(){
			bsLoadingOverlayService.stop();  
		});
    };

    vm.viewCard = function(index){
        var card = vm.deckManager.pretty[index];
        vm.$broadcast("viewer:showCard", card);
    }

    vm.hideCard = function(){
        vm.$broadcast("viewer:hideCard");
    }


    vm.bulkImport = function(){
        vm.deckManager.bulkImport(vm.importCards);
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
	// deferred 2s to give time for the animation
	setTimeout(function(){
        vm.loadDeck();
	}.bind(this), 2000);

}
