'use strict';

// Declare app level module which depends on views, and components
angular.module('magicBuddy', [
  'ngRoute',
  'btford.socket-io',
  'magicBuddy.mainMenu',
  'magicBuddy.deck',
  'magicBuddy.collection',
  'magicBuddy.selector',
  'magicBuddy.viewer',
  'magicBuddy.services',
  'magicBuddy.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/'});
}]).
factory('socket', function (socketFactory) {
    var mySocket = socketFactory();
    mySocket.forward('error');
    return mySocket;
});

