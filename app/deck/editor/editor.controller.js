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
decksModule.controller('DeckEditorCtrl',  DeckEditorCtrl);
function DeckEditorCtrl($stateParams, $scope, deckManager, cardManager, dragulaService, $mdDialog, $mdMedia, $sce, bsLoadingOverlayService) {
    // start loader
    bsLoadingOverlayService.start();
    var vm = this;
    
    vm.name = "Editor";
    vm.deckName = $stateParams.deckName;
    $scope.type = "deck";
	vm.selected = [];
    vm.deckManager = deckManager;
    vm.deckManager.selectDeck($stateParams.deckName);
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



    vm.saveDeck = function(){ 
        vm.deckManager.save().then(function(){
            alert("Finished Saving");
        });
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
        $scope.$broadcast("viewer:showCard", card);
    }

    vm.hideCard = function(){
        $scope.$broadcast("viewer:hideCard");
    }


    vm.toggleColorless = function(){
        vm.showColorless = !(vm.showColorless);
    }

    /* Initialization */
    vm.loadDeck();

}
