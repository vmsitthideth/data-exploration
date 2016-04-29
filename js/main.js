// Javascript to load the data of Major Crimes in Seattle during
// 	2014 and puts them into a stacked bar chart

$(function() {
	d3.csv('data/Statistics_Major_Crimes__2014__by_Precinct_and_Beat.csv', function(error, data) {
		var xScale, yScale, currentData;

		// Variable holds the default Precinct that will show
		var precinct = 'NORTH';

		// Margin dimensions 
		var margin = {
			left: 70,
			bottom: 100,
			top: 50,
			right: 50
		};

		// Variables that will hold the height and width
		var height = 550 - margin.bottom - margin.top;
		var width = 1000 - margin.left - margin.right;

		//
		var svg = d3.select('#div')
					.append('svg')
					.attr('height', 550)
					.attr('width', 1000);

		//	Appending g to the svg
		var g = svg.append('g')
					.attr('transform', 'translate(' + margin.left + "," + margin.top + ')')
					.attr('height', height)
					.attr('width', width);


		//	Creates the labels and text areas for the Axes
		var xAxisLabel = svg.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
							.attr('class', 'title')

		var yAxisLabel = svg.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
							.attr('class', 'title')

		var xAxisText = svg.append('text')
							.attr('transform', 'translate(' + (margin.left + width / 2) + ',' + (height + margin.top + 50) + ')')
							.attr('class', 'label')

		var yAxisText = svg.append('text')
							.attr('transform', 'translate(' + (margin.left - 50) + ',' + (margin.top + height - 80) + ') rotate(-90)')
							.attr('class', 'label')

		//  Sets the scales for the x and y axes
		var setScales = function(data) {

			//	If the BEAT is empty, create All, which will represent All Beats
			var beat = data.map(function(d) { if (d.BEAT == "") {return 'All'} return d.BEAT});

			xScale = d3.scale.ordinal().rangeBands([0, width], .1).domain(beat);

			var yMin = d3.min(data, function(d) {return +d.VIOLENT_CRIMES_TOTAL} );

			var yMax = d3.max(data, function(d) {return +d.VIOLENT_CRIMES_TOTAL} );

			yScale = d3.scale.linear().range([height, 0]).domain([0, yMax]);
		}

		//	Sets the x labels for x-axis
		var setAxes = function() {

			var xAxis = d3.svg.axis()
						.scale(xScale)
						.orient('bottom')


			//	Sets the y labels for y-axis and forces 'n' number format (Precision)
			var yAxis = d3.svg.axis()
						.scale(yScale)
						.orient('left')
						.tickFormat(d3.format('n'));

			//	Labels transition in at 500 ms
			xAxisLabel.transition().duration(500).call(xAxis);
			yAxisLabel.transition().duration(500).call(yAxis);

			//	Text label for axes
			xAxisText.text('Police Beat (Territory)');
			yAxisText.text('Number of Crime Occurrences');
		}

		//	Filters the data by the Precinct that is passed in
		var filterData = function() {
			currentData = data.filter(function(d) {
				return d.PRECINCT == precinct
			})

			//	Alphabetical sort 
			.sort(function(a,b) {
				if(a.BEAT < b.BEAT) return -1;
				if(a.BEAT > b.BEAT) return 1;
				return 0;
			});
		}

		//	Draw function that 
		var draw = function(data) {
			setScales(data)
			setAxes()

			//	Selects all the rects to work with
			var bars = g.selectAll('rect').data(data);

			//	Get entering elements and positions them
			bars.enter().append('rect')
				.attr('x', function(d) {return xScale(d.BEAT)} )
				.attr('y', height)
				.attr('height', 0)
				.attr('width', xScale.rangeBand())
				.attr('class', 'bar')
				.attr('title', function(d) {return d.BEAT});

			//	Elements no longer in data are removed
			bars.exit().remove();

			//	Makes bars and transitions
			bars.transition()
				.duration(500)
				.delay(function(d,i) {return i*50})
				.attr('x', function(d) {return xScale(d.BEAT)})
				.attr('y', function(d) {return yScale(d.VIOLENT_CRIMES_TOTAL)})
				.attr('height', function (d) {return height - yScale(d.VIOLENT_CRIMES_TOTAL)})
				.attr('width', xScale.rangeBand())
				.attr('title', function(d) {return d.BEAT});
		}

		// Change event to switch input element to the Precinct button chosen
		$("input").on('change', function() {
			var val = $(this).val();
			var isPrecinct = $(this).hasClass('precinct');

			if(isPrecinct) {
				precinct = val;
			}
			filterData();
			draw(currentData);
		});

		//	Calls Functions to filters data and creates the bars
		filterData()
		draw(currentData)
	});
});