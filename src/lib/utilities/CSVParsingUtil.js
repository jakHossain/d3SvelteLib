import Papa from 'papaparse';

export const readCsv = async (csv) => {
	const result = Papa.parse(csv, {
		header: false // Use the first row as headers
	});

	return result;
};
