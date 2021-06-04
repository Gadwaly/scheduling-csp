import { CourseGroup, Variable } from "../csp/models";
import { variables } from '../csp/csp';

export const setVariables = (courses: any) => {
  courses.forEach((course: any) => {
    let groups: any = [];
    course.groups.map((group: any) => {
      if (group.hasTutorial && group.hasLab) {
        groups.push(
          new CourseGroup([
            group.lectures[0],
            group.lectures[1],
            group.tutorials[0],
            group.labs[0],
          ])
        );
        groups.push(
          new CourseGroup([
            group.lectures[0],
            group.lectures[1],
            group.tutorials[1],
            group.labs[0],
          ])
        );
        groups.push(
          new CourseGroup([
            group.lectures[0],
            group.lectures[1],
            group.tutorials[0],
            group.labs[1],
          ])
        );
        groups.push(
          new CourseGroup([
            group.lectures[0],
            group.lectures[1],
            group.tutorials[1],
            group.labs[1],
          ])
        );
      } else if (group.hasLab) {
        groups.push(
          new CourseGroup([
            group.lectures[0],
            group.lectures[1],
            group.labs[0],
          ])
        );
        groups.push(
          new CourseGroup([
            group.lectures[0],
            group.lectures[1],
            group.labs[1],
          ])
        );
      } else if (group.hasTutorial) {
        groups.push(
          new CourseGroup([
            group.lectures[0],
            group.lectures[1],
            group.tutorials[0],
          ])
        );
        groups.push(
          new CourseGroup([
            group.lectures[0],
            group.lectures[1],
            group.tutorials[1],
          ])
        );
      } else {
        groups.push(new CourseGroup([group.lectures[0], group.lectures[1]]));
      }
    });
    variables.push(new Variable(course.name, groups));
  });
};


/*
{
	"courses": [
		{
			"code": "CC461",
			"name": "anyName",
			"creditHours": "3",
			"hasLab": true,
			"hasTutorial": false,
			"groups": [
			{
				"id": 12,
				"number": 1,
				"instructor": {
					"id": 13,
					"name": "Ahmed"
				},
				"lectures": [
					{
						"id": 121212,
						"place": {
							"room": 12,
							"building": 232,
							"label": "Hello world"
						},
						"day": "Saturday",
						"from": 1,
						"to": 2,
						"label": "Hello World",
						"instructor": {
							"id": 13,
							"name": "Ahmed"
						}
					}
				],
				"tutorials": [
					{
						"id": 121212,
						"place": {
							"room": 12,
							"building": 232,
							"label": "Hello world"
						},
						"day": "Saturday",
						"from": 1,
						"to": 2,
						"label": "Hello World",
						"instructor": {
							"id": 13,
							"name": "Ahmed"
						}
					}
				],
				"labs": [
					{
						"id": 121212,
						"place": {
							"room": 12,
							"building": 232,
							"label": "Hello world"
						},
						"day": "Saturday",
						"from": 1,
						"to": 2,
						"label": "Hello World",
						"instructor": {
							"id": 13,
							"name": "Ahmed"
						}
					}
				]
			},
			..
			]
		}
	],
	"preferences": {
		"courses": [
		{
			"code": "CC461",
			"instructor": "5|null"
		},
		{
			"code": "CC462",
			"instructor": "7|null"
		},
		..
		],
		"earlyLate": {
			"value": "early" | "late" | null,
			"order": "3" | null,
		},
		"daysOff": {
			"value": ["saturday", "thursday"],
			"order": "5" | null,
		},
		"gaps": {
			"value": "min" | "max" | null,
			"order": "6" | null,
		}
		"minMaxDays": {
			"value": "min" | "max" | null,
			"order": "6" | null
		}
	}
}
*/
