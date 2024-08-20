import { select, max, min, scaleLinear, axisLeft, axisBottom, line, extent } from 'd3';

export const generateLinearXScale = (data, chartContainerRef, minVal, maxVal, margin) => {
	margin *= 2;
	const containerWidth = chartContainerRef.getBoundingClientRect().width;

	const xScale = scaleLinear()
		.domain([minVal || min(data, (d) => d.x), maxVal || max(data, (d) => d.x)])
		.range([0, containerWidth - (margin || 0)]);

	return xScale;
};

export const generateLinearYScale = (data, chartContainerRef, minVal, maxVal, margin) => {
	margin *= 2;
	const containerHeight = chartContainerRef.getBoundingClientRect().height;

	const yScale = scaleLinear()
		.domain([minVal || min(data, (d) => d.y), maxVal || max(data, (d) => d.y)])
		.range([containerHeight - (margin || 0), 0]);

	return yScale;
};

export const generateLinearScales = (data, chartContainerRef, xMin, xMax, yMin, yMax, margin) => {
	const xScale = generateLinearXScale(data, chartContainerRef, xMin, xMax, margin);
	const yScale = generateLinearYScale(data, chartContainerRef, yMin, yMax, margin);

	return { xScale, yScale };
};

export const resizeScales = (
	data,
	chartContainerRef,
	xAxisElement,
	yAxisElement,
	xMin,
	xMax,
	yMin,
	yMax,
	margin
) => {
	const containerHeight = chartContainerRef.offsetHeight;

	const { xScale, yScale } = generateLinearScales(
		data,
		chartContainerRef,
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

export const updatePointPosition = (data, chartContainerRef, xScale, yScale, margin) => {
	select(chartContainerRef)
		.selectAll('circle')
		.transition()
		.attr('cx', (d, i) => xScale(d.x) + margin / 2)
		.attr('cy', (d, i) => yScale(d.y) + margin / 2);
};

export const updateLinePath = (chartContainerRef, xScale, yScale, margin) => {
	const lineData = line()
		.x((d, i) => xScale(d.x))
		.y((d, i) => yScale(d.y));

	select(chartContainerRef).select('.line').transition().attr('d', lineData);
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
