import Papa from 'papaparse';

export const readCsv = async (csv) => {
	let result = Papa.parse(csv, {
		header: true, // Use the first row as headers
		dynamicTyping: true
	});

	const fields = result.meta.fields.filter((item) => item.length >= 1);

	result = { ...result, fields };

	return result;
};
