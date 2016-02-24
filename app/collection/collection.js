'use strict';

angular.module('magicBuddy.collection', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/collection', {
    templateUrl: 'collection/collection.html',
    controller: 'CollectionCtrl'
  });
}])

.controller('CollectionCtrl', ["$scope", "socket", function($scope, socket) {
    $scope.collection = [];

    // Get the collection
    socket.on("collection:get::response", function(resp){
        $scope.collection = resp;
    });
    socket.emit("collection:get");
    
}]);
