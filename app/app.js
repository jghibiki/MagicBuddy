'use strict';

// Declare app level module which depends on views, and components
angular.module('magicBuddy', [
  'ngRoute',
  'ngMaterial',
  'btford.socket-io',
  'bsLoadingOverlay',
  'md.data.table',
  'magicBuddy.mainMenu',
  'magicBuddy.deck',
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
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/'});
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

