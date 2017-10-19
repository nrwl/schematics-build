"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schematics_1 = require("@angular-devkit/schematics");
var ast_utils_1 = require("../utility/ast-utils");
var common_1 = require("../utility/common");
function updateMain(angularJsImport, options) {
    return function (host) {
        var _a = ast_utils_1.readBootstrapInfo(host, options.app), mainPath = _a.mainPath, moduleClassName = _a.moduleClassName, moduleSpec = _a.moduleSpec, bootstrapComponentClassName = _a.bootstrapComponentClassName, bootstrapComponentFileName = _a.bootstrapComponentFileName;
        host.overwrite(mainPath, 
        // prettier-ignore
        "import { enableProdMode, StaticProvider } from '@angular/core';\nimport { platformBrowserDynamic } from '@angular/platform-browser-dynamic';\n\nimport * as angular from 'angular';\nimport { downgradeComponent, downgradeModule, setAngularLib } from '@angular/upgrade/static';\n\nimport { " + moduleClassName + " } from '" + moduleSpec + "';\nimport { environment } from './environments/environment';\nimport '" + angularJsImport + "';\nimport { " + bootstrapComponentClassName + " } from '" + bootstrapComponentFileName + "';\n\nexport function bootstrapAngular(extra: StaticProvider[]): any {\n  setAngularLib(angular);\n  if (environment.production) {\n    enableProdMode();\n  }\n  return platformBrowserDynamic(extra)\n    .bootstrapModule(" + moduleClassName + ")\n    .catch(err => console.log(err));\n}\n\nconst downgraded = angular\n  .module('downgraded', [downgradeModule(bootstrapAngular)])\n  .directive('appRoot', downgradeComponent({ component: " + bootstrapComponentClassName + ", propagateDigest: false }));\n\nangular.bootstrap(document, ['" + options.name + "', downgraded.name]);");
        return host;
    };
}
function rewriteBootstrapLogic(options) {
    return function (host) {
        var _a = ast_utils_1.readBootstrapInfo(host, options.app), modulePath = _a.modulePath, moduleSource = _a.moduleSource, moduleClassName = _a.moduleClassName;
        ast_utils_1.insert(host, modulePath, ast_utils_1.addMethod(moduleSource, modulePath, {
            className: moduleClassName,
            methodHeader: 'ngDoBootstrap(): void',
            body: ""
        }).concat(ast_utils_1.removeFromNgModule(moduleSource, modulePath, 'bootstrap')));
        return host;
    };
}
function addEntryComponentsToModule(options) {
    return function (host) {
        var _a = ast_utils_1.readBootstrapInfo(host, options.app), modulePath = _a.modulePath, moduleSource = _a.moduleSource, bootstrapComponentClassName = _a.bootstrapComponentClassName;
        ast_utils_1.insert(host, modulePath, ast_utils_1.addEntryComponents(moduleSource, modulePath, bootstrapComponentClassName));
        return host;
    };
}
function default_1(options) {
    var angularJsImport = options.angularJsImport ? options.angularJsImport : options.name;
    return schematics_1.chain([
        updateMain(angularJsImport, options),
        addEntryComponentsToModule(options),
        rewriteBootstrapLogic(options),
        options.skipPackageJson ? schematics_1.noop() : common_1.addUpgradeToPackageJson()
    ]);
}
exports.default = default_1;
