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

export default interface Period {
  id?: number;
  type?: PeriodType;
  day: Day;
  from: number;
  to: number;
  course_name: string;
  instructor?: string;
}

export { PeriodType, Day };
