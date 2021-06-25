import Instructor from "./Instructor";
import Place from "./Place";
import TimetableCourse from "./TimetableCourse";

enum PeriodType {
	Lecture = "lecture",
	LectureExtension = "lecture_extension",
	Lab = "lab",
	Tutorial = "tutorial",
}

enum Day {
	Sat,
	Sun,
	Mon,
	Tue,
	Wed,
	Thu,
	Fri,
}

export let daysMap: any = {
	saturday: 0,
	sunday: 1,
	monday: 2,
	tuesday: 3,
	wednesday: 4,
	thursday: 5,
	friday: 6,
};

export default interface Period {
	id?: number;
	type?: PeriodType;
	day: Day;
	from: number;
	to: number;
	place?: Place;
	instructor?: Instructor;
	timetable_course?: TimetableCourse;
}

export { PeriodType, Day };
