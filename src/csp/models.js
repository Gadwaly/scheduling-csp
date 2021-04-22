"use strict";
exports.__esModule = true;
exports.CurrentSchedule = exports.CourseGroup = exports.Variable = void 0;
var Variable = /** @class */ (function () {
    function Variable(name, domain) {
        this.assignedValue = null;
        this.domain = domain;
        this.courseName = name;
    }
    Variable.prototype.pickFromDomain = function () {
        this.assignedValue = this.domain.find(function (value) {
            !value.discarded;
        });
    };
    Variable.prototype.filterDomain = function (currentSchedule) {
        var discardedCGroupsIndices = [];
        this.domain.forEach(function (courseGroup, index) {
            if (!courseGroup.discarded) {
                if (courseGroup.clashesWith(currentSchedule)) {
                    courseGroup.discarded = true;
                    discardedCGroupsIndices.push(index);
                }
            }
        });
        return discardedCGroupsIndices;
    };
    return Variable;
}());
exports.Variable = Variable;
var CourseGroup = /** @class */ (function () {
    function CourseGroup(group) {
        group = group.filter(function (period) { return period !== undefined; });
        this.periods = group.map(function (period) {
            var dayBase = period[0] * 12;
            return [dayBase + (period[1] - 1), dayBase + (period[2] - 1)];
        });
        this.discarded = false;
        this.weight = 0;
    }
    CourseGroup.prototype.clashesWith = function (currentSchedule) {
        return this.periods.every(function (period) {
            for (var i = period[0]; i < period[1] + 1; i++) {
                if (currentSchedule.schedule[i]) {
                    return true;
                }
            }
            return false;
        });
    };
    return CourseGroup;
}());
exports.CourseGroup = CourseGroup;
var CurrentSchedule = /** @class */ (function () {
    function CurrentSchedule() {
        this.schedule = [];
        this.scheduleGroups = [];
    }
    CurrentSchedule.prototype.update = function (groups) {
        var _this = this;
        this.scheduleGroups = groups;
        this.schedule = new Array(72).fill(false);
        groups.forEach(function (group) {
            group.periods.forEach(function (period) {
                for (var i = period[0]; i < period[1] + 1; i++) {
                    _this.schedule[i] = true;
                }
            });
        });
    };
    return CurrentSchedule;
}());
exports.CurrentSchedule = CurrentSchedule;
