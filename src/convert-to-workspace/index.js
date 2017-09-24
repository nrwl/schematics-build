"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schematics_1 = require("@angular-devkit/schematics");
var path = require("path");
var lib_versions_1 = require("../utility/lib-versions");
var fs = require("fs");
var path_1 = require("path");
var fileutils_1 = require("../utility/fileutils");
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
        packageJson.dependencies['@nrwl/nx'] = lib_versions_1.nxVersion;
        packageJson.devDependencies['@nrwl/schematics'] = lib_versions_1.schematicsVersion;
        host.overwrite('package.json', JSON.stringify(packageJson, null, 2));
        return host;
    };
}
function updateAngularCLIJson() {
    return function (host) {
        if (!host.exists('.angular-cli.json')) {
            throw new Error('Cannot find .angular-cli.json');
        }
        var angularCliJson = JSON.parse(host.read('.angular-cli.json').toString('utf-8'));
        if (angularCliJson.apps.length !== 1) {
            throw new Error('Can only convert projects with one app');
        }
        angularCliJson.lint =
            [{ 'project': './tsconfig.app.json' }, { 'project': './tsconfig.spec.json' }, { 'project': './tsconfig.e2e.json' }];
        var app = angularCliJson.apps[0];
        app.root = path.join('apps', angularCliJson.project.name, app.root);
        app.outDir = path.join('dist', 'apps', angularCliJson.project.name);
        app.test = '../../../test.js';
        app.tsconfig = '../../../tsconfig.app.json';
        app.testTsconfig = '../../../tsconfig.spec.json';
        app.scripts = app.scripts.map(function (p) { return path.join('../../', p); });
        if (!app.defaults) {
            app.defaults = {};
        }
        if (!app.defaults.schematics) {
            app.defaults.schematics = {};
        }
        app.defaults.schematics['newProject'] = ['app', 'lib'];
        host.overwrite('.angular-cli.json', JSON.stringify(angularCliJson, null, 2));
        return host;
    };
}
function updateTsConfigsJson(options) {
    return function (host) {
        var angularCliJson = JSON.parse(host.read('.angular-cli.json').toString('utf-8'));
        var npmScope = options.npmScope ? options.npmScope : angularCliJson.project.name;
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
function updateProtractorConf() {
    return function (host) {
        if (!host.exists('protractor.conf.js')) {
            throw new Error('Cannot find protractor.conf.js');
        }
        var protractorConf = host.read('protractor.conf.js').toString('utf-8');
        var angularCliJson = JSON.parse(host.read('.angular-cli.json').toString('utf-8'));
        protractorConf.replace("'./e2e/**/*.e2e-spec.ts'", "'.apps/" + angularCliJson.project.name + "/e2e/**/*.e2e-spec.ts'")
            .replace("'e2e/tsconfig.e2e.json'", "'./tsconfig.e2e.json'");
        host.overwrite('protractor.conf.js', JSON.stringify(protractorConf, null, 2));
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
function moveFiles() {
    return function (host) {
        var angularCliJson = JSON.parse(host.read('.angular-cli.json').toString('utf-8'));
        var app = angularCliJson.apps[0];
        fs.mkdirSync('apps');
        fs.mkdirSync('libs');
        fs.unlinkSync(path.join(app.root, app.test));
        fs.mkdirSync(path.join('apps', angularCliJson.project.name));
        fs.renameSync(path.join(app.root, app.tsconfig), 'tsconfig.app.json');
        fs.renameSync(path.join(app.root, app.testTsconfig), 'tsconfig.spec.json');
        fs.renameSync(path.join('e2e', 'tsconfig.e2e.json'), 'tsconfig.e2e.json');
        fs.renameSync(app.root, path_1.join('apps', angularCliJson.project.name, app.root));
        fs.renameSync('e2e', path_1.join('apps', angularCliJson.project.name, 'e2e'));
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
function default_1(options) {
    return schematics_1.chain([
        moveFiles(), schematics_1.branchAndMerge(schematics_1.chain([
            schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./files'), [])),
        ])),
        updatePackageJson(), updateAngularCLIJson(), updateTsConfigsJson(options), updateProtractorConf()
    ]);
}
exports.default = default_1;
