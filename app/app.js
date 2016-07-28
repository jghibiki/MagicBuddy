'use strict';

// Declare app level module which depends on views, and components
angular.module('magicBuddy', [
  'ui.router',
  'ngMaterial',
  'ngAnimate',
  'btford.socket-io',
  'bsLoadingOverlay',
  'md.data.table',
  'magicBuddy.mainMenu',
  'magicBuddy.decks',
  'magicBuddy.collection',
  'magicBuddy.selector',
  'magicBuddy.viewer',
  'magicBuddy.services',
  'magicBuddy.manaCurve',
  'magicBuddy.manaDistribution',
  'magicBuddy.manaSourceDistribution',
  'magicBuddy.navigation',
  'magicBuddy.git',
  'magicBuddy.version'
])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state('home', {
        url: '/',
        templateUrl: 'mainMenu/mainMenu.html'
    })
}])
.factory('socket', function (socketFactory) {
    var mySocket = socketFactory();
    mySocket.forward('error');
    return mySocket;
})
.run(function(bsLoadingOverlayService) {
    bsLoadingOverlayService.setGlobalConfig({
        templateUrl: 'loader-template.html'
    });
})

