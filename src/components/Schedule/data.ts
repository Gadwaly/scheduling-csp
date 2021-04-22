import Period, { Day, PeriodType } from "../../interfaces/Period";

export const dummySchedule: Period[] = [
	{
		id: 1,
		type: PeriodType.Tutorial,
		day: Day.Sat,
		from: 1,
		to: 1,
		instructor: {
			name: "أ.د. عمرو المصرى",
		},
		place: {
			name: "35",
		},
		timetable_course: {
			course: {
				name: "Senior Project 2",
			},
			group: {
				term: { number: "10" },
				number: "Group 1",
			},
		},
	},
	{
		id: 3,
		type: PeriodType.Lab,
		day: Day.Tue,
		from: 4,
		to: 4,
		instructor: {
			name: "أ.د. عمرو المصرى",
		},
		place: {
			name: "قاعة 10",
		},
		timetable_course: {
			course: {
				name: "Senior Project 2",
			},
			group: {
				term: { number: "10" },
				number: "Group 1",
			},
		},
	},
	{
		id: 5,
		type: PeriodType.Lecture,
		day: Day.Mon,
		from: 10,
		to: 12,
		instructor: {
			name: "د. نجية غانم ",
		},
		place: {
			name: "فصل 8- Preparatory Building First Floor South",
		},
		timetable_course: {
			course: {
				name: "Programming Languages Translation",
			},
			group: {
				term: { number: "10" },
				number: "Group 2",
			},
		},
	},
	{
		id: 2,
		type: PeriodType.Lecture,
		day: Day.Tue,
		from: 1,
		to: 3,
		instructor: {
			name: "أ.د. عمرو المصرى",
		},
		place: {
			name: "39",
		},
		timetable_course: {
			course: {
				name: "Senior Project 2",
			},
			group: {
				term: { number: "10" },
				number: "Group 1",
			},
		},
	},
	{
		id: 4,
		type: PeriodType.Tutorial,
		day: Day.Mon,
		from: 8,
		to: 8,
		place: {
			name: "Class 702 - Electricity Building Seventh Floor",
		},
		timetable_course: {
			course: {
				name: "Programming Languages Translation",
			},
			group: {
				term: { number: "10" },
				number: "Group 2",
			},
		},
	},
];
