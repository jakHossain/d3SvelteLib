import { max, min, scaleLinear } from 'd3';

export const generateLinearXScale = (data, chartContainerRef, minVal, maxVal, margin) => {
	const containerWidth = chartContainerRef.offsetHeight;

	const xScale = scaleLinear()
		.domain([minVal || min(data, (d) => d.x), maxVal || max(data, (d) => d.x)])
		.range([0, containerWidth - (margin || 0)]);

	return xScale;
};

export const generateLinearYScale = (data, chartContainerRef, minVal, maxVal, margin) => {
	const containerHeight = chartContainerRef.offsetHeight;

	const yScale = scaleLinear()
		.domain([minVal || min(data, (d) => d.y), maxVal || max(data, (d) => d.y)])
		.range([containerHeight - (margin || 0)], 0);

	return yScale;
};

export const generateLinearScales = (data, chartContainerRef, xMin, xMax, yMin, yMin, margin) => {
	const xScale = generateLinearXScale(data, chartContainerRef, xMin, xMax, margin);
	const yScale = generateLinearYScale(data, chartContainerRef, yMin, yMin, margin);

	return { xScale, yScale };
};
