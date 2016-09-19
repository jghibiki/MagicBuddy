
angular.module('magicBuddy.manaSymbols')

.directive("manaSymbols", ManaSymbolsDirective);

ManaSymbolsDirective.$inject = [

]
function ManaSymbolsDirective() {

    return {
        restrict: "E",
        scope: { 
            card: '=',
            symbol: '='
        },
        controller: ["$scope", function(vm){
            vm.manaSymbols = [];
            vm.hybridSymbols = [];
            vm.symbolRe = /[^{}]+(?=\})/g;

            vm.generateManaSymbolsFromCard = function(){
                var card = vm.card;
                
                if(card !== null &&
                    card !== undefined){

                    if( !(card.types.indexOf("Land") > -1) && card.type !== "Scheme"){

                        card.manaCost.match(vm.symbolRe).forEach(function(el){
                            if(el.indexOf("/") > -1){
                                var s = el.split("/");
                                var a = s[0].toLowerCase();
                                var b = s[1].toLowerCase();

                                vm.hybridSymbols.push([a, b]);
                            }
                            else{
                                vm.manaSymbols.push(el.toLowerCase());
                            }
                        });
                    }
                }
            };


            vm.generateManaSymbolsFromLetter = function(symbol){

                if(symbol !== null &&
                    symbol !== undefined &&
                    symbol !== ""){
                    
                    symbol = symbol.toString();

                    if(symbol.indexOf("/") > -1){
                        var s = symbol.split("/");
                        var a = s[0].toLowerCase();
                        var b = s[1].toLowerCase();

                        vm.hybridSymbols.push([a, b]);
                    }
                    else{
                        vm.manaSymbols.push(symbol.toLowerCase());
                    }
                }
            };
        }],
        bindToControlller: true,
        controllerAs: "vm",
        templateUrl: "mana-symbols/mana-symbols.controller.html",
        link: function(vm, elements, attrs){
            vm.$watch("card", function(value){
                vm.generateManaSymbolsFromCard();
            });
            attrs.$observe("symbol", function(value){
                vm.generateManaSymbolsFromLetter(value);
            });
        }
    };

}
