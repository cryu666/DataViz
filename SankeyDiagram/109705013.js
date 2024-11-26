(function () {
	'use strict';

	var data;

	function processData(data) {

		var margin = {top: 1, right: 1, bottom: 6, left: 1},
			width = 1500 - margin.left - margin.right,
			height = 700 - margin.top - margin.bottom;

		var formatNumber = d3.format(",.0f"),
			format = function(d) { return formatNumber(d); },
			color = d3.scale.category20();

		var svg = d3.select("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", 700)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var sankey = d3.sankey()
			.nodeWidth(15)
			.nodePadding(10)
			.size([width, height]);

		var path = sankey.link();

		var freqCounter = 1;


		const combinationCounts = {};
		data.split('\n').forEach(sample => {
			const attributes = sample.split(',');

			const buying = "buying_" + attributes[0];
			const maint = "maint_" + attributes[1];
			const doors = "doors_" + attributes[2];
			const persons = "persons_" + attributes[3];
			const lug_boot = "lug_boot_" + attributes[4];
			const safety = "safety_" + attributes[5];
			const level = "level_" + attributes[6];

			const combination1 = `${buying}-${maint}`;
			const combination2 = `${maint}-${doors}`;
			const combination3 = `${doors}-${persons}`;
			const combination4 = `${persons}-${lug_boot}`;
			const combination5 = `${lug_boot}-${safety}`;
			const combination6 = `${safety}-${level}`;

			if (combinationCounts[combination1]) {
				combinationCounts[combination1]++;
			} else {
				combinationCounts[combination1] = 1;
			}
			if (combinationCounts[combination2]) {
				combinationCounts[combination2]++;
			} else {
				combinationCounts[combination2] = 1;
			}
			if (combinationCounts[combination3]) {
				combinationCounts[combination3]++;
			} else {
				combinationCounts[combination3] = 1;
			}
			if (combinationCounts[combination4]) {
				combinationCounts[combination4]++;
			} else {
				combinationCounts[combination4] = 1;
			}
			if (combinationCounts[combination5]) {
				combinationCounts[combination5]++;
			} else {
				combinationCounts[combination5] = 1;
			}
			if (combinationCounts[combination6]) {
				combinationCounts[combination6]++;
			} else {
				combinationCounts[combination6] = 1;
			}
    	});

	
		const nodes = [];
		const links = [];

		for (const combination in combinationCounts) {
			const [attr1, attr2] = combination.split('-');
			const count = combinationCounts[combination];

			if (!nodes.some(node => node.name === attr1)) {
				nodes.push({ name: attr1 });
			}
			if (!nodes.some(node => node.name === attr2)) {
				nodes.push({ name: attr2 });
			}
			const sourceIndex = nodes.findIndex(node => node.name === attr1);
			const targetIndex = nodes.findIndex(node => node.name === attr2);
			links.push({ source: sourceIndex, target: targetIndex, value: count });
		}

		const sankeyData = {
			nodes,
			links
		};

		sankey
			.nodes(sankeyData.nodes)
			.links(sankeyData.links)
			.layout(32);

		var link = svg.append("g").selectAll(".link")
			.data(sankeyData.links)
			.enter().append("path")
			.attr("class", "link")
			.attr("d", path)
			.style("stroke-width", function(d) { return Math.max(1, d.dy); })
			.sort(function(a, b) { return b.dy - a.dy; });

		link.append("title")
			.text(function(d) { return d.source.name + " → " + d.target.name + "\n" + "count: " + d.value; });

		var node = svg.append("g").selectAll(".node")
			.data(sankeyData.nodes)
			.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
			.call(d3.behavior.drag()
			.origin(function(d) { return d; })
			.on("dragstart", function() { this.parentNode.appendChild(this); })
			.on("drag", dragmove));

		node.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", sankey.nodeWidth())
			.style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
			.style("stroke", "none")
			.append("title")
			.text(function(d) { return d.name + "\n" + format(d.value); });

		node.append("text")
			.attr("x", -6)
			.attr("y", function(d) { return d.dy / 2; })
			.attr("dy", ".35em")
			.attr("text-anchor", "end")
			.attr("transform", null)
			.text(function(d) {
				if (typeof d.name === 'string' && d.name.includes('undefined') || d.name == "buying_") {
					return "";
				} else {
					return d.name;
				}
			})
			.filter(function(d) { return d.x < width / 2; })
			.attr("x", 6 + sankey.nodeWidth())
			.attr("text-anchor", "start");

		function dragmove(d) {
			d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, d3.event.y)) + ")");
			sankey.relayout();
			link.attr("d", path);
		}

		var linkExtent = d3.extent(sankeyData.links, function (d) {return d.value});
		var frequencyScale = d3.scale.linear().domain(linkExtent).range([1,100]);
		var particleSize = d3.scale.linear().domain(linkExtent).range([1,5]);


		sankeyData.links.forEach(function (link) {
			link.freq = frequencyScale(link.value);
			link.particleSize = particleSize(link.value);
			link.particleColor = d3.scale.linear().domain([1,1000]).range([link.source.color, link.target.color]);
		});

		var t = d3.timer(tick, 1000);
		var particles = [];

		function tick(elapsed, time) {

			particles = particles.filter(function (d) {return d.time > (elapsed - 1000)});

			if (freqCounter > 100) {
				freqCounter = 1;
			}

			d3.selectAll("path.link")
				.each(
					function (d) {
						if (d.freq >= freqCounter) {
							var offset = (Math.random() - .5) * d.dy;
							particles.push({link: d, time: elapsed, offset: offset, path: this});
						}
					}
				);

			particleEdgeCanvasPath(elapsed);
			freqCounter++;

		}

		function particleEdgeCanvasPath(elapsed) {
			var context = d3.select("canvas").node().getContext("2d");

			context.clearRect(0,0,1500,1000);

			context.fillStyle = "gray";
			context.lineWidth = "1px";
			for (var x in particles) {
				var currentTime = elapsed - particles[x].time;
				var currentPercent = currentTime / 1000 * particles[x].path.getTotalLength();
				var currentPos = particles[x].path.getPointAtLength(currentPercent);
				context.beginPath();
				context.fillStyle = particles[x].link.particleColor(currentTime);
				context.arc(currentPos.x,currentPos.y + particles[x].offset,particles[x].link.particleSize,0,2*Math.PI);
				context.fill();
			}
		}
	}

	// const csvURL = './car.csv';
	const csvURL = 'http://vis.lab.djosix.com:2023/data/car.data'
	fetch(csvURL)
		.then(response => {
			if (!response.ok) {
				throw new Error('讀取失敗');
			}
			return response.text();
		})
		.then(loadData => {
			data = loadData;
			processData(data);
		})
		.catch(error => {
			console.error('讀取錯誤:', error);
		});

}());
