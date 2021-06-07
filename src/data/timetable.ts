import { CourseGroup, Variable } from "../csp/models";
import { variables } from "../csp/csp";

export const setVariables = (courses: any) => {
  const courseCodes = Object.keys(courses);
  courseCodes.forEach((courseCode) => {
    let course = courses[courseCode];
    let groups: any = [];
    const groupNumbers = Object.keys(course.groups);
    groupNumbers.forEach((groupNum: any) => {
      let group = course.groups[groupNum];
      const tutorialIds = Object.keys(group.tutorials);
      const labIds = Object.keys(group.labs);
      if (course.hasTutorial && course.hasLab) {
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            {
              ...group.tutorials[tutorialIds[0]],
              id: tutorialIds[0],
              type: "tutorial",
            },
            { ...group.labs[labIds[0]], id: labIds[0], type: "lab" },
          ])
        );
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            {
              ...group.tutorials[tutorialIds[1]],
              id: tutorialIds[1],
              type: "tutorial",
            },
            { ...group.labs[labIds[0]], id: labIds[0], type: "lab" },
          ])
        );
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            {
              ...group.tutorials[tutorialIds[0]],
              id: tutorialIds[0],
              type: "tutorial",
            },
            { ...group.labs[labIds[1]], id: labIds[1], type: "lab" },
          ])
        );
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            {
              ...group.tutorials[tutorialIds[1]],
              id: tutorialIds[1],
              type: "tutorial",
            },
            { ...group.labs[labIds[1]], id: labIds[1], type: "lab" },
          ])
        );
      } else if (group.hasLab) {
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            { ...group.labs[labIds[0]], id: labIds[0], type: "lab" },
          ])
        );
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            { ...group.labs[labIds[1]], id: labIds[1], type: "lab" },
          ])
        );
      } else if (course.hasTutorial) {
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            {
              ...group.tutorials[tutorialIds[0]],
              id: tutorialIds[0],
              type: "tutorial",
            },
          ])
        );
        groups.push(
          new CourseGroup(groupNum, [
            group.lectures[0],
            group.lectures[1],
            {
              ...group.tutorials[tutorialIds[1]],
              id: tutorialIds[1],
              type: "tutorial",
            },
          ])
        );
      } else {
        groups.push(
          new CourseGroup(groupNum, [group.lectures[0], group.lectures[1]])
        );
      }
    });
    variables.push(new Variable(course.name, courseCode, groups));
  });
  console.log("CC100 VARIABLES-----------");
  console.log(JSON.parse(JSON.stringify(variables[1].domain)));
};
