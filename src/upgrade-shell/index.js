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
var name_utils_1 = require("../utility/name-utils");
var path = require("path");
var ts = require("typescript");
var ast_utils_1 = require("../utility/ast-utils");
var route_utils_1 = require("@schematics/angular/utility/route-utils");
var lib_versions_1 = require("../utility/lib-versions");
function addImportsToModule(moduleClassName, angularJsModule, options) {
    return function (host) {
        if (!host.exists(options.module)) {
            throw new Error('Specified module does not exist');
        }
        var modulePath = options.module;
        var sourceText = host.read(modulePath).toString('utf-8');
        var source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
        ast_utils_1.insert(host, modulePath, [
            route_utils_1.insertImport(source, modulePath, "configure" + name_utils_1.toClassName(angularJsModule) + ", upgradedComponents", "./" + name_utils_1.toFileName(angularJsModule) + "-setup"),
            route_utils_1.insertImport(source, modulePath, 'UpgradeModule', '@angular/upgrade/static')
        ].concat(ast_utils_1.addImportToModule(source, modulePath, "UpgradeModule"), ast_utils_1.addDeclarationToModule(source, modulePath, "...upgradedComponents"), ast_utils_1.addEntryComponents(source, modulePath, ast_utils_1.getBootstrapComponent(source, moduleClassName))));
        return host;
    };
}
function addNgDoBootstrapToModule(moduleClassName, angularJsModule, options) {
    return function (host) {
        var modulePath = options.module;
        var sourceText = host.read(modulePath).toString('utf-8');
        var source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
        ast_utils_1.insert(host, modulePath, ast_utils_1.addParameterToConstructor(source, modulePath, {
            className: moduleClassName,
            param: 'private upgrade: UpgradeModule'
        }).concat(ast_utils_1.addMethod(source, modulePath, {
            className: moduleClassName,
            methodHeader: 'ngDoBootstrap(): void',
            body: "\nconfigure" + name_utils_1.toClassName(angularJsModule) + "(this.upgrade.injector);\nthis.upgrade.bootstrap(document.body, ['downgraded', '" + angularJsModule + "']);\n        "
        }), ast_utils_1.removeFromNgModule(source, modulePath, 'bootstrap')));
        return host;
    };
}
function createFiles(moduleClassName, moduleFileName, angularJsModule, options) {
    return function (host, context) {
        var modulePath = options.module;
        var moduleSourceText = host.read(modulePath).toString('utf-8');
        var moduleSource = ts.createSourceFile(modulePath, moduleSourceText, ts.ScriptTarget.Latest, true);
        var bootstrapComponentClassName = ast_utils_1.getBootstrapComponent(moduleSource, moduleClassName);
        var bootstrapComponentFileName = name_utils_1.toFileName(bootstrapComponentClassName.substring(0, bootstrapComponentClassName.length - 9)) + ".component";
        var moduleDir = path.dirname(options.module);
        var templateSource = schematics_1.apply(schematics_1.url('./files'), [
            schematics_1.template(__assign({}, options, { tmpl: '', moduleFileName: moduleFileName,
                moduleClassName: moduleClassName,
                angularJsModule: angularJsModule,
                bootstrapComponentClassName: bootstrapComponentClassName,
                bootstrapComponentFileName: bootstrapComponentFileName }, name_utils_1.names(angularJsModule))),
            schematics_1.move(moduleDir)
        ]);
        var r = schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)]));
        return r(host, context);
    };
}
function addUpgradeToPackageJson() {
    return function (host) {
        if (!host.exists("package.json"))
            return host;
        var sourceText = host.read('package.json').toString('utf-8');
        var json = JSON.parse(sourceText);
        if (!json['dependencies']) {
            json['dependencies'] = {};
        }
        if (!json['dependencies']['@angular/upgrade']) {
            json['dependencies']['@angular/upgrade'] = json['dependencies']['@angular/core'];
        }
        if (!json['dependencies']['angular']) {
            json['dependencies']['angular'] = lib_versions_1.angularJsVersion;
        }
        host.overwrite('package.json', JSON.stringify(json, null, 2));
        return host;
    };
}
function default_1(options) {
    var moduleFileName = path.basename(options.module, '.ts');
    var moduleClassName = "" + name_utils_1.toClassName(moduleFileName);
    var angularJsModule = options.angularJsModule ? options.angularJsModule : path.basename(options.angularJsImport);
    return schematics_1.chain([
        createFiles(moduleClassName, moduleFileName, angularJsModule, options),
        addImportsToModule(moduleClassName, angularJsModule, options),
        addNgDoBootstrapToModule(moduleClassName, angularJsModule, options),
        options.skipPackageJson ? schematics_1.noop() : addUpgradeToPackageJson()
    ]);
}
exports.default = default_1;
