'use strict';

angular.module('magicBuddy.viewer', [angularDragula(angular)])

.controller('ViewerCtrl', ["$scope", "$sce", function($scope, $sce) {

    $scope.viewerCard = null;
    $scope.symbolRe = /[^{}]+(?=\})/g;
    $scope.viewerMode = "both";

    
    $scope.$on("viewer:showCard", function(e, card){
        $scope.viewerCard = card;
    })

    $scope.$on("viewer:hideCard", function(e){
        $scope.viewerCard = null;
    })


    $scope.getUnderName = function(){
        return encodeURI($scope.viewerCard.name
                .toLowerCase()
                .replace(/ /g, "_")
                .replace(/\'/g, "")
                .replace(/-/g, "_")
                .replace(/\?/g, "")
                .replace(/,/g, "")
                .replace(/â/g, "a")
                .replace(/:/g, "") + ".jpg");
    }

    $scope.showImage = function(){
        return $scope.viewerMode == "image";
    }

    $scope.showText = function(){
        return $scope.viewerMode == "text";
    }

    $scope.showBoth = function(){
        return $scope.viewerMode == "both";
    }

    $scope.cardText = function(){
        var text = $scope.viewerCard.text;
        if(text !== null &&
            text !== undefined &&
            text !== ""){

            text = text.replace($scope.symbolRe, function(x){
                return '<mana-symbols symbol="' + x.toLowerCase() + '"></span>'
            });
            text = text.replace(/{/g, "").replace(/}/g, "");
            return $sce.trustAsHtml(text);
        }
    }


}]);
