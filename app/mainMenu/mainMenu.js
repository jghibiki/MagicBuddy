'use strict';

angular.module('magicBuddy.mainMenu', ['ngRoute', angularDragula(angular)])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'mainMenu/mainMenu.html',
    controller: 'MainMenuCtrl'
  });
}])

.controller('MainMenuCtrl', ["$scope", "socket", function($scope, socket) {

}]);
