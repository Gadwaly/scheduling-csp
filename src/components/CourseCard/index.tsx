import { useEffect, useState } from "react";
import Select from "react-select";
import Instructor from "../PreferencesSelector/interfaces/Instructor";
import styles from "./style.module.css";

const CourseCard = (props: any) => {
	const [instructors, setInstructors] = useState<Instructor[]>([]);

	useEffect(() => {
		setInstructors(props.course.instructors);
	}, []);
	
	const setInstructor = (instructor: Instructor) => {
		props.setSelectedInstructor(props.course, instructor?.id)
	}
	return (
		<div className={styles.card}>
			<div className={styles.courseName}>{props.course.name}</div>
			<div>
				<Select
					class={styles.instructorSelector}
					options={instructors}
					getOptionLabel={(option) => `${option.name}`}
					getOptionValue={(option) => `${option.id}`}
					placeholder={"Select Instructor"}
					classNamePrefix="instructor-select"
					onChange={(instructor: any) => setInstructor(instructor)}
					isClearable
				/>
				<button className={styles.removeCourseButton} onClick={() => props.removeCourse(props.course.id)}>
					{"Delete"}
				</button>
			</div>
		</div>
	);
};

export default CourseCard;
