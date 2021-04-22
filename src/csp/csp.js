"use strict";
exports.__esModule = true;
exports.CourseGroup = exports.Variable = exports.variables = void 0;
var timetable_1 = require("../data/timetable");
var models_1 = require("./models");
exports.Variable = models_1.Variable;
exports.CourseGroup = models_1.CourseGroup;
var variables = timetable_1.getVariables();
exports.variables = variables;
var currentSchedule = new models_1.CurrentSchedule();
var pickVariableToAssign = function () {
    // Picks the variable with the least number of domain values
    var min = 1000000;
    var selectedVariable = variables[0];
    variables.forEach(function (variable) {
        if (!variable.assignedValue && variable.domain.length < min) {
            selectedVariable = variable;
            min = variable.domain.length;
        }
    });
    return selectedVariable;
};
var forwardChecking = function () {
    var discardedValuesWithVariableIndex = [];
    var failed = false;
    var currentCourseGroups = variables
        .filter(function (variable) { return variable.assignedValue; })
        .map(function (variable) {
        return variable.assignedValue;
    });
    currentSchedule.update(currentCourseGroups);
    variables.forEach(function (variable, index) {
        if (!variable.assignedValue) {
            var filteredDomain = variable.filterDomain(currentSchedule);
            if (variable.domain.every(function (courseGroup) { return courseGroup.discarded; })) {
                failed = true;
            }
            discardedValuesWithVariableIndex.push([index, filteredDomain]);
        }
    });
    return {
        failed: failed,
        discardedValuesWithVariableIndex: discardedValuesWithVariableIndex
    };
};
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
var csp = function () {
    console.log("---------------------------------------------------------------------------------\n---------------------------------------------------------------------------------");
    console.log(currentSchedule, "\n-----");
    var all_assigned = variables.every(function (variable) {
        return variable.assignedValue;
    });
    console.log("ALL ASSIGNED:  ", all_assigned, "\n-----");
    if (all_assigned) {
        return true;
    }
    var currentVariable = pickVariableToAssign();
    console.log("PICKED VARIABLE:  ", currentVariable, "\n-----");
    currentVariable.domain
        .filter(function (value) { return !value.discarded; })
        .forEach(function (value) {
        currentVariable.assignedValue = value;
        var fcOutput = forwardChecking();
        console.log("FC OUTPUT:  ", fcOutput, "\n-----");
        console.log("VARIABLES AFTER FC:  ", variables, "\n-----");
        if (!fcOutput.failed) {
            return csp();
        }
        // backtrack
        // reset current variable assignment
        currentVariable.assignedValue = null;
        // reset discarded values from fcOutput.discardedValues
        fcOutput.discardedValuesWithVariableIndex.forEach(function (variableDiscardedValues) {
            variableDiscardedValues[1].forEach(function (discardedValueIndex) {
                variables[variableDiscardedValues[0]].domain[discardedValueIndex].discarded = false;
            });
        });
    });
};
csp();
console.log(currentSchedule.scheduleGroups.map(function (cg) { return cg.periods; }));
console.log(currentSchedule.schedule);
