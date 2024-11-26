import { colorLegend } from './109705013_colorLegend.js';


export const scatterPlot = (selection, props) => {
    const {
        xValue,
        xAxisLabel,
        yValue, 
        yAxisLabel,
        colorValue,
        margin,
        width,
        height,
        data
    } = props;

    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // make x axis subject to the width of svg (originally subject to data['sepal length'])
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, xValue))
        .range([0, innerWidth])
        .nice();  
        
    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, yValue))
        .range([innerHeight, 0])
        .nice();

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(colorValue))
        .range(['#EF9595', '#EFB495', '#EBEF95', '#F1EFEF']);

    const g = selection.selectAll('.container').data([null]);
    const gEnter = g
        .enter().append('g')
            .attr('class', 'container');
    gEnter.merge(g)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xAxis = d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickPadding(10);

    const xAxisGroup = g.select('.x-axis');
    const xAxisGroupEnter = gEnter
        .append('g')
            .attr('class', 'x-axis');
    xAxisGroup
        .merge(xAxisGroupEnter)
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(xAxis)
            .selectAll('.domain').remove();

    const xAxisLabelText = xAxisGroupEnter
    .append('text')
        .attr('class', 'axis-label')
        .attr('y', 50)
    .merge(xAxisGroup.select('.axis-label'))
        .attr('x', innerWidth/2)
        .text(xAxisLabel);

    const yAxis = d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickPadding(10);
    const yAxisGroup = g.select('.y-axis');
    const yAxisGroupEnter = gEnter
        .append('g')
            .attr('class', 'y-axis');
    yAxisGroup
        .merge(yAxisGroupEnter)
            .call(yAxis)
            .selectAll('.domain').remove();

    const yAxisLabelText = yAxisGroupEnter
        .append('text')
            .attr('class', 'axis-label')
            .attr('y', -50)
            .attr('transform', `rotate(-90)`)
            .style('text-anchor', 'middle')
        .merge(yAxisGroup.select('.axis-label'))
            .attr('x', -(innerHeight/2))
            .text(yAxisLabel);

    const circles = g.merge(gEnter).selectAll('circle').data(data);
    circles.enter().append('circle')
        .merge(circles)
            .attr('cy', d => yScale(yValue(d)))
            .attr('cx', d => xScale(xValue(d)))
            .attr('fill', d => colorScale(colorValue(d)))
            .attr('r', 6);
    

    selection.call(colorLegend, {
        colorScale: colorScale
    });
    

}