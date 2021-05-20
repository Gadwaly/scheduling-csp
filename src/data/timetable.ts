import { CourseGroup, Variable } from "../csp/models";

export const courses: any = [
  {
    name: "DS2",
    groups: [
      {
        instructor: "x",
        lecture: [0, 7, 9],
        labs: [
          [0, 5, 5],
          [0, 6, 6],
        ],
      },
      {
        instructor: "x",
        lecture: [4, 7, 9],
        labs: [
          [4, 3, 3],
          [4, 4, 4],
        ],
      },
      {
        instructor: "x",
        lecture: [4, 10, 12],
        labs: [
          [2, 5, 5],
          [2, 6, 6],
        ],
      },
      {
        instructor: "x",
        lecture: [0, 10, 12],
        labs: [
          [0, 7, 7],
          [0, 8, 8],
        ],
      },
    ],
  },
  // {
  //   name: "Signals",
  //   groups: [
  //     {
  //       instructor: "x",
  //       lecture: [0, 3, 5],
  //       tutorials: [
  //         [0, 1, 1],
  //         [0, 2, 2],
  //       ],
  //     },
  //   ],
  // },
  {
    name: "Computer Architecture",
    groups: [
      {
        instructor: "x",
        lecture: [2, 6, 8],
        tutorials: [
          [5, 1, 1],
          [5, 2, 2],
        ],
      },
      {
        instructor: "x",
        lecture: [2, 6, 8],
        tutorials: [
          [1, 1, 1],
          [1, 2, 2],
        ],
      },
      {
        instructor: "x",
        lecture: [5, 5, 7],
        tutorials: [
          [5, 9, 9],
          [5, 10, 10],
        ],
      },
      {
        instructor: "x",
        lecture: [3, 6, 8],
        tutorials: [
          [4, 5, 5],
          [4, 6, 6],
        ],
      },
    ],
  },
  {
    name: "Systems Programming",
    groups: [
      {
        instructor: "x",
        lecture: [3, 3, 5],
        tutorials: [
          [3, 1, 1],
          [3, 2, 2],
        ],
      },
      {
        instructor: "x",
        lecture: [5, 3, 5],
        tutorials: [
          [5, 9, 9],
          [5, 10, 10],
        ],
      },
      {
        instructor: "x",
        lecture: [4, 5, 7],
        tutorials: [
          [1, 1, 1],
          [1, 2, 2],
        ],
      },
      {
        instructor: "x",
        lecture: [4, 1, 3],
        tutorials: [
          [5, 11, 11],
          [5, 12, 12],
        ],
      },
    ],
  },
  {
    name: "Microprocessors Systems",
    groups: [
      {
        instructor: "x",
        lecture: [4, 4, 6],
        tutorials: [
          [3, 1, 1],
          [3, 2, 2],
        ],
      },
      {
        instructor: "x",
        lecture: [3, 3, 5],
        tutorials: [
          [5, 7, 7],
          [5, 8, 8],
        ],
      },
      {
        instructor: "x",
        lecture: [2, 2, 4],
        tutorials: [
          [1, 1, 1],
          [1, 2, 2],
        ],
      },
      {
        instructor: "x",
        lecture: [3, 2, 4],
        tutorials: [
          [5, 9, 9],
          [5, 10, 10],
        ],
      },
    ],
  },
  {
    name: "DSP",
    groups: [
      {
        instructor: "x",
        lecture: [5, 3, 5],
        tutorials: [
          [5, 1, 1],
          [5, 2, 2],
        ],
      },
      {
        instructor: "x",
        lecture: [1, 4, 6],
        tutorials: [
          [1, 1, 1],
          [1, 2, 2],
        ],
      },
      {
        instructor: "x",
        lecture: [1, 4, 6],
        tutorials: [
          [5, 9, 9],
          [5, 10, 10],
        ],
      },
      {
        instructor: "x",
        lecture: [5, 6, 8],
        tutorials: [
          [4, 5, 5],
          [4, 6, 6],
        ],
      },
    ],
  },
  {
    name: "Accounting",
    groups: [
      {
        instructor: "x",
        lecture: [0, 9, 10],
      },
      {
        instructor: "x",
        lecture: [1, 11, 12],
      },
      {
        instructor: "x",
        lecture: [1, 9, 10],
      },
      {
        instructor: "x",
        lecture: [0, 11, 12],
      },
    ],
  },
];

export const getVariables = () => {
  let variables: Variable[] = [];
  courses.forEach((course: any) => {
    let groups: any = [];
    course.groups.map((group: any) => {
      if ("tutorials" in group && "labs" in group) {
        groups.push(
          new CourseGroup([
            group.lecture,
            group?.lectureExtension,
            group.tutorials[0],
            group.labs[0],
          ])
        );
        groups.push(
          new CourseGroup([
            group.lecture,
            group?.lectureExtension,
            group.tutorials[1],
            group.labs[0],
          ])
        );
        groups.push(
          new CourseGroup([
            group.lecture,
            group?.lectureExtension,
            group.tutorials[0],
            group.labs[1],
          ])
        );
        groups.push(
          new CourseGroup([
            group.lecture,
            group?.lectureExtension,
            group.tutorials[1],
            group.labs[1],
          ])
        );
      } else if ("labs" in group) {
        groups.push(
          new CourseGroup([
            group.lecture,
            group?.lectureExtension,
            group.labs[0],
          ])
        );
        groups.push(
          new CourseGroup([
            group.lecture,
            group?.lectureExtension,
            group.labs[1],
          ])
        );
      } else if ("tutorials" in group) {
        groups.push(
          new CourseGroup([
            group.lecture,
            group?.lectureExtension,
            group.tutorials[0],
          ])
        );
        groups.push(
          new CourseGroup([
            group.lecture,
            group?.lectureExtension,
            group.tutorials[1],
          ])
        );
      } else {
        groups.push(new CourseGroup([group.lecture, group?.lectureExtension]));
      }
    });
    variables.push(new Variable(course.name, groups));
  });
  return variables;
};
