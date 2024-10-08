import {
	select,
	max,
	min,
	scaleLinear,
	scaleTime,
	axisLeft,
	axisBottom,
	line,
	extent,
	scaleBand
} from 'd3';

export const generateLinearXScale = (svgContainerRef, minVal, maxVal, margin) => {
	//margin multiplied by 2 bc 50 margin is 50 margin on both sides
	margin *= 2;
	const containerWidth = svgContainerRef.getBoundingClientRect().width;

	console.log('LOOK', minVal, maxVal);

	const xScale = scaleLinear()
		.domain([minVal, maxVal])
		.range([0, containerWidth - (margin || 0)]);

	return xScale;
};

export const generateLinearYScale = (svgContainerRef, minVal, maxVal, margin) => {
	//margin multiplied by 2 bc 50 margin is 50 margin on both sides
	margin *= 2;
	const containerHeight = svgContainerRef.getBoundingClientRect().height;

	const yScale = scaleLinear()
		.domain([minVal, maxVal])
		.range([containerHeight - (margin || 0), 0]);

	return yScale;
};

export const generateBandXScale = (svgContainerRef, bandArr, padding, margin) => {
	const chartWidth = svgContainerRef.getBoundingClientRect().width - margin * 2;
	const bandScale = scaleBand().domain(bandArr).rangeRound([0, chartWidth]).padding(padding);

	return bandScale;
};

export const generateLinearScales = (svgContainerRef, xMin, xMax, yMin, yMax, margin) => {
	const xScale = generateLinearXScale(svgContainerRef, xMin, xMax, margin);
	const yScale = generateLinearYScale(svgContainerRef, yMin, yMax, margin);

	return { xScale, yScale };
};

export const generateXDateScale = (svgContainerRef, minVal, maxVal, margin) => {
	const containerWidth = svgContainerRef.getBoundingClientRect().width;
	const xDateScale = scaleTime([minVal, maxVal], [0, containerWidth - margin * 2]);

	return xDateScale;
};

export const resizeScales = (
	data,
	svgContainerRef,
	xAxisElement,
	yAxisElement,
	xMin,
	xMax,
	yMin,
	yMax,
	margin
) => {
	const containerHeight = svgContainerRef.offsetHeight;

	const { xScale, yScale } = generateLinearScales(
		data,
		svgContainerRef,
		xMin,
		xMax,
		yMin,
		yMax,
		margin
	);

	let axisX = axisBottom(xScale);
	let axisY = axisLeft(yScale);

	xAxisElement
		.transition()
		.call(axisX)
		.attr('transform', `translate(${margin / 2}, ${containerHeight - margin / 2})`);

	yAxisElement
		.transition()
		.call(axisY)
		.attr('transform', `translate(${margin / 2},${margin / 2})`);

	return { xScale, yScale };
};

export const updatePointPosition = (data, svgContainerRef, xScale, yScale, margin) => {
	select(svgContainerRef)
		.selectAll('circle')
		.transition()
		.attr('cx', (d, i) => xScale(d.x) + margin / 2)
		.attr('cy', (d, i) => yScale(d.y) + margin / 2);
};

export const updateLinePath = (svgContainerRef, xScale, yScale, margin) => {
	const lineData = line()
		.x((d, i) => xScale(d.x))
		.y((d, i) => yScale(d.y));

	select(svgContainerRef).select('.line').transition().attr('d', lineData);
};

export const getMinFromArray = (data) => {
	return min(data, (d) => {
		const minimum = min(d.slice(1, d.length));
		return minimum;
	});
};

export const getMaxFromArray = (data) => {
	return max(data, (d) => {
		const maximum = max(d.slice(1, d.length));
		return maximum;
	});
};

export const resizeDebounce = (resizeFunc, delay) => {
	let timerId;

	return () => {
		clearTimeout(timerId);
		timerId = setTimeout(() => {
			resizeFunc();
		}, delay);
	};
};

export const getMinMaxFromDataObject = (data, fields) => {
	const flattenedData = data.flatMap((d) => fields.map((field) => d[field]));

	const [minVal, maxVal] = extent(flattenedData);

	return { minVal, maxVal };
};
