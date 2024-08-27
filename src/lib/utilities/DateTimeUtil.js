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

export const getMonthDayYear = (date, abbreviate = false) => {
	console.log(date);
	const [month, day, year] = [date.getMonth(), date.getDate(), date.getFullYear()];

	if (abbreviate) {
		return `${fullMonthArrAbbreviated[month]} ${day}, ${year}`;
	}
	return `${fullMonthArr[month]} ${day}, ${year}`;
};
