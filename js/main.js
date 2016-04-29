$(function() {
	d3.csv('data/Statistics_Major_Crimes__2014__by_Precinct_and_Beat.csv', function(error, data) {
		var xScale, yScale, currentData;

		console.log(data);

		var precinct = 'NORTH';
		var crime = 'MAJOR_CRIMES_TOTAL';

		var margin = {
			left: 70,
			bottom: 100,
			top: 50,
			right: 50,
		};

		var height = 600 - margin.bottom - margin.top;
		var width = 1000 - margin.left - margin.right;

		var svg = d3.select('#vis')
					.append('svg')
					.attr('height', 600)
					.attr('width', 1000);

		var g = svg.append('g')
					.attr('transform', 'translate(' + margin.left + "," + margin.top + ')')
					.attr('height', height)
					.attr('width', width);

		var xAxisLabel = svg.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
							.attr('class', 'title')

		var yAxisLabel = svg.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')')
							.attr('class', 'title')

		var xAxisText = svg.append('text')
							.attr('transform', 'translate(' + (margin.left + width / 2) + ',' + (height + margin.top *2) + ')')
							.attr('class', 'label')

		var yAxisText = svg.append('text')
							.attr('transform', 'translate(' + (margin.left - 60) + ',' + (margin.top + height) + ') rotate(-90)')
							.attr('class', 'label')


		var setScales = function(data) {
			var beat = data.map(function(d) { if (d.BEAT == "") {return 'All'} return d.BEAT});

			xScale = d3.scale.ordinal().rangeBands([0, width], .2).domain(beat);

			var yMin = d3.min(data, function(d) {return +d.HOMICIDE} );

			var yMax = d3.max(data, function(d) {return +d.HOMICIDE} );

			yScale = d3.scale.linear().range([height, 0]).domain([0, yMax]);
		}

		var setAxes = function() {

			var xAxis = d3.svg.axis()
						.scale(xScale)
						.orient('bottom')

			var yAxis = d3.svg.axis()
						.scale(yScale)
						.orient('left')

			xAxisLabel.transition().duration(1000).call(xAxis);

			yAxisLabel.transition().duration(1000).call(yAxis);

			xAxisText.text('Beat')
			yAxisText.text('Number of Crime Occurrences (' + precinct + ')')
		}

		var filterData = function() {
			currentData = data.filter(function(d) {
				return d.PRECINCT == precinct
			})

			.sort(function(a,b) {
				if(a.BEAT < b.BEAT) return -1;
				if(a.BEAT > b.BEAT) return 1;
				return 0;
			});
		}

		var draw = function(data) {
			setScales(data)

			setAxes()

			var bars = g.selectAll('rect').data(data);

			bars.enter().append('rect')
				.attr('x', function(d) {return xScale(d.BEAT)} )
				.attr('y', height)
				.attr('height', 0)
				.attr('width', xScale.rangeBand())
				.attr('class', 'bar')
				.attr('title', function(d) {return d.BEAT});

			bars.exit().remove();

			bars.transition()
				.duration(1000)
				.delay(function(d,i) {return i*50})
				.attr('x', function(d) {return xScale(d.BEAT)})
				.attr('y', function(d) {return yScale(d.HOMICIDE)})
				.attr('height', function (d) {return height - yScale(d.HOMICIDE)})
				.attr('width', xScale.rangeBand())
				.attr('title', function(d) {return d.BEAT});
		}

		// Change event to switches input element to what is chosen
		$("input").on('change', function() {
			var val = $(this).val();
			var isPrecinct = $(this).hasClass('precinct');

			console.log(isPrecinct);
			if(isPrecinct) {
				precinct = val;
			} else {
				crime = val;
			}
			console.log(precinct);
			filterData();
			draw(currentData);
		});

		filterData()
		draw(currentData)
	});
});