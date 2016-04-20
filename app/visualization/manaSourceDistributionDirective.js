
angular.module('magicBuddy.manaSourceDistribution', [])

.directive("manaSourceDistribution", function(){
    
    var margin = 25;
    var width = 200;
    var height = 200;
    var radius = Math.min(width, height)/2;

    return {
        restrict: 'E',
        scope: {
            deck: '='
        },
        link: function(scope, element, attrs){
			// set up initial svg object
			var vis = d3.select(element[0])
			  .append("svg")
				.attr("width", width + (margin*2))
				.attr("height", height + (margin*2))
              .append("g")
                .attr("transform", "translate(" + (width+(margin*2)) / 2 + "," + (height+(margin*2)) / 2 + ")");

			scope.$watch("deck", function (newVal, oldVal, scope) {

				// clear the elements inside of the directive
				vis.selectAll('*').remove();

				// if 'val' is undefined, exit
				if (!newVal || newVal.length == 0 ) {
				  return;
				}

                var deck = newVal;

                var colors = {
                    "Blue": 0,
                    "Red": 0,
                    "Green": 0,
                    "Black": 0,
                    "White": 0,
                };

                for(var i=0; i<deck.length; i++){
                    var card = deck[i];

                    if(card.types.indexOf("Land") > -1){
                        if("subtypes" in card){
                            if(card.subtypes.indexOf("Island") > -1){
                                colors["Blue"] = colors["Blue"] + 1;
                            }
                            else if(card.subtypes.indexOf("Mountain") > -1){
                                colors["Red"] = colors["Red"] + 1;
                            }
                            else if(card.subtypes.indexOf("Forest") > -1){
                                colors["Green"] = colors["Green"] + 1;
                            }
                            else if(card.subtypes.indexOf("Swamp") > -1){
                                colors["Black"] = colors["Black"] + 1;
                            }
                            else if(card.subtypes.indexOf("Plains") > -1){
                                colors["White"] = colors["White"] + 1;
                            }
                        }
                    }

                }
                
                var data = [];
                var total = colors["Blue"] + colors["Red"] + colors["Green"] + colors["Black"] + colors ["White"];
                var percents = {
                    "Blue": colors["Blue"] / total,
                    "Red": colors["Red"] / total, 
                    "Green": colors["Green"] / total,
                    "Black": colors["Black"] / total,
                    "White": colors["White"] / total,
                }
                for(var i=0; i<Object.keys(colors).length; i++){
                    var key = Object.keys(colors)[i];
                    var value = colors[key];
                    var percent = percents[key]
                    data.push({"color": key, "total": value, "percent": percent});
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
                          if(color == "Black") return "#777";
                          if(color == "White") return "#FFE591";
                      });

                g.append("text")
                    .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
                    .attr("font-size", "0.75em")
                    .attr("dy", ".35em")
                    .text(function(d) { 
                        if(d.data.percent < 0.07){
                            return ""
                        }
                        else{
                            return Math.floor(d.data.percent * 100) + "%"; 
                        }
                    });

                /* Title */
				
				vis.append("text")
					.attr("x", 0)             
					.attr("y", 0 - ((height+ margin*2)/2) + margin/2)
					.attr("text-anchor", "middle")  
					.style("font-size", "16px") 
					.style("text-decoration", "underline")  
					.text("Mana Source Distribution");
			});
        }
    }

});
