'use strict';

angular.module('magicBuddy.collection', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/collection', {
    templateUrl: 'collection/collection.html',
    controller: 'CollectionCtrl'
  });
}])

.controller('CollectionCtrl', ["$scope", "socket", "dragulaService", "collectionManager", "cardManager", "gitManager", function($scope, socket, dragulaService, collectionManager, cardManager, gitManager) {
    $scope.type = "collection";
    $scope.importCards = "";
    $scope.collectionManager = collectionManager;
    $scope.gitManager = gitManager;

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
                    collectionManager.add(card);
                    break;
                }
            }
            el.remove();
        }
        else if(el.hasClass("you-may-remove-us") && target.hasClass("remove-target") ){
            var str = el.text();
            var count = str.substr(0, str.indexOf(' '));
            var newCard = str.substr(str.indexOf(' ')+1);
            
            for(var i=0; i<collectionManager.collection.length; i++){
                var card = collectionManager.collection[i];
                if(card.name === newCard){
                    collectionManager.remove(card);
                    break;
                }
            }
            el.remove();
        }

    });

    $scope.saveCollection = function(){
        collectionManager.save();
    }

    $scope.bulkImport = function(){
        deckManager.bulkImport($scope.importCards);
        $scope.importCards = "";
    }

    $scope.viewCard = function(index){
        var card = collectionManager.pretty[index];
        $scope.$broadcast("viewer:showCard", card);
    }

    $scope.hideCard = function(){
        $scope.$broadcast("viewer:hideCard");
    }

    $scope.commit = function(){
        var msg = prompt("Please enter a commit message.", "");
        if(msg !== null &&  msg !== undefined && msg !== ""){
            $scope.gitManager.commit(msg);
        }
    }

}]);
