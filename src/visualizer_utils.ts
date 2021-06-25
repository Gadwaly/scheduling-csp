export const formatCourseGroups = (courses: any) => {
    let tempAvailableCourses = []
    const courseCodes = Object.keys(courses);
    courseCodes.forEach(
      (courseCode: any, courseIndex: any) => {
        let instructors = []
        let course = courses[courseCode];
        const groupNumbers = Object.keys(course.groups);
        groupNumbers.forEach((groupNum: any) => {
          let group = course.groups[groupNum];
          instructors.push({
            id: group.instructor,
            name: group.instructor,
          });
        });
        instructors = [
          ...new Map(
            instructors.map((item: any) => {
              return [item["id"], item];
            })
          ).values(),
        ];
        tempAvailableCourses.push({
          id: courseIndex,
          name: course.name,
          code: courseCode,
          creditHours: course.creditHours,
          instructors,
          selectedInstructor: null
        });
      }
    );
    return tempAvailableCourses
  };