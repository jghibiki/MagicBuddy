
angular.module('magicBuddy.manaDistribution', [])

.directive("manaDistribution", function(){
    
    var margin = 30;
    var width = 400;
    var height = 150;
    var radius = Math.min(width, height)/2;

    return {
        restrict: 'E',
        scope: {
            deck: '=',
        },
        link: function(scope, element, attrs){
			// set up initial svg object
			var vis = d3.select(element[0])
			  .append("svg")
				.attr("width", width + (margin*2))
				.attr("height", height + (margin*2))
              .append("g")
                .attr("transform", "translate(" + (width+(margin*2)) / 2 + "," + (height+(margin*2)) / 2 + ")");

			scope.$watch('deck', function (newVal, oldVal) {

				// clear the elements inside of the directive
				vis.selectAll('*').remove();

				// if 'val' is undefined, exit
				if (!newVal || newVal.length == 0 ) {
				  return;
				}

                var colors = {
                    "Blue": 0,
                    "Red": 0,
                    "Green": 0,
                    "Black": 0,
                    "White": 0,
                    "Colorless": 0 
                };

                for(var i=0; i<newVal.length; i++){
                    var card = newVal[i];

                    if("manaCost" in card){
                        if(card.manaCost.match(/{U}/g)) colors["Blue"] = colors["Blue"] + card.manaCost.match(/{U}/g).length;
                        if(card.manaCost.match(/{R}/g)) colors["Red"] = colors["Red"] + card.manaCost.match(/{R}/g).length;
                        if(card.manaCost.match(/{G}/g)) colors["Green"] = colors["Green"] + card.manaCost.match(/{G}/g).length;
                        if(card.manaCost.match(/{B}/g)) colors["Black"] = colors["Black"] + card.manaCost.match(/{B}/g).length;
                        if(card.manaCost.match(/{W}/g)) colors["White"] = colors["White"] + card.manaCost.match(/{W]/g).length;

                        if(card.manaCost.match(/{[0-9]}/g)){
                            card.manaCost.match(/{[0-9]}/g).forEach(function(a){
                                colors["Colorless"] = colors["Colorless"] + parseInt(a.replace("{","").replace("}",""));
                            });
                        }
                    }

                }
                
                var data = [];
                for(var i=0; i<Object.keys(colors).length; i++){
                    var key = Object.keys(colors)[i];
                    var value = colors[key];
                    if(value > newVal.length*0.10) data.push({"color": key, "total": value});
                }


                var arc = d3.svg.arc()
                    .outerRadius(radius - 10)
                    .innerRadius(0);

                var labelArc = d3.svg.arc()
                    .outerRadius(radius - 40)
                    .innerRadius(radius - 40);

                var pie = d3.layout.pie()
                    .sort(null)
                    .value(function(d) { return d.total; });


                var g = vis.selectAll(".arc")
                    .data(pie(data))
                .enter().append("g")
                    .attr("class", "arc");

                  g.append("path")
                      .attr("d", arc)
                      .style("fill", function(d) { 
                          var color = d.data.color
                          if(color == "Blue") return "#51B5D6";
                          if(color == "Red") return "#D67251";
                          if(color == "Green") return "#73D651";
                          if(color == "Black") return "#73D651";
                          if(color == "White") return "#FFF";
                          if(color == "Colorless") return "#C4C4C4";
                      });

                g.append("text")
                    .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
                    .attr("dy", ".35em")
                    .text(function(d) { return d.data.color; });

                /* Title */
				
				vis.append("text")
					.attr("x", 0)             
					.attr("y", 0 - ((height+ margin*2)/2) + margin/2)
					.attr("text-anchor", "middle")  
					.style("font-size", "16px") 
					.style("text-decoration", "underline")  
					.text("Mana Distribution");
			});
        }
    }

});
