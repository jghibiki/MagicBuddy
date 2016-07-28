'use strict';

// Declare app level module which depends on views, and components
angular.module('magicBuddy.decks', [
    'ui.router',
    'magicBuddy.decks.listing',
    'magicBuddy.decks.viewer'

])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('decks', {
        abstract: true,
        url: '/decks',
        template: '<div class="ui-view-container"<div ui-view></div></div>'
    })
    .state('decks.list', {
        url: '/list',
        templateUrl: 'deck/decks.html',
        controller: 'DecksCtrl',
        controllerAs: 'decks'
    })
    .state('decks.view', {
        url: '/view/:deckName',
        templateUrl: 'deck/deck.html',
        controller: 'DeckViewerCtrl',
        controllerAs: 'deckViewer'
    });
}])
.run(function(bsLoadingOverlayService) {
    bsLoadingOverlayService.setGlobalConfig({
        templateUrl: 'loader-template.html'
    });
})
