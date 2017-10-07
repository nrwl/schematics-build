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
var config_file_utils_1 = require("../utility/config-file-utils");
function addLibToAngularCliJson(options) {
    return function (host) {
        if (!host.exists('.angular-cli.json')) {
            throw new Error('Missing .angular-cli.json');
        }
        var sourceText = host.read('.angular-cli.json').toString('utf-8');
        var json = JSON.parse(sourceText);
        json.apps = config_file_utils_1.addApp(json.apps, {
            name: options.name,
            root: fullPath(options),
            test: '../../../test.js',
            appRoot: ''
        });
        host.overwrite('.angular-cli.json', JSON.stringify(json, null, 2));
        return host;
    };
}
function default_1(schema) {
    var options = __assign({}, schema, { name: schematics_2.toFileName(schema.name) });
    var fullPath = path.join('libs', schematics_2.toFileName(options.name), options.sourceDir);
    var templateSource = schematics_1.apply(schematics_1.url(options.ngmodule ? './ngfiles' : './files'), [
        schematics_1.template(__assign({}, schematics_2.names(options.name), { dot: '.', tmpl: '' }, options))
    ]);
    return schematics_1.chain([schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)])), addLibToAngularCliJson(options)]);
}
exports.default = default_1;
function fullPath(options) {
    return path.join('libs', options.name, options.sourceDir);
}
