'use strict';

angular.module('magicBuddy.collection', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/collection', {
    templateUrl: 'collection/collection.html',
    controller: 'CollectionCtrl'
  });
}])

.controller('CollectionCtrl', ["$scope", "socket", "collectionManager", function($scope, socket, collectionManager) {

    //allows binding the collection
    $scope.getCollection = function(){
        return collectionManager.collection;
    };
}]);
