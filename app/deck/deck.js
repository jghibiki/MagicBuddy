'use strict';

angular.module('magicBuddy.deck', ['ngRoute', angularDragula(angular)])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/deck', {
    templateUrl: 'deck/deck.html',
    controller: 'DeckCtrl'
  });
}])

.controller('DeckCtrl', [function() {

}]);
