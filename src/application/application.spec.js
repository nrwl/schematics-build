"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var test_1 = require("@schematics/angular/utility/test");
describe('application', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
    });
    it('should generate files', function () {
        var tree = schematicRunner.runSchematic('application', { name: 'myApp', directory: 'my-app' }, appTree);
        expect(tree.files).toEqual([
            '/my-app/README.md',
            '/my-app/.angular-cli.json',
            '/my-app/.editorconfig',
            '/my-app/.gitignore',
            '/my-app/apps/.gitkeep',
            '/my-app/karma.conf.js',
            '/my-app/libs/.gitkeep',
            '/my-app/package.json',
            '/my-app/protractor.conf.js',
            '/my-app/test.js',
            '/my-app/tsconfig.app.json',
            '/my-app/tsconfig.e2e.json',
            '/my-app/tsconfig.json',
            '/my-app/tsconfig.spec.json',
            '/my-app/tslint.json'
        ]);
    });
    it('should update package.json', function () {
        var tree = schematicRunner.runSchematic('application', { name: 'myApp', directory: 'my-app' }, appTree);
        var packageJson = JSON.parse(test_1.getFileContent(tree, '/my-app/package.json'));
        expect(packageJson.devDependencies['@nrwl/schematics']).toBeDefined();
        expect(packageJson.dependencies['@nrwl/nx']).toBeDefined();
        expect(packageJson.dependencies['@ngrx/store']).toBeDefined();
        expect(packageJson.dependencies['@ngrx/effects']).toBeDefined();
        expect(packageJson.dependencies['@ngrx/router-store']).toBeDefined();
        expect(packageJson.dependencies['@ngrx/store-devtools']).toBeDefined();
    });
    it('should set right npmScope', function () {
        var tree = schematicRunner.runSchematic('application', { name: 'myApp', directory: 'my-app' }, appTree);
        var tsconfigJson = JSON.parse(test_1.getFileContent(tree, '/my-app/tsconfig.json'));
        expect(tsconfigJson.compilerOptions.paths).toEqual({ '@myApp/*': ['libs/*'] });
        var tslintJson = JSON.parse(test_1.getFileContent(tree, '/my-app/tslint.json'));
        expect(tslintJson.rules['nx-enforce-module-boundaries']).toEqual([true, { lazyLoad: [], npmScope: 'myApp' }]);
    });
});
