'use strict';

// Declare app level module which depends on views, and components
angular.module('magicBuddy.decks', [
    'ui.router',
    'ngMaterial',
    'magicBuddy.decks.listing',
    'magicBuddy.decks.viewer',
    'magicBuddy.decks.editor',
    'magicBuddy.decks.stats',
    'magicBuddy.decks.spoiler',
    'magicBuddy.decks.probabilities',
    'magicBuddy.decks.notes',
    'magicBuddy.decks.import'

])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('decks', {
        abstract: true,
        url: '/decks',
        template: '<div class="ui-view-container"<div ui-view></div></div>'
    })
    .state('decks.list', {
        url: '',
        templateUrl: 'deck/listing/listing.html',
        controller: 'DecksCtrl',
        controllerAs: 'decks'
    })
    .state('decks.view', {
        url: '/view/:deckName',
        templateUrl: 'deck/viewer/viewer.html',
        controller: 'DeckViewerCtrl',
        controllerAs: 'vm'
    })
    .state('decks.edit', {
        url: '/edit/:deckName',
        templateUrl: 'deck/editor/editor.html',
        controller: 'DeckEditorCtrl',
        controllerAs: 'vm'
    })
    .state('decks.stats', {
        url: '/stats/:deckName',
        templateUrl: 'deck/stats/stats.html',
        controller: 'DeckStatsCtrl',
        controllerAs: 'vm'
    })
    .state('decks.spoiler', {
        url: '/spoiler/:deckName',
        templateUrl: 'deck/spoiler/spoiler.html',
        controller: 'DeckSpoilerCtrl',
        controllerAs: 'vm'
    })
    .state('decks.probabilities', {
        url: '/probabilities/:deckName',
        templateUrl: 'deck/probabilities/probabilities.html',
        controller: 'DeckProbabilitiesCtrl',
        controllerAs: 'vm'
    })
    .state('decks.notes', {
        url: '/notes/:deckName',
        templateUrl: 'deck/notes/notes.html',
        controller: 'DeckNotesCtrl',
        controllerAs: 'vm'
    })
    .state('decks.import', {
        url: '/import/:deckName',
        templateUrl: 'deck/import/import.html',
        controller: 'DeckImportCtrl',
        controllerAs: 'vm'
    });
}])
.run(function(bsLoadingOverlayService) {
    bsLoadingOverlayService.setGlobalConfig({
        templateUrl: 'loader-template.html'
    });
})
