'use strict';

angular.module('magicBuddy.deck', ['ngRoute', angularDragula(angular)])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/deck', {
    templateUrl: 'deck/deck.html',
    controller: 'DeckCtrl'
  });
}])

.controller('DeckCtrl', ["$scope", "deckManager", "cardManager", "dragulaService", "$mdDialog", "$mdMedia", "$sce", function($scope, deckManager, cardManager, dragulaService, $mdDialog, $mdMedia, $sce) {
    
    $scope.type = "deck";
	$scope.selected = [];
    $scope.deckManager = deckManager;
    $scope.newDeckName = "";
    $scope.importCards = "";
    $scope.showColorless = false;
    $scope.startingHand = {
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
                    if(event.shiftKey){
                        deckManager.add(card);
                        deckManager.add(card);
                        deckManager.add(card);
                        deckManager.add(card);
                    }
                    else{
                        deckManager.add(card);
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
            
            for(var i=0; i<deckManager.deck.length; i++){
                var card = deckManager.deck[i];
                if(card.name === newCard){
                    if(event.shiftKey){
                        deckManager.remove(card);
                        deckManager.remove(card);
                        deckManager.remove(card);
                        deckManager.remove(card);
                    }
                    else{
                        deckManager.remove(card);
                    }
                    break;
                }
            }
            el.remove();
        }

    });


    $scope.createDeck = function(){
        if($scope.newDeckName.indexOf("/") != -1){
            alert("Deck Names cannot contain '/'");
        }
        else{
            deckManager.create($scope.newDeckName);
            $scope.newDeckName = "";
        }
    };

    $scope.saveDeck = function(){ deckManager.save();
    };
    
    $scope.deleteDeck = function(){
        deckManager.delete();
        deckManager.name = "";
        deckManager.get();
    };

    $scope.loadDeck = function(name){
        $scope.deckManager.name = name;
        $scope.deckManager.get(name);
        $scope.deckManager.getNotes();
    };

    $scope.viewCard = function(index){
        var card = deckManager.pretty[index];
        $scope.$broadcast("viewer:showCard", card);
    }

    $scope.hideCard = function(){
        $scope.$broadcast("viewer:hideCard");
    }


    $scope.bulkImport = function(){
        deckManager.bulkImport($scope.importCards);
        $scope.importCards = "";
    }

    $scope.toggleColorless = function(){
        $scope.showColorless = !($scope.showColorless);
    }

    $scope.getUrl = function(card){
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

    $scope.newHand = function(){
       $scope.startingHand.hand = [];
       if(deckManager.deck.length < 7){
            alert("Please add at least 7 cards to your deck before using the Starting Hand Tool.");
            $scope.selectedTabIndex = 0;
            return;
       }
       $scope.startingHand.deck = deckManager.deck.slice(0);
       $scope.startingHand.cardCount = 7;
        
       for(var i=0; i<$scope.startingHand.cardCount; i++){
           $scope.addCardToHand();
        }

       
    }

    $scope.addCardToHand = function(){
        if($scope.startingHand.deck.length > 0){
            var randomCard = $scope.startingHand.deck[ Math.floor( Math.random() * $scope.startingHand.deck.length )]

            $scope.startingHand.hand.push(randomCard);

            var index = $scope.startingHand.deck.indexOf(randomCard);
            if(index > -1) $scope.startingHand.deck.splice(index, 1);
        }
        else{
            alert("No more cards left in deck to add to hand. Try a new hand.");
        }
    }

    $scope.mulligan = function(){

       var cardCount = $scope.startingHand.hand.length - 1
        if(cardCount > 0){
           $scope.startingHand.deck = deckManager.deck.slice(0);
           $scope.startingHand.hand = [];
           $scope.startingHand.cardCount = cardCount;

           for(var i=0; i<$scope.startingHand.cardCount; i++){
               $scope.addCardToHand();
            }
        }
        else{
            alert("Cannot mulligan any more. Try a new hand.");
        }
    }

    /* Initialization */
    deckManager.get();

	$scope.showCard = function(card, ev){
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
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
		$scope.$watch(function() {
		  return $mdMedia('xs') || $mdMedia('sm');
		}, function(wantsFullScreen) {
		  $scope.customFullscreen = (wantsFullScreen === true);
		});
	}    

	function DialogController($scope, $mdDialog, card) {
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


		$scope.manaSymbols = function(){
			var symbols = [];
			if($scope.card.type !== "Land" && $scope.card.type !== "Scheme"){

			  $scope.card.manaCost.match($scope.symbolRe).forEach(function(el){
				  symbols.push(el.toLowerCase());
			  });
			}

			return symbols
		}

		$scope.getUnderName = function(){
			return encodeURI($scope.card.name
					.toLowerCase()
					.replace(/ /g, "_")
					.replace(/\'/g, "")
					.replace(/-/g, "_")
					.replace(/\?/g, "")
					.replace(/\,/g, "")
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

		$scope.cardText = function(){
			var text = $scope.card.text;
			text = text.replace($scope.symbolRe, function(x){
				return "<span class='mi mi-mana mi-" + x.toLowerCase() + "'></span>"
			});
			text = text.replace(/{/g, "").replace(/}/g, "");
			return $sce.trustAsHtml(text);
		}

	}

}]);
