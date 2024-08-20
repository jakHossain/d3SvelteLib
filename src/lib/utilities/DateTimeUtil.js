const fullMonthArr = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

const fullMonthArrAbbreviated = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

export const getMonthYear = (date, abbreviate = false) => {
	const [month, year] = [date.getMonth(), date.getFullYear()];
	console.log(year);
	if (abbreviate) {
		return fullMonthArrAbbreviated[month] + ' ' + year;
	}
	return fullMonthArr[month] + ' ' + year;
};
