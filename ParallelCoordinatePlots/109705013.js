import { sideContent } from './109705013_sideContent.js'


const svg = d3.select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');

const column = ['sepal length', 'sepal width', 'petal length', 'petal width'];

const colorMap = {
    'Iris-setosa' : '#D2E0FB',
    'Iris-versicolor' : '#F9F3CC',
    'Iris-virginica' : '#D7E5CA'
};

const render = data => {
	
    const margin = { top: 130, right: 180, bottom: 70, left: 60 };
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.right - margin.left;
    
    const title = 'Parallel Coordinate Plot';
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scalePoint()
        .domain(column)
        .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
        .domain([0, 8])
        .range([innerHeight, 0]);
    
    const axisY = d3.axisLeft().scale(y)
        .tickPadding(5)
        .tickSize(5)
    
    const generateLine = d => 
        d3.line()(column.map(p => [x(p), y(d[p])] ));
    
    const generateLineMoving = d =>
        d3.line()(column.map(p => [correctPos(p), y(d[p])] ));
    
    
    //資料
    const pathG = g.selectAll('path').data(data).enter()
        .append('path')
        .attr('d', d => generateLine(d))
        .attr('stroke',  d => colorMap[d.class])
        .attr('fill', 'none')
        .attr('opacity', 0.35)
        .attr('stroke-width', 2);
    
    
    //軸
    const axisG = g.selectAll('.axes').data(column).enter()
        .append('g')
            .attr('class', 'axes')
            .each(function(d) {d3.select(this).call(axisY)})
            .attr('transform', d => 'translate(' + x(d) +',0)')
    
    var position = {};
    
    const correctPos = d => {
        return position[d] == null ? x(d) : position[d];
    };
    
    
    const dragged = (d,xDragPosition) => {
        position[d] = x(d);
        
        position[d] = Math.min(innerWidth+30, Math.max(-30, xDragPosition));
        column.sort( (p,q) => correctPos(p) - correctPos(q));
        
        x.domain(column);
        pathG.attr('d', d => generateLineMoving(d));
        axisG.attr('transform', d => 'translate(' + correctPos(d) +',0)');
    } 

    
    const dragended = d => {
        delete position[d];
        transition(pathG).attr("d",  d => generateLine(d));
        transition(axisG).attr("transform", p => "translate(" + x(p) + ",0)"); 
    }
    
    //drag
    axisG.call(d3.drag()
        .subject(function(d) { return {x: x(d)}; })
        .on('drag', (d,event) => dragged(d, d3.event.x))
        .on('end', d => dragended(d))
    );
    
    axisG
        .on('mouseover', d => d3.select(this).style("cursor", "wait"))
        .on('mouseout' , d => d3.select(this).style("cursor", "default"));
    
    
    //axis name
    axisG.append('text')
        .attr('fill','black')
        .attr('transform', `translate(0,${innerHeight})`)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', 18)
        .text(d => d);
    
    //icon
    g.call(sideContent, colorMap);
    
    //title
    g.append('text')
        .attr('class', 'title')
        .attr('x', innerWidth/2)
        .attr('y', '-40')
        .style('text-anchor', 'middle')
        .text(title)
    
};

const transition = g =>  
    g.transition().duration(350)
  

// d3.csv('./iris.csv').then( data => {
d3.csv('http://vis.lab.djosix.com:2023/data/iris.csv').then( data => {
    data.forEach(d => {

        d['sepal length'] = +d['sepal length'];
        d['sepal width'] = +d['sepal width'];
        d['petalLength'] = +d['petal length'];
        d['petalWidth'] = +d['petal width'];

    });

    render(data)
});