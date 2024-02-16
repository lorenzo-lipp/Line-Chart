let globalData = null;
let selectedMin = 1947;
let selectedMax = 2015;
const w = 800;
const h = 500;

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
	.then(response => response.json())
	.then(data => {
		globalData = data;
		renderData(data);
	});

function renderData(data) {
	const padding = 60;
	const yLabelOffset = 20;
	const totalYears = 2015 - 1947 + 1;
	const totalSelectedYears = selectedMax - selectedMin + 1;
	const radius = Math.min(275 / data.data.length, 5);
	const maxX = d3.max(data["data"], (d) => new Date(d[0]));
	const minX = d3.min(data["data"], (d) => new Date(d[0]));
	maxX.setMonth(maxX.getMonth() + 3);

	const xScale = d3.scaleTime()
		.domain([minX, maxX])
		.range([padding, w - padding]);

	const yScale = d3.scaleLinear()
		.domain([0, d3.max(data["data"], (d) => d[1])])
		.range([h - padding, padding])
		.nice();

	d3.select('#graph')
		.append('div')
		.attr('class', 'slider-background')
		.append('div')
		.attr('class', 'slider-progress')
		.style('width', `${(700 * totalSelectedYears / totalYears) - 10}px`)
		.style('left', `${((selectedMin - 1947) / totalYears) * 100}%`);

		const handleMinInput = (e) => {
			if (e.target.value >= selectedMax - 1) return e.target.value = selectedMax - 2;
	
			d3.select("#slider-min")
				.style('left', `calc(50% + ${((e.target.value - 1947) / totalYears) * 690}px - 350px)`)
				.text(e.target.value);
	
			d3.select('.slider-progress')
				.style('width', `${(700 * (1 + selectedMax - e.target.value) / totalYears) - 10}px`)
				.style('left', `${((e.target.value - 1947) / totalYears) * 100}%`);
		}
	
		const handleMaxInput = (e) => {
			if (e.target.value <= selectedMin + 1) return e.target.value = selectedMin + 2;
	
			d3.select("#slider-max")
				.style('left', `calc(50% + ${((e.target.value - 1947) / totalYears) * 690}px - 350px)`)
				.text(e.target.value);
	
			d3.select('.slider-progress')
				.style('width', `${(700 * (e.target.value - selectedMin + 1) / totalYears) - 10}px`);
		}

	d3.select('#graph')
		.append('input')
		.attr('class', 'slider')
		.attr('value', selectedMin)
		.attr('min', 1947)
		.attr('max', 2015)
		.attr('type', 'range')
		.on('pointerup', (e) => {
			const value = +e.target.value;

			if (value < selectedMax - 1) {
				selectedMin = value;
				filterData();
			} else {
				selectedMin = selectedMax - 2;
				e.target.value = selectedMin;
				filterData();
			}
		})
		.on('input', handleMinInput);

	d3.select('#graph')
		.append('input')
		.attr('class', 'slider')
		.attr('value', selectedMax)
		.attr('min', 1947)
		.attr('max', 2015)
		.attr('type', 'range')
		.on('pointerup', (e) => {
			const value = +e.target.value;

			if (value > selectedMin + 1) {
				selectedMax = value;
				filterData();
			} else {
				selectedMax = selectedMin + 2;
				e.target.value = selectedMax;
				filterData();
			}
		})
		.on('input', handleMaxInput);

	d3.select('#graph')
		.append('div')
		.attr('id', 'slider-min')
		.attr('class', 'slider-text')
		.style('left', `calc(50% + ${((selectedMin - 1947) / totalYears) * 690}px - 350px)`)
		.text(selectedMin);

	d3.select('#graph')
		.append('div')
		.attr('id', 'slider-max')
		.attr('class', 'slider-text')
		.style('left', `calc(50% + ${((selectedMax - 1947) / totalYears) * 690}px - 350px)`)
		.text(selectedMax);

	const tooltip = d3.select('#graph')
		.append('div')
		.attr('id', 'tooltip');

	d3.select('svg')
		.append('text')
		.attr('id', 'title')
		.attr('x', '50%')
		.attr('y', 50)
		.attr('text-anchor', 'middle')
		.text('United States GDP in billion dollars');

	d3.select('svg')
		.append('text')
		.attr('id', 'y-label')
		.attr('x', w / 2)
		.attr('y', h - yLabelOffset)
		.attr('text-anchor', 'middle')
		.text('Year');

	d3.select('svg')
		.append('text')
		.attr('id', 'x-label')
		.attr('x', 0)
		.attr('y', h / 2)
		.attr('text-anchor', 'middle')
		.text('GDP');

	const tooltipFormat = d3.timeFormat("%B %d, %Y")
	const mouseover = () => tooltip.style('display', 'flex');
	const mouseleave = () => tooltip.style('display', 'none');
	const mousemove = (event) => {
		const target = d3.select(event.target);
		const date = new Date(target.attr('data-date'));
		tooltip.html(`${tooltipFormat(new Date(date.toISOString().slice(0, 19)))}
			<br>${numberWithCommas(target.attr('data-gdp'))} billion USD`)
			.attr('data-date', target.attr('data-date'))
			.style("top", `${event.pageY + 20}px`);

		const tooltipWidth = tooltip.node().getBoundingClientRect().width;
		tooltip.style("left", `${event.pageX - tooltipWidth / 2}px`);
	}

	d3.select('svg')
		.append('path')
		.datum(data.data)
		.attr('class', 'line')
		.attr('d', d3.line()
			.x((d) => xScale(new Date(d[0])))
			.y((d) => yScale(d[1]))
		);

	d3.select('svg')
		.selectAll('g')
		.data(data["data"])
		.enter()
		.append('circle')
		.attr('r', radius)
		.attr('cx', (v) => xScale(new Date(v[0])))
		.attr('cy', (v) => yScale(v[1]))
		.attr('class', 'point')
		.attr('data-date', (d) => d[0])
		.attr('data-gdp', (d) => d[1])
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseleave', mouseleave);

	const yAxis = d3.axisLeft(yScale)
	d3.select('svg')
		.append('g')
		.attr('id', 'y-axis')
		.attr('transform', 'translate(' + padding + ", 0)")
		.call(yAxis);

	const ticks = [];
	const xAxis = d3.axisBottom(xScale).tickFormat((d) => {
		const year = d.getFullYear();
		if (ticks.includes(year)) return "";
		ticks.push(year);
		return year;
	});

	d3.select('svg')
		.append('g')
		.attr('id', 'x-axis')
		.attr('transform', 'translate(0, ' + (h - padding) + ")")
		.call(xAxis);
}

function filterData() {
	const isInsideInterval = (value) => value >= selectedMin && value <= selectedMax;
	const newData = {};

	newData.data = globalData.data.filter(v => isInsideInterval(+v[0].slice(0, 4)));

	clear();
	renderData(newData);
}

function clear() {
	d3.select('#graph').html('<svg width="800" height="500" viewBox="0 0 800 480"></svg>');
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

window.addEventListener('resize', () => {
	if (window.innerWidth < w) document.querySelector('main').style.transform = `scale(${(window.innerWidth - 20) / w})`;
	else document.querySelector('main').style.transform = '';
});

window.addEventListener('load', () => window.dispatchEvent(new Event('resize')));