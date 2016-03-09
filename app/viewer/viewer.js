'use strict';

angular.module('magicBuddy.viewer', [angularDragula(angular)])

.controller('ViewerCtrl', ["$scope", function($scope) {

    $scope.viewerCard = null;
    
    $scope.$on("viewer:showCard", function(e, card){
        $scope.viewerCard = card;
    })

    $scope.$on("viewer:hideCard", function(e){
        $scope.viewerCard = null;
    })
}]);
