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
var ast_utils_1 = require("../utility/ast-utils");
var route_utils_1 = require("@schematics/angular/utility/route-utils");
var common_1 = require("../utility/common");
function addImportsToModule(options) {
    return function (host) {
        var _a = ast_utils_1.readBootstrapInfo(host, options.app), moduleClassName = _a.moduleClassName, modulePath = _a.modulePath, moduleSource = _a.moduleSource;
        ast_utils_1.insert(host, modulePath, [
            route_utils_1.insertImport(moduleSource, modulePath, "configure" + name_utils_1.toClassName(options.name) + ", upgradedComponents", "../" + name_utils_1.toFileName(options.name) + "-setup"),
            route_utils_1.insertImport(moduleSource, modulePath, 'UpgradeModule', '@angular/upgrade/static')
        ].concat(ast_utils_1.addImportToModule(moduleSource, modulePath, 'UpgradeModule'), ast_utils_1.addDeclarationToModule(moduleSource, modulePath, '...upgradedComponents'), ast_utils_1.addEntryComponents(moduleSource, modulePath, ast_utils_1.getBootstrapComponent(moduleSource, moduleClassName))));
        return host;
    };
}
function addNgDoBootstrapToModule(options) {
    return function (host) {
        var _a = ast_utils_1.readBootstrapInfo(host, options.app), moduleClassName = _a.moduleClassName, modulePath = _a.modulePath, moduleSource = _a.moduleSource;
        ast_utils_1.insert(host, modulePath, ast_utils_1.addParameterToConstructor(moduleSource, modulePath, {
            className: moduleClassName,
            param: 'private upgrade: UpgradeModule'
        }).concat(ast_utils_1.addMethod(moduleSource, modulePath, {
            className: moduleClassName,
            methodHeader: 'ngDoBootstrap(): void',
            body: "\nconfigure" + name_utils_1.toClassName(options.name) + "(this.upgrade.injector);\nthis.upgrade.bootstrap(document.body, ['downgraded', '" + options.name + "']);\n        "
        }), ast_utils_1.removeFromNgModule(moduleSource, modulePath, 'bootstrap')));
        return host;
    };
}
function createFiles(angularJsImport, options) {
    return function (host, context) {
        var _a = ast_utils_1.readBootstrapInfo(host, options.app), moduleClassName = _a.moduleClassName, mainPath = _a.mainPath, moduleSpec = _a.moduleSpec, bootstrapComponentClassName = _a.bootstrapComponentClassName, bootstrapComponentFileName = _a.bootstrapComponentFileName;
        var dir = path.dirname(mainPath);
        var templateSource = schematics_1.apply(schematics_1.url('./files'), [
            schematics_1.template(__assign({}, options, { tmpl: '', moduleFileName: moduleSpec, moduleClassName: moduleClassName,
                angularJsImport: angularJsImport, angularJsModule: options.name, bootstrapComponentClassName: bootstrapComponentClassName,
                bootstrapComponentFileName: bootstrapComponentFileName }, name_utils_1.names(options.name))),
            schematics_1.move(dir)
        ]);
        var r = schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)]));
        return r(host, context);
    };
}
function default_1(options) {
    var angularJsImport = options.angularJsImport ? options.angularJsImport : options.name;
    return schematics_1.chain([
        createFiles(angularJsImport, options),
        addImportsToModule(options),
        addNgDoBootstrapToModule(options),
        options.skipPackageJson ? schematics_1.noop() : common_1.addUpgradeToPackageJson()
    ]);
}
exports.default = default_1;
