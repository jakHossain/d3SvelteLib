import Papa from 'papaparse';

export const readCsv = async (csv) => {
	console.log('ASDASD', csv);

	const result = Papa.parse(csv, {
		header: true // Use the first row as headers
	});

	return result;
};
