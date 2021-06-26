import Select from "react-select";
import styles from "./style.module.css";
import { dummyCourses } from "./data";
import { useEffect, useState } from "react";
import Course from "./interfaces/Course";
import CourseCard from "../CourseCard";
import Preference from "./Preference";

const days = [
  { label: "Sat", value: "saturday" },
  { label: "Sun", value: "sunday" },
  { label: "Mon", value: "monday" },
  { label: "Tue", value: "tuesday" },
  { label: "Wed", value: "wednesday" },
  { label: "Thu", value: "thursday" },
  { label: "Fri", value: "friday" },
];

const PreferencesSelector = (props) => {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const [totalCreditHours, setTotalCreditHours] = useState<number>(0);
  const [daysOff, setDaysOff] = useState<any[]>([]);
  const [earlyLate, setEarlyLate] = useState<any>(null);
  const [minMaxDays, setMinMaxDays] = useState<any>([]);
  const [gaps, setGaps] = useState<any>(null);
  const [priorityDaysOff, setPriorityDaysOff] = useState<number>(0);
  const [priorityEarlyLate, setPriorityEarlyLate] = useState<number>(0);
  const [priorityMinMaxDays, setPriorityMinMaxDays] = useState<number>(0);
  const [priorityGaps, setPriorityGaps] = useState<number>(0);


  useEffect(() => {
	  props.buildPreferences(myCourses, [daysOff.map((day) => day.value), priorityDaysOff], [earlyLate?.value, priorityEarlyLate], [minMaxDays?.value, priorityMinMaxDays], [gaps?.value, priorityGaps])
  }, [myCourses, daysOff, earlyLate, minMaxDays, gaps, priorityDaysOff, priorityEarlyLate, priorityMinMaxDays, priorityGaps])

  const addCourses = () => {
    setMyCourses(myCourses.concat(selectedCourses));
    setSelectedCourses([]);
  };

  const setSelectedInstructor = (course: Course, instructorId: number) => {
    course.selectedInstructor = instructorId;
  };

  const filterOption = (option: any, inputValue: any) => {
    if (myCourses.map((course) => course.code).includes(option.value)) {
      return false;
    }
    return true;
  };

  const removeCourse = (id: number) => {
    setMyCourses(myCourses.filter((course) => course.id != id));
  };

  const generate = () => {
    console.log("GENERATED");
  };

  return (
    <div id={styles.registrationContainer}>
      <div id={styles.coursesSelectorContainer}>
        <Select
          id={styles.coursesSelector}
          isMulti
          closeMenuOnSelect={false}
          options={props.availableCourses}
          getOptionLabel={(option) => `${option?.name}`}
          getOptionValue={(option) => `${option?.code}`}
          placeholder={"Select Courses"}
          classNamePrefix="courses-select"
          value={selectedCourses}
          onChange={(val) => setSelectedCourses(val.slice())}
          filterOption={filterOption}
        />
        <button onClick={addCourses} id={styles.coursesSelectorButton}>
          {"Add Courses"}
        </button>
      </div>
      <div id={styles.coursesCards}>
        {myCourses.length > 0 && (
          <span id={styles.creditHours}>{totalCreditHours}</span>
        )}
        {myCourses.map((course) => {
          return (
            <CourseCard
              key={course.code}
              course={course}
              removeCourse={removeCourse}
              setSelectedInstructor={setSelectedInstructor}
            />
          );
        })}
      </div>
      {myCourses.length > 0 && (
        <>
          <div id={styles.preferences}>
            <Preference
              id={styles.daysOffSelector}
              isMulti={true}
              isClearable={false}
              closeMenuOnSelect={false}
              options={days}
              placeholder={"Select Days Off"}
              classNamePrefix="days-off-select"
              function={[daysOff, setDaysOff]}
              priority={[priorityDaysOff, setPriorityDaysOff]}
            />

            <Preference
              id={styles.earlyLate}
              isClearable={true}
              isMulti={false}
              options={[
                { label: "Minimum Days", value: "min_days" },
                { label: "Maximum Days", value: "max_days" },
              ]}
              placeholder={"Select Min Max Days"}
              classNamePrefix="min-max-days"
              function={[minMaxDays, setMinMaxDays]}
              priority={[priorityMinMaxDays, setPriorityMinMaxDays]}
            />

            <Preference
              id={styles.earlyLate}
              isClearable={true}
              isMulti={false}
              options={[
                { label: "Early Bird", value: "early" },
                { label: "Night Owl", value: "late" },
              ]}
              placeholder={"Select Early Late"}
              classNamePrefix="early-late-select"
              function={[earlyLate, setEarlyLate]}
              priority={[priorityEarlyLate, setPriorityEarlyLate]}
            />

            <Preference
              id={styles.gaps}
              isClearable={true}
              isMulti={false}
              options={[
                { label: "Minimum Gaps", value: "min" },
                { label: "Maximum Gaps", value: "max" },
              ]}
              placeholder={"Gaps (Optional)"}
              classNamePrefix="gaps-select"
              function={[gaps, setGaps]}
              priority={[priorityGaps, setPriorityGaps]}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PreferencesSelector;