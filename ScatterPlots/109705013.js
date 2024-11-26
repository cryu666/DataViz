import { dropdownMenu } from './109705013_dropdownMenu.js';
import { scatterPlot } from './109705013_scatterPlot.js';


const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

let data;
let xColumn, yColumn;

const onXColumnClicked = column => {
    xColumn = column;
    render();
}

const onYColumnClicked = column => {
    yColumn = column;
    render();
}

const render = () => {

    d3.select('#x-menu')
    .call(dropdownMenu, {
        options: data.columns.slice(0, 4),
        onOptionClicked: onXColumnClicked
        }
    );

    d3.select('#y-menu')
    .call(dropdownMenu, {
        options: data.columns.slice(0, 4),
        onOptionClicked: onYColumnClicked
        }
    );

    svg.call(scatterPlot, {
        xValue: d => d[xColumn],
        xAxisLabel: xColumn,
        yValue: d => d[yColumn],
        yAxisLabel: yColumn,
        colorValue: d => d['class'],
        margin: {top: 150, right: 20, bottom: 70, left: 90},
        width,
        height,
        data
    });
    
};

d3.csv('http://vis.lab.djosix.com:2023/data/iris.csv')
// d3.csv('./iris.csv')
    .then(loadedData => {

        data = loadedData;

        // string to float
        data.forEach(d => {
            d['sepal length'] = +d['sepal length'];
            d['petal length'] = +d['petal length'];
            d['sepal width'] = +d['sepal width'];
            d['petal width'] = +d['petal width'];
        });

        xColumn = data.columns[0];
        yColumn = data.columns[0];

        render();
    }
)

