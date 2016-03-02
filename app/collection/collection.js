'use strict';

angular.module('magicBuddy.collection', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/collection', {
    templateUrl: 'collection/collection.html',
    controller: 'CollectionCtrl'
  });
}])

.controller('CollectionCtrl', ["$scope", "socket", "collectionManager", function($scope, socket, collectionManager) {
    $scope.type = "collection";

    //allows binding the collection
    $scope.getCollection = function(){
        var cardCounts = {};
        collectionManager.collection.forEach(function(x){ cardCounts[x.name] = (cardCounts[x.name] || 0)+1; });
        var seen = {};
        var unique = collectionManager.collection.filter(function(item){
            return seen.hasOwnProperty(item.name) ? false : (seen[item.name] = true);
        });

        for(var idx in unique){
            unique[idx].count = cardCounts[unique[idx].name];                 
        }
        return unique;
    };

    $scope.saveCollection = function(){
        collectionManager.save();
    }

}]);
