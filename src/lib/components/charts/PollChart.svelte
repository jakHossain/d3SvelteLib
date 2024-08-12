<script>
	import {
		select,
		selectAll,
		area,
		max,
		min,
		scaleLinear,
		axisBottom,
		axisLeft,
		line,
		pointer,
		bisector
	} from 'd3';
	import {
		generateLinearXScale,
		getMaxFromArray,
		getMinFromArray
	} from '../../utilities/ChartUtil';
	import Tooltip from './interaction/Tooltip.svelte';
	import { onMount, onDestroy } from 'svelte';

	import { initializeToolTip } from './interaction/TooltipUtility';

	export let data;
	export let margin = 50;
	export let minX;
	export let maxX;
	export let minY;
	export let maxY;

	let chartContainerRef;
	let svg;
	let xAxis;
	let yAxis;
	let xScale;

	let toolTipLabels = {
		year: '',
		candidate1: '',
		candidate2: '',
		cand1Act: 0,
		cand1Low: 0,
		cand1High: 0,
		cand2Act: 0,
		cand2Low: 0,
		cand2High: 0
	};

	//get min/max values for x and y axis if not propped.

	const adjustDataMinMax = () => {
		data.shift();

		if (!minX) {
			minX = Math.round(min(data, (d) => d[0]));
		}
		if (!minY) {
			minY = Math.round(getMinFromArray(data));
		}
		if (!maxX) {
			maxX = Math.round(max(data, (d) => d[0]));
		}
		if (!maxY) {
			maxY = Math.round(getMaxFromArray(data));
		}
	};

	const loadChart = (chartContainerRef, data) => {
		console.log(chartContainerRef);
		xScale = scaleLinear()
			.domain([minX, maxX])
			.range([0, chartContainerRef.offsetWidth - (3 * margin) / 2]);

		const yScale = scaleLinear()
			.domain([minY, maxY])
			.range([chartContainerRef.offsetHeight - margin, 0]);

		const xAxisElement = axisBottom(xScale);
		const yAxisElement = axisLeft(yScale);

		//indices 1 and 4 are the actual values
		//2 and 5 are the lows
		//3 and 6 are the highs
		//0 is the date values for x-axis

		const areaGenerator1 = area()
			.x((d) => xScale(d[0]))
			.y0((d) => yScale(d[2]))
			.y1((d) => yScale(d[3]));

		const mainLine1 = line()
			.x((d) => xScale(d[0]))
			.y((d) => yScale(d[1]));

		const areaGenerator2 = area()
			.x((d) => xScale(d[0]))
			.y0((d) => yScale(d[5]))
			.y1((d) => yScale(d[6]));

		const mainLine2 = line()
			.x((d) => xScale(d[0]))
			.y((d) => yScale(d[4]));

		svg = select(chartContainerRef)
			.append('svg')
			.attr('height', chartContainerRef.offsetHeight - margin)
			.attr('width', chartContainerRef.offsetWidth - margin)
			.attr('transform', `translate(${margin / 2},${margin / 2})`)
			.style('position', 'relative')
			.style('border', 'black 2px solid')
			.datum(data);

		yAxis = svg
			.append('g')
			.call(yAxisElement)
			.attr('transform', `translate(${margin / 2}, 0)`);

		xAxis = svg
			.append('g')
			.call(xAxisElement)
			.attr('transform', `translate(${margin / 2}, ${chartContainerRef.offsetHeight - margin})`);

		svg
			.append('g')
			.append('path')
			.attr('d', areaGenerator1(data))
			.attr('transform', `translate(${margin / 2}, 0)`)
			.attr('fill', 'pink')
			.attr('opacity', 0.75);

		svg
			.append('g')
			.append('path')
			.attr('d', mainLine1(data))
			.attr('transform', `translate(${margin / 2}, 0)`)
			.attr('stroke', 'red')
			.attr('stroke-width', 3)
			.attr('fill', 'none');

		svg
			.append('g')
			.append('path')
			.attr('d', areaGenerator2(data))
			.attr('transform', `translate(${margin / 2}, 0)`)
			.attr('fill', 'lightblue')
			.attr('opacity', 0.75);

		svg
			.append('g')
			.append('path')
			.attr('d', mainLine2(data))
			.attr('transform', `translate(${margin / 2}, 0)`)
			.attr('stroke', 'blue')
			.attr('stroke-width', 3)
			.attr('fill', 'none');
	};

	const { subscribe, enable, disable } = initializeToolTip();

	let tooltipState;
	const unsubscribeTooltip = subscribe((state) => {
		tooltipState = state;
	});

	const loadInteractionWindow = (svg) => {
		if (!svg) return;

		const svgElement = svg.node();

		const interactionWindow = svg.append('rect');

		interactionWindow
			.attr('fill', 'lightblue')
			.attr('x', 0)
			.attr('width', svgElement.getBoundingClientRect().width - margin / 2)
			.attr('y', 0)
			.attr('height', '100%')
			.attr('opacity', 0.4)
			.attr('transform', `translate(${margin / 2},0)`);

		const interactionWindowNode = interactionWindow.node();

		const lineHover = svg
			.append('line')
			.attr('y2', 0)
			.attr('y1', interactionWindowNode.getBoundingClientRect().height)
			.attr('x1', margin / 2)
			.attr('x2', margin / 2)
			.attr('stroke', 'black') // color of the line
			.attr('stroke-width', '1px')
			.style('stroke-dasharray', '3, 3')
			.style('display', 'none');

		interactionWindow
			.on('mouseenter', function (event) {
				lineHover.style('display', 'block');
			})
			.on('mouseout', function () {
				disable();
				lineHover.style('display', 'none');
			})
			.on('mousemove', function (event) {
				const [defaultX, y] = pointer(event);
				const [svgX, svgY] = pointer(event, svgElement);

				lineHover.attr('x1', svgX).attr('x2', svgX);

				const chartData = svg.datum();
				const dataIndex = bisector((d) => d[0]).center(
					chartData,
					xScale.invert(Math.floor(defaultX))
				);
				console.log(svg.datum()[dataIndex]);

				const [year, cand1Act, cand1Low, cand1High, cand2Act, cand2Low, cand2High] =
					chartData[dataIndex];

				toolTipLabels = {
					year,
					cand1Act,
					cand1Low,
					cand1High,
					cand2Act,
					cand2Low,
					cand2High,
					candidate1: '',
					candidate2: ''
				};

				const svgElementViewPortPos = svgElement.getBoundingClientRect();
				enable({
					top: svgY + svgElementViewPortPos.top,
					left: svgX + svgElementViewPortPos.left
				});
			})
			.raise();
	};

	onMount(() => {
		adjustDataMinMax();
		if (chartContainerRef && data) {
			console.log('present', data);
			loadChart(chartContainerRef, data);
		}

		loadInteractionWindow(svg);

		const lines = select('path');
		console.log(lines);
	});

	onDestroy(() => {
		unsubscribeTooltip();
		if (typeof window == 'undefined') {
		}
	});
</script>

<div class="chart-container" bind:this={chartContainerRef}>
	{#if chartContainerRef}
		<Tooltip {tooltipState} {chartContainerRef}>
			<h3>{toolTipLabels.year}</h3>
			<div class="tooltipTextContainer">
				<h4>{toolTipLabels.candidate1}</h4>
				<p><strong>Actual:</strong> {toolTipLabels.cand1Act.toFixed(2)}%</p>
				<p><strong>High:</strong> {toolTipLabels.cand1High.toFixed(2)}%</p>
				<p><strong>Low:</strong> {toolTipLabels.cand1Low.toFixed(2)}%</p>
			</div>
			<div class="tooltipTextContainer">
				<h4>{toolTipLabels.candidate2}</h4>
				<p><strong>Actual:</strong> {toolTipLabels.cand2Act.toFixed(2)}%</p>
				<p><strong>High:</strong> {toolTipLabels.cand2High.toFixed(2)}%</p>
				<p><strong>Low:</strong> {toolTipLabels.cand2Low.toFixed(2)}%</p>
			</div>
		</Tooltip>
	{/if}
</div>

<style>
	.chart-container {
		height: 100%;
		width: 100%;
		border: solid black 1px;
	}
</style>
