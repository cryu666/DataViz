var correlationMatrix = { 
    Male: [
        [1.0, 0.98, 0.83, 0.92, 0.89, 0.89, 0.87, 0.37], 
        [0.98, 1.0, 0.84, 0.91, 0.87, 0.88, 0.88, 0.39], 
        [0.83, 0.84, 1.0, 0.84, 0.78, 0.81, 0.84, 0.43], 
        [0.92, 0.91, 0.84, 1.0, 0.96, 0.95, 0.93, 0.37], 
        [0.89, 0.87, 0.78, 0.96, 1.0, 0.91, 0.84, 0.22], 
        [0.89, 0.88, 0.81, 0.95, 0.91, 1.0, 0.86, 0.32], 
        [0.87, 0.88, 0.84, 0.93, 0.84, 0.86, 1.0, 0.51], 
        [0.37, 0.39, 0.43, 0.37, 0.22, 0.32, 0.51, 1.0]
    ], 
    Female: [
        [1.0, 0.97, 0.55, 0.93, 0.89, 0.89, 0.86, 0.23], 
        [0.97, 1.0, 0.56, 0.93, 0.88, 0.88, 0.88, 0.27], 
        [0.55, 0.56, 1.0, 0.58, 0.53, 0.55, 0.58, 0.23], 
        [0.93, 0.93, 0.58, 1.0, 0.95, 0.94, 0.92, 0.27], 
        [0.89, 0.88, 0.53, 0.95, 1.0, 0.89, 0.8, 0.09], 
        [0.89, 0.88, 0.55, 0.94, 0.89, 1.0, 0.84, 0.21], 
        [0.86, 0.88, 0.58, 0.92, 0.8, 0.84, 1.0, 0.41], 
        [0.23, 0.27, 0.23, 0.27, 0.09, 0.21, 0.41, 1.0]
    ], 
    Infant: [
        [1.0, 0.99, 0.91, 0.92, 0.9, 0.9, 0.91, 0.69], 
        [0.99, 1.0, 0.91, 0.92, 0.9, 0.9, 0.91, 0.7], 
        [0.91, 0.91, 1.0, 0.89, 0.85, 0.87, 0.88, 0.72], 
        [0.92, 0.92, 0.89, 1.0, 0.97, 0.97, 0.97, 0.7], 
        [0.9, 0.9, 0.85, 0.97, 1.0, 0.93, 0.91, 0.62], 
        [0.9, 0.9, 0.87, 0.97, 0.93, 1.0, 0.94, 0.67], 
        [0.91, 0.91, 0.88, 0.97, 0.91, 0.94, 1.0, 0.73], 
        [0.69, 0.7, 0.72, 0.7, 0.62, 0.67, 0.73, 1.0]
    ]
};

var labels = [
    'Length', 
    'Diameter', 
    'Height', 
    'Whole_weight', 
    'Shucked_weight', 
    'Viscera_weight', 
    'Shell_weight', 
    'Rings'
];

var colors = { Male: '#3498db', Female: '#F2BE22', Infant: '#F24C3D' }

Matrix({
    container: "#container",
    data: correlationMatrix.Male,
    labels: labels,
    start_color: "#ffffff",
    end_color: colors.Male,
});

d3.select('#opts')
  .on('change', function() {

    let old_legend = document.getElementById('legend');
    old_legend.remove();

    let old_container = document.getElementById('container');
    old_container.remove();

    d3.select('#matrix')
        .append("div")
        .style("display", "inline-block")
        .attr("id", "legend");

    d3.select('#matrix')
        .append("div")
        .style("display", "inline-block")
        .style("float", "left")
        .attr("id", "container");

    var sexLabel = d3.select(this).property('value');

    Matrix({
        container: "#container",
        data: correlationMatrix[sexLabel],
        labels: labels,
        start_color: "#ffffff",
        end_color: colors[sexLabel],
    });
});

// Matrix({
//     container: "#container",
//     data: correlationMatrix.male,
//     labels: labels,
//     start_color: "#ffffff",
//     end_color: "#3498db",
// });

function Matrix(options) {

    var margin = { top: 50, right: 50, bottom: 300, left: 150 },
        width = 320,
        height = 320,
        data = options.data,
        container = options.container,
        labelsData = options.labels,
        startColor = options.start_color,
        endColor = options.end_color

    var widthLegend = 100;

    if (!data) {
        throw new Error("Please pass data");
    }

    if (!Array.isArray(data) || !data.length || !Array.isArray(data[0])) {
        throw new Error("It should be a 2-D array");
    }

    var maxValue = d3.max(data, function(layer) {
        return d3.max(layer, function(d) {
            return d;
        });
    });

    var minValue = d3.min(data, function(layer) {
        return d3.min(layer, function(d) {
            return d;
        });
    });

    var numrows = data.length;
    var numcols = data[0].length;

    var svg = d3
        .select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var background = svg
        .append("rect")
        .style("stroke", "black")
        .style("stroke-width", "2px")
        .attr("width", width)
        .attr("height", height);

    var x = d3.scale
        .ordinal()
        .domain(d3.range(numcols))
        .rangeBands([0, width]);

    var y = d3.scale
        .ordinal()
        .domain(d3.range(numrows))
        .rangeBands([0, height]);

    var colorMap = d3.scale
        .linear()
        .domain([minValue, maxValue])
        .range([startColor, endColor]);

    var row = svg.selectAll(".row")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) {
            return "translate(0," + y(i) + ")";
        });

    var cell = row.selectAll(".cell")
        .data(function(d) {
            return d;
        })
        .enter()
        .append("g")
        .attr("class", "cell")
        .attr("transform", function(d, i) {
            return "translate(" + x(i) + ", 0)";
        });

    cell.append("rect")
        .attr("width", x.rangeBand())
        .attr("height", y.rangeBand())
        .style("stroke-width", 0);

    cell.append("text")
        .attr("dy", ".32em")
        .attr("x", x.rangeBand() / 2)
        .attr("y", y.rangeBand() / 2)
        .attr("text-anchor", "middle")
        .style("fill", function(d, i) {
            return d >= maxValue / 2 ? "white" : "black";
        })
        .text(function(d, i) {
            return d;
        });

    row.selectAll(".cell")
      .data(function(d, i) {
          return data[i];
      })
      .style("fill", colorMap);

    var labels = svg.append("g").attr("class", "labels");

    var columnLabels = labels
        .selectAll(".column-label")
        .data(labelsData)
        .enter()
        .append("g")
        .attr("class", "column-label")
        .attr("transform", function(d, i) {
            return "translate(" + x(i) + "," + height + ")";
        });

    columnLabels.append("line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .attr("x1", x.rangeBand() / 2)
        .attr("x2", x.rangeBand() / 2)
        .attr("y1", 0)
        .attr("y2", 5);

    columnLabels.append("text")
        .attr("x", 0)
        .attr("y", y.rangeBand() / 2)
        .attr("dy", ".82em")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-60)")
        .text(function(d, i) {
            return d;
        });

    var rowLabels = labels.selectAll(".row-label")
        .data(labelsData)
        .enter()
        .append("g")
        .attr("class", "row-label")
        .attr("transform", function(d, i) {
            return "translate(" + 0 + "," + y(i) + ")";
        });

    rowLabels.append("line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .attr("x1", 0)
        .attr("x2", -5)
        .attr("y1", y.rangeBand() / 2)
        .attr("y2", y.rangeBand() / 2);

    rowLabels.append("text")
        .attr("x", -8)
        .attr("y", y.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function(d, i) {
            return d;
        });

    var key = d3.select("#legend")
        .append("svg")
        .attr("width", widthLegend)
        .attr("height", height + margin.top + margin.bottom);

    var legend = key.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", endColor)
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", startColor)
        .attr("stop-opacity", 1);

    key.append("rect")
        .attr("width", widthLegend / 2 - 10)
        .attr("height", height)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(0," + margin.top + ")");

    var y = d3.scale
        .linear()
        .range([height, 0])
        .domain([minValue, maxValue]);

    var yAxis = d3.svg
        .axis()
        .scale(y)
        .orient("right");

    key.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(41," + margin.top + ")")
        .call(yAxis);


    
}
