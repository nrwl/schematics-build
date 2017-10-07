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
var schematics_2 = require("@nrwl/schematics");
var path = require("path");
var ts = require("typescript");
var ast_utils_1 = require("@schematics/angular/utility/ast-utils");
var route_utils_1 = require("@schematics/angular/utility/route-utils");
var config_file_utils_1 = require("../utility/config-file-utils");
function addBootstrap(path) {
    return function (host) {
        var modulePath = path + "/app/app.module.ts";
        var moduleSource = host.read(modulePath).toString('utf-8');
        var sourceFile = ts.createSourceFile(modulePath, moduleSource, ts.ScriptTarget.Latest, true);
        schematics_2.insert(host, modulePath, [
            route_utils_1.insertImport(sourceFile, modulePath, 'BrowserModule', '@angular/platform-browser')
        ].concat(schematics_2.addImportToModule(sourceFile, modulePath, 'BrowserModule'), ast_utils_1.addBootstrapToModule(sourceFile, modulePath, 'AppComponent', './app.component')));
        return host;
    };
}
function addNxModule(path) {
    return function (host) {
        var modulePath = path + "/app/app.module.ts";
        var moduleSource = host.read(modulePath).toString('utf-8');
        var sourceFile = ts.createSourceFile(modulePath, moduleSource, ts.ScriptTarget.Latest, true);
        schematics_2.insert(host, modulePath, [
            route_utils_1.insertImport(sourceFile, modulePath, 'NxModule', '@nrwl/nx')
        ].concat(schematics_2.addImportToModule(sourceFile, modulePath, 'NxModule.forRoot()')));
        return host;
    };
}
function addAppToAngularCliJson(options) {
    return function (host) {
        if (!host.exists('.angular-cli.json')) {
            throw new Error('Missing .angular-cli.json');
        }
        var sourceText = host.read('.angular-cli.json').toString('utf-8');
        var json = JSON.parse(sourceText);
        json.apps = config_file_utils_1.addApp(json.apps, {
            name: options.name,
            root: fullPath(options),
            outDir: "dist/apps/" + options.name,
            assets: ['assets', 'favicon.ico'],
            index: 'index.html',
            main: 'main.ts',
            polyfills: 'polyfills.ts',
            test: '../../../test.js',
            tsconfig: '../../../tsconfig.app.json',
            testTsconfig: '../../../tsconfig.spec.json',
            prefix: options.prefix,
            styles: ["styles." + options.style],
            scripts: [],
            environmentSource: 'environments/environment.ts',
            environments: {
                dev: 'environments/environment.ts',
                prod: 'environments/environment.prod.ts'
            }
        });
        host.overwrite('.angular-cli.json', JSON.stringify(json, null, 2));
        return host;
    };
}
function default_1(schema) {
    var options = __assign({}, schema, { name: schematics_2.toFileName(schema.name) });
    var templateSource = schematics_1.apply(schematics_1.url('./files'), [
        schematics_1.template(__assign({ utils: stringUtils, dot: '.', tmpl: '' }, options))
    ]);
    var selector = options.prefix + "-root";
    return schematics_1.chain([
        schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)])),
        schematics_1.externalSchematic('@schematics/angular', 'module', {
            name: 'app',
            commonModule: false,
            flat: true,
            routing: options.routing,
            sourceDir: fullPath(options),
            spec: false
        }),
        schematics_1.externalSchematic('@schematics/angular', 'component', {
            name: 'app',
            selector: selector,
            sourceDir: fullPath(options),
            flat: true,
            inlineStyle: options.inlineStyle,
            inlineTemplate: options.inlineTemplate,
            spec: !options.skipTests,
            styleext: options.style,
            viewEncapsulation: options.viewEncapsulation,
            changeDetection: options.changeDetection
        }),
        schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./component-files'), [
            options.inlineTemplate ? schematics_1.filter(function (path) { return !path.endsWith('.html'); }) : schematics_1.noop(),
            schematics_1.template(__assign({}, options, { tmpl: '' })),
            schematics_1.move(path.join(fullPath(options), 'app'))
        ]), schematics_1.MergeStrategy.Overwrite),
        addBootstrap(fullPath(options)),
        addNxModule(fullPath(options)),
        addAppToAngularCliJson(options)
    ]);
}
exports.default = default_1;
function fullPath(options) {
    return path.join('apps', options.name, options.sourceDir);
}
