<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		select,
		selectAll,
		group,
		line,
		area,
		scaleLinear,
		min,
		max,
		bisector,
		axisBottom,
		axisLeft,
		timeFormat
	} from 'd3';

	import SvgContainer from '../chartElements/SvgContainer.svelte';
	import { getMonthDayYear } from '../../utilities/DateTimeUtil';
	import {
		generateLinearYScale,
		getMinMaxFromDataObject,
		generateXDateScale,
		resizeDebounce
	} from '../../utilities/ChartUtil';
	import { initChartData } from '../../stores/ChartStore';
	import { initializeToolTip } from '../charts/interaction/TooltipUtility.js';
	import { defaultColors } from '../../utilities/ChartStyleData';

	export let chartData;
	export let margin = 25;
	export let minY;
	export let minX;
	export let maxY;
	export let maxX;

	//state variables
	let chartState;
	let tooltipState;
	let tooltipDisplay = { label: '', x: '', y: '' };

	const [subscribeChartState, chartStateDispatch] = initChartData();
	const unsubscribeChartState = subscribeChartState((state) => {
		chartState = state;
	});

	const processCsvData = () => {
		// date col should be first column in CSV
		const dateCol = chartData.fields[0];

		//convert date string to datetime values
		chartData.data = chartData.data.map((item) => {
			const convertedDate = new Date(item[dateCol]);
			return { ...item, [dateCol]: convertedDate };
		});

		if (!minX || !maxX) {
			const { minVal, maxVal } = getMinMaxFromDataObject(chartData.data, [dateCol]);

			if (!minX) minX = minVal;
			if (!maxX) maxX = maxVal;
		}

		if (!minY || !maxY) {
			const { minVal, maxVal } = getMinMaxFromDataObject(chartData.data, ['Value']);

			if (!minY) minY = minVal;
			if (!maxY) maxY = maxVal;
		}

		const groupedData = group(chartData.data, (d) => d.Candidate);

		const cleanedChartData = {};

		for (const [candidate, dataArr] of groupedData) {
			const candidatePollNums = {};
			const numGroups = group(dataArr, (d) => d.Type);
			for (const [type, numArr] of numGroups) {
				candidatePollNums[type] = numArr;
			}
			cleanedChartData[candidate] = candidatePollNums;
		}
		chartStateDispatch.setChartData({
			data: cleanedChartData,
			candidates: Object.keys(cleanedChartData)
		});

		console.log('initial setup', chartState.data);
	};
	processCsvData();

	const { enable, disable, subscribeTooltip } = initializeToolTip();

	const unsubscribeTooltip = subscribeTooltip((state) => {
		tooltipState = state;
	});

	//chart structure variables
	let svgContainer;
	let xScale;
	let yScale;
	let interpolatedYScale;
	let xAxis;
	let yAxis;
	let linePaths = {};
	let areas = {};

	const drawAreas = (candidateData, candidate, index) => {
		const lowData = candidateData.Low;
		const highData = candidateData.High;

		console.log('YO', lowData, highData);

		const areaData = area()
			.x((d, i) => xScale(lowData[i].Date))
			.y0((d, i) => yScale(lowData[i].Value))
			.y1((d, i) => yScale(highData[i].Value));

		areas[candidate] = select(svgContainer)
			.select('.chartBody')
			.append('g')
			.append('path')
			.datum(lowData)
			.attr('d', areaData)
			.attr('transform', `translate(${margin}, ${margin})`)
			.attr('fill', defaultColors[index])
			.attr('opacity', 0.2);
	};
	const drawLines = (candidateData, candidate, index) => {
		const lineData = line()
			.x((d, i) => xScale(d.Date))
			.y((d, i) => yScale(d.Value));

		linePaths[candidate] = select(svgContainer)
			.select('.chartBody')
			.append('g')
			.append('path')
			.datum(candidateData)
			.attr('d', lineData)
			.attr('fill', 'none')
			.attr('stroke-width', '3px')
			.attr('stroke', `${defaultColors[index]}`)
			.attr('transform', `translate(${margin}, ${margin})`);
	};

	const loadChart = () => {
		const data = chartState.data.data;

		xScale = generateXDateScale(svgContainer, minX, maxX, margin);
		yScale = generateLinearYScale(svgContainer, minY, maxY, margin);

		//draw axis
		xAxis = select(svgContainer)
			.select('.x-axis')
			.call(axisBottom(xScale))
			.attr(
				'transform',
				`translate(${margin}, ${svgContainer.getBoundingClientRect().height - margin})`
			);

		yAxis = select(svgContainer)
			.select('.y-axis')
			.call(axisLeft(yScale))
			.attr('transform', `translate(${margin}, ${margin})`);

		Object.keys(data).forEach((candidate, index) => {
			const candidateData = data[candidate];
			drawAreas(candidateData, candidate, index);
			drawLines(candidateData.Estimate, candidate, index);
		});
	};

	const resizeAxis = () => {
		yScale = generateLinearYScale(svgContainer, minY, maxY, margin);
		xScale = generateXDateScale(svgContainer, minX, maxX, margin);

		xAxis
			.transition()
			.call(axisBottom(xScale))
			.attr(
				'transform',
				`translate(${margin}, ${svgContainer.getBoundingClientRect().height - margin})`
			);
		yAxis.transition().call(axisLeft(yScale)).attr('transform', `translate(${margin}, ${margin})`);
	};

	const resizeLineAndAreaPaths = () => {
		const updateLineData = line()
			.x((d, i) => xScale(d.Date))
			.y((d, i) => yScale(d.Value));

		for (let candidate in linePaths) {
			linePaths[candidate].transition().attr('d', updateLineData);
		}

		Object.keys(chartState.data.data).forEach((candidate, index) => {
			const candidateData = chartState.data.data[candidate];

			const lowData = candidateData.Low;
			const highData = candidateData.High;

			const updatedAreaData = area()
				.x((d, i) => xScale(lowData[i].Date))
				.y0((d, i) => yScale(lowData[i].Value))
				.y1((d, i) => yScale(highData[i].Value));

			areas[candidate].transition().attr('d', updatedAreaData);
		});
	};

	const resizeFunc = () => {
		resizeAxis();
		resizeLineAndAreaPaths();
	};

	$: {
		if (chartState?.svgContainer) {
			svgContainer = chartState.svgContainer;
		}
	}

	const togglePathsOpacity = (opacity = 1) => {
		for (let path in linePaths) {
			linePaths[path].attr('opacity', opacity);
		}
	};

	const drawActivePaths = (dataIndex, invertedDate) => {
		togglePathsOpacity(0.4);
		selectAll('.active-line-paths').remove();

		let colorIndex = 0;
		for (let candidate of chartState.data.candidates) {
			const candidateData = chartState.data.data[candidate].Estimate.slice(0, dataIndex + 1);

			if (dataIndex + 1 < chartState.data.data[candidate].Estimate.length) {
				let interpolatedYScale = scaleLinear()
					.domain(chartState.data.data[candidate].Estimate.map((d) => d.Date))
					.range(chartState.data.data[candidate].Estimate.map((d) => d.Value));

				let interpolatedYVal = interpolatedYScale(invertedDate);

				if (candidateData[candidateData.length - 1].Date > invertedDate) {
					candidateData.pop();
				}

				candidateData.push({
					Date: invertedDate,
					Candidate: candidate,
					Type: 'Estimate',
					Value: interpolatedYVal
				});
			}
			const lineData = line()
				.x((d, i) => xScale(d.Date))
				.y((d, i) => yScale(d.Value));

			select(svgContainer)
				.select('.chartBody')
				.append('g')
				.append('path')
				.datum(candidateData)
				.attr('d', lineData)
				.attr('fill', 'none')
				.attr('stroke-width', '5px')
				.attr('stroke', `${defaultColors[colorIndex]}`)
				.attr('transform', `translate(${margin}, ${margin})`)
				.attr('class', 'active-line-paths');
			++colorIndex;
		}

		// console.log(invDate);
		// const testData = chartState.data.data['Candidate A'].Estimate[15];
		// interpolatedYScale = scaleLinear()
		// 	.domain(chartState.data.data['Candidate A'].Estimate.map((d) => d.Date))
		// 	.range(chartState.data.data['Candidate A'].Estimate.map((d) => d.Value));
		// console.log(testData);
		// console.log(interpolatedYScale(invDate));
	};

	const onIWHover = (mouseEvent) => {
		const positionRelSvg = mouseEvent.offsetX;
		const firstCandidate = chartState.data.candidates[0];
		const invertedData = xScale.invert(positionRelSvg);

		const dataIndex = bisector((d) => d.Date).center(
			chartState.data.data[firstCandidate].Estimate,
			invertedData
		);

		const formattedData = getMonthDayYear(xScale.invert(positionRelSvg));
		tooltipDisplay = { Date: formattedData };

		for (let candidate of chartState.data.candidates) {
			const estimate = chartState.data.data[candidate].Estimate[dataIndex].Value;
			const low = chartState.data.data[candidate].Low[dataIndex].Value;
			const high = chartState.data.data[candidate].Estimate[dataIndex].Value;

			tooltipDisplay[candidate] = { high, low, estimate };
		}

		drawActivePaths(dataIndex, invertedData);
		enable({ top: mouseEvent.clientY, left: mouseEvent.clientX });
	};

	const onIWExit = () => {
		disable();
		togglePathsOpacity(1);
		selectAll('.active-line-paths').remove();
	};

	$: svgContainer && chartState?.chartContainer && chartState?.data && loadChart();
</script>

<SvgContainer {chartStateDispatch} {resizeFunc} {tooltipState} {margin} {onIWHover} {onIWExit}>
	<span slot="chartTitle"
		>Poll Chart: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<span slot="chartDeck"
		>Chart deck: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<div slot="tooltipOutput">
		<h5 class="tooltip-label">{tooltipDisplay.Date}</h5>
		{#each chartState.data.candidates as candidate}
			<p class="tooltip-body">
				<strong>
					{candidate}:
				</strong>
			</p>
			<p>
				Est: {tooltipDisplay[candidate]?.estimate} | H: {tooltipDisplay[candidate]?.high} | L: {tooltipDisplay[
					candidate
				]?.low}
			</p>
		{/each}
	</div>
</SvgContainer>

<style>
	.tooltip-label {
		margin: 0.5em 0;
		font-size: 1.2rem;
	}

	.tooltip-body {
		font-size: 1rem;
		margin: 0;
	}

	.tooltip-body strong {
		font-size: 1rem;
		margin: 0;
	}
</style>
