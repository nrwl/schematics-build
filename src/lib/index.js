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
function addLibToAngularCliJson(options) {
    return function (host) {
        var appConfig = {
            'name': options.name,
            'root': path.join('libs', options.name, options.sourceDir),
            'test': '../../../test.js'
        };
        if (!host.exists('.angular-cli.json')) {
            throw new Error('Missing .angular-cli.json');
        }
        var sourceText = host.read('.angular-cli.json').toString('utf-8');
        var json = JSON.parse(sourceText);
        if (!json['apps']) {
            json['apps'] = [];
        }
        json['apps'].push(appConfig);
        host.overwrite('.angular-cli.json', JSON.stringify(json, null, 2));
        return host;
    };
}
function default_1(options) {
    var fullPath = path.join('libs', schematics_2.toFileName(options.name), options.sourceDir);
    var templateSource = schematics_1.apply(schematics_1.url(options.ngmodule ? './ngfiles' : './files'), [schematics_1.template(__assign({}, schematics_2.names(options.name), { dot: '.', tmpl: '' }, options))]);
    return schematics_1.chain([schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)])), addLibToAngularCliJson(options)]);
}
exports.default = default_1;
