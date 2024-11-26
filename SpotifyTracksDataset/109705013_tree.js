let unfiltered_data;
let data;
let columns;

let artists_popularity;
let tree_json;

let num_song_filter = 1;

// Set the dimensions and margins of the diagram
var margin = {top: 0, right: 90, bottom: 25, left: 90},
    width = 960 - margin.left - margin.right,
    height = 560 - margin.top - margin.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var i = 0,
    duration = 750,
    root;

// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);

function split_multiple_artists_data(data) {
	data.forEach(d => {
		var current_artists = d['artists'].split(';');
		
		if(current_artists.length > 1){
			d['artists'] = current_artists[0];

			for(i = 1; i < current_artists.length; i++){
				data.push({
					'number': d['number'],
					'track_id': d['track_id'], 
					'artists': current_artists[i],
					'album_name': d['album_name'],
					'track_name': d['track_name'],
					'popularity': d['popularity'],
					'duration_s': d['duration_s'],
					'explicit': d['explicit'],
					'danceability': d['danceability'],
					'energy': d['energy'],
					'key': d['key'],
					'loudness': d['loudness'],
					'mode': d['mode'],
					'speechiness': d['speechiness'],
					'acousticness': d['acousticness'],
					'instrumentalness': d['instrumentalness'],
					'liveness': d['liveness'],
					'valence': d['valence'],
					'tempo': d['tempo'],
					'time_signature': d['time_signature'],
					'track_genre': d['track_genre']
				});
			}
		}
	});
	return data;
}

function set_num_song_filter(){
	var cur_num_song_filter = +document.getElementById('num-song').value;
	if(!cur_num_song_filter) {
		document.getElementById('num-song').value = num_song_filter;
	}
	else {
		if(cur_num_song_filter < 1) {
			num_song_filter = 1;
			document.getElementById('num-song').value = num_song_filter;
		}
		else if(cur_num_song_filter > 100) {
			num_song_filter = 100;
			document.getElementById('num-song').value = num_song_filter;
		}
		else{
			num_song_filter = cur_num_song_filter;
		}
	}
	artists_popularity_order(data,num_song_filter)
}

function artists_popularity_order(data,num_song_filter) {
	var popularities = data.reduce((acc, e)=>{
		if(!acc[e.artists]) {
			acc[e.artists] = {'count': 1, 'total_popularity': e.popularity}
		}
		else {
			acc[e.artists]['count'] += 1;
			acc[e.artists]['total_popularity'] += e.popularity;
		}
		return acc;
	}, {})

	popularities = Object.entries(popularities).map(([key, value]) => ({artist: key, ...value}));

	popularities.forEach(d => {
		d['averege_popularity'] = d['total_popularity'] / d['count'];
	});

	popularities.sort(function(first, second) {
		return second['averege_popularity']  - first['averege_popularity'] ;
	});
	popularities = popularities.filter((item) => {
		if(item['count'] < num_song_filter) {
			return false;
		}
		return true;
	});
	tree_json = create_tree_json(popularities, data)
	read_json(tree_json)

	return popularities;
}

function create_tree_json(artists_popularity, data) {
	var tree_json = {};
	tree_json["name"] = "Top 10 artists";
	tree_json["children"] = [];
	for(i = 0; i < 10; i++){
		current_artist = artists_popularity[i]['artist']
		current_artist_list = [];
		data.forEach(d => {
			if(d['artists'] === current_artist){
				current_artist_list.push({
					'number': d['number'],
					'track_id': d['track_id'], 
					'artists': current_artist,
					'album_name': d['album_name'],
					'track_name': d['track_name'],
					'popularity': d['popularity'],
					'duration_s': d['duration_s'],
					'explicit': d['explicit'],
					'danceability': d['danceability'],
					'energy': d['energy'],
					'key': d['key'],
					'loudness': d['loudness'],
					'mode': d['mode'],
					'speechiness': d['speechiness'],
					'acousticness': d['acousticness'],
					'instrumentalness': d['instrumentalness'],
					'liveness': d['liveness'],
					'valence': d['valence'],
					'tempo': d['tempo'],
					'time_signature': d['time_signature'],
					'track_genre': d['track_genre']
				});
			}
		});

		album_list = [];
		current_artist_list.forEach(d => {
			if(album_list.some(e => e['name'] === d['album_name'])){
				album_list.forEach(a => {
					if(a['name'] === d['album_name']){
						a['children'].push({
							'name': d['track_name'],
							'toolTipData': {
								'number': d['number'],
								'track_id': d['track_id'], 
								'artists': current_artist,
								'album_name': d['album_name'],
								'popularity': d['popularity'],
								'duration_s': d['duration_s'],
								'explicit': d['explicit'],
								'danceability': d['danceability'],
								'energy': d['energy'],
								'key': d['key'],
								'loudness': d['loudness'],
								'mode': d['mode'],
								'speechiness': d['speechiness'],
								'acousticness': d['acousticness'],
								'instrumentalness': d['instrumentalness'],
								'liveness': d['liveness'],
								'valence': d['valence'],
								'tempo': d['tempo'],
								'time_signature': d['time_signature'],
								'track_genre': d['track_genre']
							}
						})
					}
				})
			}
			else{
				album_list.push({
					"name": d['album_name'],
					"children": [{
						'name': d['track_name'],
						'toolTipData': {
							'number': d['number'],
							'track_id': d['track_id'], 
							'artists': current_artist,
							'album_name': d['album_name'],
							'popularity': d['popularity'],
							'duration_s': d['duration_s'],
							'explicit': d['explicit'],
							'danceability': d['danceability'],
							'energy': d['energy'],
							'key': d['key'],
							'loudness': d['loudness'],
							'mode': d['mode'],
							'speechiness': d['speechiness'],
							'acousticness': d['acousticness'],
							'instrumentalness': d['instrumentalness'],
							'liveness': d['liveness'],
							'valence': d['valence'],
							'tempo': d['tempo'],
							'time_signature': d['time_signature'],
							'track_genre': d['track_genre']
						}
					}]
				});
			}
		});

		tree_json["children"].push({
			"name": current_artist,
			"children": album_list
		});
  	};

  	return tree_json;
}

function read_json(tree_json){
	root = d3.hierarchy(tree_json, function(d) { return d.children; });;
	root.x0 = height / 2;
	root.y0 = 0;

	function collapse(d) {
		if (d.children) {
			d._children = d.children;
			d._children.forEach(collapse);
			d.children = null;
		}
	}

	root.children.forEach(collapse);
	update(root);
};

function update(source) {

	var treeData = treemap(root);

	var nodes = treeData.descendants(), links = treeData.descendants().slice(1);

	nodes.forEach(function(d){ d.y = d.depth * 180});

	var node = svg.selectAll('g.node')
		.data(nodes, function(d) {return d.id || (d.id = ++i); });
	
	node.select("text")
		.data(nodes)
		.text(function(d) {return d.data.name; });

	var nodeEnter = node.enter().append('g')
		.attr('class', 'node')
		.attr("transform", function(d) {
			return "translate(" + source.y0 + "," + source.x0 + ")";
		})
		.on('click', click)
		.on("mouseover", mouseover)
		.on("mouseout", mouseout);

	nodeEnter.append('circle')
		.attr('class', 'node')
		.attr('r', 1e-6)
		.style("fill", function(d) {
			return d._children ? "lightsteelblue" : "#fff";
		});

	nodeEnter.append('text')
		.attr("dy", ".35em")
		.attr("x", function(d) {
			return d.children || d._children ? -13 : 13;
		})
		.attr("text-anchor", function(d) {
			return d.children || d._children ? "end" : "start";
		})
		.text(function(d) { return d.data.name; });

  	var nodeUpdate = nodeEnter.merge(node);

	nodeUpdate.transition()
		.duration(duration)
		.attr("transform", function(d) { 
			return "translate(" + d.y + "," + d.x + ")";
		});

	nodeUpdate.select('circle.node')
		.attr('r', 10)
		.style("fill", function(d) {
			return d._children ? "lightsteelblue" : "#fff";
		})
		.attr('cursor', 'pointer');

	var nodeExit = node.exit().transition()
		.duration(duration)
		.attr("transform", function(d) {
			return "translate(" + source.y + "," + source.x + ")";
		})
		.remove();

	nodeExit.select('circle')
		.attr('r', 1e-6);

	nodeExit.select('text')
		.style('fill-opacity', 1e-6);


	var link = svg.selectAll('path.link')
		.data(links, function(d) { return d.id; });

	var linkEnter = link.enter().insert('path', "g")
		.attr("class", "link")
		.attr('d', function(d){
			var o = {x: source.x0, y: source.y0}
			return diagonal(o, o)
		});

	var linkUpdate = linkEnter.merge(link);

	linkUpdate.transition()
		.duration(duration)
		.attr('d', function(d){ return diagonal(d, d.parent) });

	var linkExit = link.exit().transition()
		.duration(duration)
		.attr('d', function(d) {
			var o = {x: source.x, y: source.y}
			return diagonal(o, o)
		})
		.remove();

	nodes.forEach(function(d){
		d.x0 = d.x;
		d.y0 = d.y;
	});

	function diagonal(s, d) {

		path = `M ${s.y} ${s.x}
				C ${(s.y + d.y) / 2} ${s.x},
				${(s.y + d.y) / 2} ${d.x},
				${d.y} ${d.x}`

		return path
	}

	function click(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		}
		else {
			d.children = d._children;
			d._children = null;
		}
		update(d);
	}

	const toolTipG = svg.append("g");
	const toolTipRect = toolTipG
		.append("rect")
		.attr("id", "rectTooltip")
		.attr("rx", 5)
		.style("visibility", "hidden");
	const toolTipText = toolTipG
		.append("text")
		.attr("id", "textTooltip")
		.style("visibility", "hidden");
	const popText = toolTipText.append("tspan");
	const genreText = toolTipText.append("tspan");
	const bpmText = toolTipText.append("tspan");
	const valenceText = toolTipText.append("tspan");

	function mouseover(d) {
		if (d.data.toolTipData) {
			const el = d3.select(this).select(".node");
			el.style("r", 13).style("fill", "#ff8f34");

			toolTipText.style("visibility", "visible");

			const data = d.data.toolTipData;

			popText
				.attr("x", d.y + 35)
				.attr("y", d.x - 10)
				.text(() => {
				return `Popularity: ${data.popularity}`;
				});

			let maxTextWidth = popText.node().getBBox().width;

			genreText
				.attr("x", d.y + 35)
				.attr("y", d.x + 9)
				.text(() => {
				return `Genre: ${data.track_genre}`;
				});

			const genreTextWidth = genreText.node().getBBox().width;
			if (genreTextWidth >= maxTextWidth) {
				maxTextWidth = genreTextWidth;
			}
			bpmText
				.attr("x", d.y + 35)
				.attr("y", d.x + 31)
				.text(() => {
					return `BPM: ${data.tempo}`;
				});
			const bpmTextWidth =bpmText.node().getBBox().width;
			if (bpmTextWidth >= maxTextWidth) {
				maxTextWidth = bpmTextWidth;
			}

			valenceText
				.attr("x", d.y + 35)
				.attr("y", d.x + 51)
				.text(() => {
					return `Valence:: ${data.valence}`;
				});
			const valenceTextWidth =valenceText.node().getBBox().width;
			if (valenceTextWidth >= maxTextWidth) {
				maxTextWidth = valenceTextWidth;
			}

			toolTipRect
				.attr("x", d.y + 30)
				.attr("y", d.x - 29)
				.attr("width", maxTextWidth + 10)
				.style("visibility", "visible");
    	}
  	}

	function mouseout(d) {
		if (d.data.toolTipData) {
			const circle = d3.select(this).select(".node");
			circle.style("r", 10).style("fill", "#fff");
			toolTipRect.style("visibility", "hidden");
			toolTipText.style("visibility", "hidden");
		}
	}
}

d3.csv('http://vis.lab.djosix.com:2023/data/spotify_tracks.csv')
	.then(loadedData => {
		unfiltered_data = loadedData;
		unfiltered_data.forEach(d => {
			d["number"] = +d[""];
			delete d[""];
			d["popularity"] = +d["popularity"];
			d["duration_s"] = +d["duration_ms"] / 1000;
			delete d["duration_ms"];
			d["explicit"] = (d["explicit"] === 'True');
			d["danceability"] = +d["danceability"];
			d["energy"] = +d["energy"];
			d["key"] = +d["key"];
			d["loudness"] = +d["loudness"];
			d["mode"] = +d["mode"];
			d["speechiness"] = +d["speechiness"];
			d["acousticness"] = +d["acousticness"];
			d["instrumentalness"] = +d["instrumentalness"];
			d["liveness"] = +d["liveness"];
			d["valence"] = +d["valence"];
			d["tempo"] = +d["tempo"];
			d["time_signature"] = +d["time_signature"];
		});
		data = [...new Map(unfiltered_data.map(item => [item["track_id"], item])).values()]
		columns = Object.values(unfiltered_data.columns);
		columns[0] = 'number';

		data = split_multiple_artists_data(data);
		artists_popularity = artists_popularity_order(data, num_song_filter);
	})
;