
'use strict';

angular.module('magicBuddy.navigation', [])

.controller("NavigationCtrl", [ NavigationCtrl ])

.directive("navTo", [ "$location", navTo ]);

function NavigationCtrl(){
    
}


function navTo($location){
    return function ( scope, element, attrs) {
        var path;

        attrs.$observe( 'navTo', function(val){
            path = val;
        });

        element.bind('click', function(){
            scope.$apply( function(){
                $location.path(path);
            });
        });
    }
}


