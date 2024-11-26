var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1280 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var criteria = ['scores_teaching', 'scores_research', 'scores_citations', 'scores_industry_income', 'scores_international_outlook'];

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var color = d3.scale.ordinal()
    .domain(criteria)
    .range(['#D2E0FB', '#F9F3CC', '#D7E5CA', '#8EACCD', '#E5C3A6']);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var active_link = "0"; //to control legend selections and hover
var legendClicked; //to control legend selections
var legendClassArray = []; //store legend classes to select bars in plotSingle()
var legendClassArray_orig = []; //orig (with spaces)
var sortDescending; //if true, bars are sorted by height in descending order
var restoreXFlag = false; //restore order of bars back to original
var sortBy;



d3.select("#sortOrder")             
    .property("disabled", true); 


const dataUrl = 'http://vis.lab.djosix.com:2023/data/TIMES_WorldUniversityRankings_2024.csv';
d3.csv(dataUrl, function(error, data) {

    if (error) throw error;

    data = data.filter(function (d) {
        return !isNaN(d.scores_overall);
    });


    data.forEach(function(d) {
        var university = d.name; //add to stock code
        var y0 = 0;
        d.ages = color.domain().map(function(criterion) {
            return { 
                university: university, 
                criterion: criterion, 
                y0: y0, 
                y1: y0 += +d[criterion], 
                value: d[criterion],
                y_corrected: 0
            }; 
        });
        d.total = d.ages[d.ages.length - 1].y1;    
    });

    //Sort totals in descending order
    data.sort(function(a, b) { return b.total - a.total; });  

    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d) { return d.total; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");
        //.text("Population");

    var state = svg.selectAll(".state")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + "0" + ",0)"; });

    var height_diff = 0;  //height discrepancy when calculating h based on data vs y(d.y0) - y(d.y1)
    state.selectAll("rect")
        .data(function(d) {
            return d.ages; 
        })
        .enter().append("rect")
        .attr("width", x.rangeBand())
        .attr("y", function(d) {
            height_diff = height_diff + y(d.y0) - y(d.y1) - (y(0) - y(d.value));
            var y_corrected = y(d.y1) + height_diff;
            d.y_corrected = y_corrected //store in d for later use in restorePlot()

            if (d.criterion === "haha") height_diff = 0; //reset for next d.university
                
            return y_corrected;    
        })
        .attr("x",function(d) { //add to stock code
            return x(d.university)
        })
        .attr("height", function(d) {       
            return y(0) - y(d.value); //calculate height directly from value in csv file
        })
        .attr("class", function(d) {        
            var classLabel = d.criterion.replace(/\s/g, ''); //remove spaces
            return "bars class" + classLabel;
        })
        .style("fill", function(d) { return color(d.criterion); });

    state.selectAll("rect")
        .on("mouseover", function(d){

            var delta = d.y1 - d.y0;
            var xPos = parseFloat(d3.select(this).attr("x"));
            var yPos = parseFloat(d3.select(this).attr("y"));
            var height = parseFloat(d3.select(this).attr("height"));

            d3.select(this).attr("stroke","blue").attr("stroke-width",0.3);

            svg.append("text")
                .attr("x",xPos)
                .attr("y",yPos +height/2)
                .attr("class","tooltip")
                .text(d.university +": "+ delta); 
          
        })
        .on("mouseout",function(){
            svg.select(".tooltip").remove();
            d3.select(this).attr("stroke","pink").attr("stroke-width",0.05);            
        })


    var legend = svg.selectAll(".legend")
        .data(color.domain().slice().reverse())
        .enter().append("g")
        .attr("class", function (d) {
            legendClassArray.push(d.replace(/\s/g, '')); //remove spaces
            legendClassArray_orig.push(d); //remove spaces
            return "legend";
        })
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    //reverse order to match order in which bars are stacked    
    legendClassArray = legendClassArray.reverse();
    legendClassArray_orig = legendClassArray_orig.reverse();

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color)
        .attr("id", function (d, i) {
            return "id" + d.replace(/\s/g, '');
        })
        .on("mouseover",function(){        

            if (active_link === "0") d3.select(this).style("cursor", "pointer");
            else {
                if (active_link.split("class").pop() === this.id.split("id").pop()) {
                    d3.select(this).style("cursor", "pointer");
                } else d3.select(this).style("cursor", "auto");
            }
        })
        .on("click",function(d){        

            if (active_link === "0") { //nothing selected, turn on this selection
                d3.select(this)           
                    .style("stroke", "black")
                    .style("stroke-width", 2);

                    active_link = this.id.split("id").pop();
                    plotSingle(this);

                    //gray out the others
                    for (let i = 0; i < legendClassArray.length; i++) {
                        if (legendClassArray[i] != active_link) {
                            d3.select("#id" + legendClassArray[i])
                                .style("opacity", 0.5);
                        } else sortBy = i; //save index for sorting in change()
                    }

                    //enable sort checkbox
                    d3.select("#sortOrder").property("disabled", false)
                    d3.select("#sortOrder").style("color", "black")
                    d3.select("label").style("color", "black")
                    //sort the bars if checkbox is clicked            
                    d3.select("#sortOrder").on("change", change);  
            
            } else { //deactivate
                if (active_link === this.id.split("id").pop()) {//active square selected; turn it OFF
                    d3.select(this)           
                        .style("stroke", "none");
                    
                    //restore remaining boxes to normal opacity
                    for (let i = 0; i < legendClassArray.length; i++) {              
                        d3.select("#id" + legendClassArray[i])
                            .style("opacity", 1);
                    }

            
                    if (d3.select("#sortOrder").property("disabled")) {              
                        restoreXFlag = true;
                    }
                
                    //disable sort checkbox
                    d3.select("label")
                    .style("color", "#D8D8D8")
                    .select("#sortOrder")
                    .property("disabled", true);             

                    //y translate selected category bars back to original y posn
                    restorePlot(d);

                    active_link = "0"; //reset
                }

            } //end active_link check
                          
                                
        });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

    // restore graph after a single selection
    function restorePlot(d) {

        location.reload();

        //reset
        restoreXFlag = false;
        
    }

    // plot only a single legend selection
    function plotSingle(d) {
            
        var class_keep = d.id.split("id").pop();
        var idx = legendClassArray.indexOf(class_keep);    
        
        //erase all but selected bars by setting opacity to 0
        d3.selectAll(".bars:not(.class" + class_keep + ")")
            .transition()
            .duration(1000)
            .attr("width", 0) // use because svg has no zindex to hide bars so can't select visible bar underneath
            .style("opacity", 0);

        //lower the bars to start on x-axis  
        state.selectAll("rect").forEach(function (d, i) {        
    
            //get height and y posn of base bar and selected bar
            var h_keep, y_keep, h_base, y_base, h_shift, y_new;
            h_keep = d3.select(d[idx]).attr("height");
            y_keep = d3.select(d[idx]).attr("y");  

            h_base = d3.select(d[0]).attr("height");
            y_base = d3.select(d[0]).attr("y");    

            h_shift = h_keep - h_base;
            y_new = y_base - h_shift;

            //reposition selected bars
            d3.select(d[idx])
                .transition()
                .ease("bounce")
                .duration(1000)
                .delay(750)
                .attr("y", y_new);

        })
   
    }


    function change() {

        var selectedSortOrder = this.value;
        var colName = legendClassArray_orig[sortBy];
    
        // Sort the data based on the selected sort order
        if (selectedSortOrder === "ascending") {
            var x0 = x.domain(data.sort(function(a, b) { return a[colName] - b[colName]; })
                .map(function(d,i) { return d.name; }))
                .copy();
        } else {
            var x0 = x.domain(data.sort(function(a, b) { return b[colName] - a[colName]; })
                .map(function(d,i) { return d.name; }))
                .copy();
        }

        state.selectAll(".class" + active_link)
            .sort(function(a, b) { 
                return x0(a.university) - x0(b.university); 
            });

        var transition = svg.transition().duration(750),
            delay = function(d, i) { return i * 20; };

        //sort bars
        transition.selectAll(".class" + active_link)
            .delay(delay)
            .attr("x", function(d) {      
                return x0(d.university); 
            });      

        //sort x-labels accordingly    
        transition.select(".x.axis")
            .call(xAxis)
            .selectAll("g")
            .delay(delay);

    
        transition.select(".x.axis")
            .call(xAxis)
            .selectAll("g")
            .delay(delay);    
    }

});