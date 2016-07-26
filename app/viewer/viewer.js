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

    $scope.manaSymbols = function(){
        var symbols = [];
        if($scope.viewerCard.type !== "Land" && $scope.viewerCard.type !== "Scheme"){

          $scope.viewerCard.manaCost.match($scope.symbolRe).forEach(function(el){
              symbols.push(el.toLowerCase());
          });
        }

        return symbols
    }

    $scope.getUnderName = function(){
        return encodeURI($scope.viewerCard.name
                .toLowerCase()
                .replace(/ /g, "_")
                .replace(/\'/g, "")
                .replace(/-/g, "_")
                .replace(/\?/g, "")
                .replace(/,/g, "")
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
        text = text.replace($scope.symbolRe, function(x){
            return "<span class='mi mi-mana mi-" + x.toLowerCase() + "'></span>"
        });
        text = text.replace(/{/g, "").replace(/}/g, "");
        return $sce.trustAsHtml(text);
    }


}]);
