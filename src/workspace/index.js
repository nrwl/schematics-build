"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var schematics_1 = require("@angular-devkit/schematics");
var stringUtils = require("@schematics/angular/strings");
var lib_versions_1 = require("../utility/lib-versions");
function default_1(options) {
    var templateSource = schematics_1.apply(schematics_1.url('./files'), [schematics_1.template(__assign({ utils: stringUtils, dot: '.', nxVersion: lib_versions_1.nxVersion, schematicsVersion: lib_versions_1.schematicsVersion }, options))]);
    return schematics_1.chain([schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)]))]);
}
exports.default = default_1;
