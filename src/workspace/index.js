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
var path = require("path");
var lib_versions_1 = require("../utility/lib-versions");
var fs = require("fs");
var path_1 = require("path");
var fileutils_1 = require("../utility/fileutils");
var schematics_2 = require("@nrwl/schematics");
function updatePackageJson() {
    return function (host) {
        if (!host.exists('package.json')) {
            throw new Error('Cannot find package.json');
        }
        var packageJson = JSON.parse(host.read('package.json').toString('utf-8'));
        if (!packageJson.devDependencies) {
            packageJson.devDependencies = {};
        }
        if (!packageJson.dependencies) {
            packageJson.dependencies = {};
        }
        if (packageJson.scripts) {
            packageJson.scripts = {};
        }
        if (!packageJson.dependencies['@nrwl/nx']) {
            packageJson.dependencies['@nrwl/nx'] = lib_versions_1.nxVersion;
        }
        if (!packageJson.dependencies['@ngrx/store']) {
            packageJson.dependencies['@ngrx/store'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson.dependencies['@ngrx/router-store']) {
            packageJson.dependencies['@ngrx/router-store'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson.dependencies['@ngrx/effects']) {
            packageJson.dependencies['@ngrx/effects'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson.dependencies['@ngrx/store-devtools']) {
            packageJson.dependencies['@ngrx/store-devtools'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson.devDependencies['@nrwl/schematics']) {
            packageJson.devDependencies['@nrwl/schematics'] = lib_versions_1.schematicsVersion;
        }
        if (!packageJson.dependencies['@angular/cli']) {
            packageJson.dependencies['@angular/cli'] = lib_versions_1.angularCliVersion;
        }
        if (!packageJson.devDependencies['prettier']) {
            packageJson.devDependencies['prettier'] = lib_versions_1.prettierVersion;
        }
        packageJson.scripts['format'] = "prettier --single-quote --print-width 120 --write '{apps,libs}/**/*.ts'";
        host.overwrite('package.json', JSON.stringify(packageJson, null, 2));
        return host;
    };
}
function updateAngularCLIJson(options) {
    return function (host) {
        if (!host.exists('.angular-cli.json')) {
            throw new Error('Cannot find .angular-cli.json');
        }
        var angularCliJson = JSON.parse(host.read('.angular-cli.json').toString('utf-8'));
        if (angularCliJson.apps.length !== 1) {
            throw new Error('Can only convert projects with one app');
        }
        angularCliJson.lint = [
            { project: './tsconfig.app.json' },
            { project: './tsconfig.spec.json' },
            { project: './tsconfig.e2e.json' }
        ];
        var app = angularCliJson.apps[0];
        app.root = path.join('apps', options.name, app.root);
        app.outDir = path.join('dist', 'apps', options.name);
        app.test = '../../../test.js';
        app.tsconfig = '../../../tsconfig.app.json';
        app.testTsconfig = '../../../tsconfig.spec.json';
        app.scripts = app.scripts.map(function (p) { return path.join('../../', p); });
        if (!angularCliJson.defaults) {
            angularCliJson.defaults = {};
        }
        if (!angularCliJson.defaults.schematics) {
            angularCliJson.defaults.schematics = {};
        }
        angularCliJson.defaults.schematics['collection'] = '@nrwl/schematics';
        angularCliJson.defaults.schematics['postGenerate'] = 'npm run format';
        angularCliJson.defaults.schematics['newProject'] = ['app', 'lib'];
        host.overwrite('.angular-cli.json', JSON.stringify(angularCliJson, null, 2));
        return host;
    };
}
function updateTsConfigsJson(options) {
    return function (host) {
        var npmScope = options && options.npmScope ? options.npmScope : options.name;
        fileutils_1.updateJsonFile('tsconfig.json', function (json) { return setUpCompilerOptions(json, npmScope); });
        fileutils_1.updateJsonFile('tsconfig.app.json', function (json) {
            json['extends'] = './tsconfig.json';
            if (!json.exclude)
                json.exclude = [];
            json.exclude = dedup(json.exclude.concat(['**/*.spec.ts', '**/*.e2e-spec.ts', 'node_modules', 'tmp']));
            setUpCompilerOptions(json, npmScope);
        });
        fileutils_1.updateJsonFile('tsconfig.spec.json', function (json) {
            json['extends'] = './tsconfig.json';
            if (!json.exclude)
                json.exclude = [];
            json.files = ['test.js'];
            json.exclude = dedup(json.exclude.concat(['node_modules', 'tmp']));
            setUpCompilerOptions(json, npmScope);
        });
        fileutils_1.updateJsonFile('tsconfig.e2e.json', function (json) {
            json['extends'] = './tsconfig.json';
            if (!json.exclude)
                json.exclude = [];
            json.exclude = dedup(json.exclude.concat(['**/*.spec.ts', 'node_modules', 'tmp']));
            setUpCompilerOptions(json, npmScope);
        });
        return host;
    };
}
function updateTsLintJson(options) {
    return function (host) {
        var npmScope = options && options.npmScope ? options.npmScope : options.name;
        fileutils_1.updateJsonFile('tslint.json', function (json) {
            ['no-trailing-whitespace', 'one-line', 'quotemark', 'typedef-whitespace', 'whitespace'].forEach(function (key) {
                json[key] = undefined;
            });
            json['nx-enforce-module-boundaries'] = [true, { npmScope: npmScope, lazyLoad: [] }];
        });
        return host;
    };
}
function updateProtractorConf() {
    return function (host) {
        if (!host.exists('protractor.conf.js')) {
            throw new Error('Cannot find protractor.conf.js');
        }
        var protractorConf = host.read('protractor.conf.js').toString('utf-8');
        var updatedConf = protractorConf
            .replace("./e2e/**/*.e2e-spec.ts", "./apps/**/*.e2e-spec.ts")
            .replace("e2e/tsconfig.e2e.json", "./tsconfig.e2e.json");
        host.overwrite('protractor.conf.js', updatedConf);
        return host;
    };
}
function setUpCompilerOptions(tsconfig, npmScope) {
    if (!tsconfig.compilerOptions.paths) {
        tsconfig.compilerOptions.paths = {};
    }
    tsconfig.compilerOptions.baseUrl = '.';
    tsconfig.compilerOptions.paths["@" + npmScope + "/*"] = ['libs/*'];
}
function moveFiles(options) {
    return function (host) {
        var angularCliJson = JSON.parse(host.read('.angular-cli.json').toString('utf-8'));
        var app = angularCliJson.apps[0];
        fs.mkdirSync('apps');
        fs.mkdirSync('libs');
        fs.unlinkSync(path.join(app.root, app.test));
        fs.mkdirSync(path.join('apps', options.name));
        fs.renameSync(path.join(app.root, app.tsconfig), 'tsconfig.app.json');
        fs.renameSync(path.join(app.root, app.testTsconfig), 'tsconfig.spec.json');
        fs.renameSync(path.join('e2e', 'tsconfig.e2e.json'), 'tsconfig.e2e.json');
        fs.renameSync(app.root, path_1.join('apps', options.name, app.root));
        fs.renameSync('e2e', path_1.join('apps', options.name, 'e2e'));
        return host;
    };
}
function dedup(array) {
    var res = [];
    array.forEach(function (a) {
        if (res.indexOf(a) === -1) {
            res.push(a);
        }
    });
    return res;
}
function default_1(schema) {
    var options = __assign({}, schema, { name: schematics_2.toFileName(schema.name) });
    return schematics_1.chain([
        moveFiles(options),
        schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./files'), []))])),
        updatePackageJson(),
        updateAngularCLIJson(options),
        updateTsConfigsJson(options),
        updateProtractorConf(),
        updateTsLintJson(options)
    ]);
}
exports.default = default_1;
