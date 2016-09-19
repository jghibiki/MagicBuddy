

angular.module('magicBuddy.manaSymbols')

.directive("manaSymbolsText", ManaSymbolsTextDirective);

ManaSymbolsTextDirective.$inject = [
    "$compile"
]
function ManaSymbolsTextDirective($compile) {

    return {
        restrict: "E",
        scope: { 
            text: '=',
        },
        controller: ["$scope", "$compile", function(outer, $compile){
            
            outer.template = "";
            outer.symbolRe = /[^{}]+(?=\})/g;

            outer.generateTemplate = function(){
                var text = outer.text;
                var nodes = ["<span>"];

                if(text !== null && 
                    text !== undefined &&
                    text !== ""){

                    text = text.replace(outer.symbolRe, function(x){
                        return '<mana-symbols symbol="' + x.toLowerCase() + '"></mana-symbols>'
                    });
                    text = "" +  text.replace(/{/g, "").replace(/}/g, "") + "";
                    return text
                }
            };
        }],
        bindToControlller: true,
        controllerAs: "outer",
        link: function(outer, element, attrs){
            outer.$watch("text", function(value){
                var newChild = outer.generateTemplate();
                element.html(newChild);
                $compile(element.contents())(outer);
                //element.push(newChild);
            });
        }
    };
}

