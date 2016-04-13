
angular.module('magicBuddy.manaCurve', [])

.directive("manaCurve", function(){
    
    var margin = 30;
    var width = 400;
    var height = 150;
    var color = d3.interpolateRgb("#f77", "#77f");

    return {
        restrict: 'E',
        scope: {
            deck: '=',
        },
        link: function(scope, element, attrs){
			// set up initial svg object
			var vis = d3.select(element[0])
			  .append("svg")
				.attr("width", width + margin + margin)
				.attr("height", height + margin + margin)
			  .append("g")
				.attr("transform", "translate(" + margin + "," + margin + ")");

			scope.$watch('deck', function (newVal, oldVal) {

				// clear the elements inside of the directive
				vis.selectAll('*').remove();

				// if 'val' is undefined, exit
				if (!newVal || newVal.length == 0 ) {
				  return;
				}

				// generate useful data
				var cmcs = {}
				for(var i=0; i<newVal.length; i++){
					var card = newVal[i];
					if("cmc" in card){
						if(card.cmc in cmcs){
							cmcs[card.cmc] = cmcs[card.cmc] + 1
						}	
						else{
							cmcs[card.cmc] = 1
						}
					}
				}
				var data = []
				for(var i=0; i<Object.keys(cmcs).length; i++){
					var key = Object.keys(cmcs)[i];
					var val = cmcs[key];
					data.push({
						"cat": key,
						"total": val	
					});
				}
	
				var x = d3.scale.ordinal()
					.rangeRoundBands([0, width], .1);

				var y = d3.scale.linear()
					.range([height, 0]);

				var xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom");

				var yAxis = d3.svg.axis()
					.scale(y)
					.orient("left")

				vis.append("g")
					.attr("transform", "translate(" + margin + "," + margin + ")");
	
				x.domain(data.map(function(d) { return d.cat; }));
				y.domain([0, d3.max(data, function(d) { return d.total; })]);

				vis.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);

				vis.append("g")
					.attr("class", "y axis")
					.call(yAxis)
				  .append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text("Mana");

				vis.selectAll(".bar")
					.data(data)
				  .enter().append("rect")
					.attr("class", "bar")
					.attr("x", function(d) { return x(d.cat); })
					.attr("width", x.rangeBand())
					.attr("y", function(d) { return y(d.total); })
					.attr("height", function(d) { return height - y(d.total); });
				
				vis.append("text")
					.attr("x", (width / 2))             
					.attr("y", 0 - (margin / 2))
					.attr("text-anchor", "middle")  
					.style("font-size", "16px") 
					.style("text-decoration", "underline")  
					.text("Mana Curve");
			});
        }
    }

});
