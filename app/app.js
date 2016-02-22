'use strict';

// Declare app level module which depends on views, and components
angular.module('magicBuddy', [
  'ngRoute',
  'btford.socket-io',
  'magicBuddy.mainMenu',
  'magicBuddy.deck',
  'magicBuddy.collection',
  'magicBuddy.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/'});
}]).
factory('socket', function (socketFactory) {
    return socketFactory({
      ioSocket: io.connect(':8000')
    });
});

