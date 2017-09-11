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
var schematics_2 = require("@nrwl/schematics");
var path = require("path");
function default_1(options) {
    var fullPath = path.join('libs', schematics_2.toFileName(options.name), options.sourceDir);
    var templateSource = schematics_1.apply(schematics_1.url(options.ngmodule ? './ngfiles' : './files'), [schematics_1.template(__assign({}, schematics_2.names(options.name), { dot: '.', tmpl: '' }, options))]);
    return schematics_1.chain([schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)]))]);
}
exports.default = default_1;
