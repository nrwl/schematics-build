"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var testing_utils_1 = require("../testing-utils");
var test_1 = require("@schematics/angular/utility/test");
describe('app', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
    });
    it('should update angular-cli.json', function () {
        var tree = schematicRunner.runSchematic('app', { name: 'myApp' }, appTree);
        var updatedAngularCLIJson = JSON.parse(test_1.getFileContent(tree, '/.angular-cli.json'));
        expect(updatedAngularCLIJson.apps).toEqual([
            {
                assets: ['assets', 'favicon.ico'],
                environmentSource: 'environments/environment.ts',
                environments: { dev: 'environments/environment.ts', prod: 'environments/environment.prod.ts' },
                index: 'index.html',
                main: 'main.ts',
                name: 'my-app',
                outDir: 'dist/apps/my-app',
                polyfills: 'polyfills.ts',
                prefix: 'app',
                root: 'apps/my-app/src',
                scripts: [],
                styles: ['styles.css'],
                test: '../../../test.js',
                testTsconfig: '../../../tsconfig.spec.json',
                tsconfig: '../../../tsconfig.app.json'
            }
        ]);
    });
    it('should generate files', function () {
        var tree = schematicRunner.runSchematic('app', { name: 'myAPp' }, appTree);
        expect(tree.exists('apps/my-app/src/main.ts')).toBeTruthy();
        expect(tree.exists('apps/my-app/src/app/app.module.ts')).toBeTruthy();
        expect(tree.exists('apps/my-app/src/app/app.component.ts')).toBeTruthy();
        expect(tree.exists('apps/my-app/e2e/app.po.ts')).toBeTruthy();
        expect(test_1.getFileContent(tree, 'apps/my-app/src/app/app.module.ts')).toContain('class AppModule');
    });
    it('should import NgModule', function () {
        var tree = schematicRunner.runSchematic('app', { name: 'myApp' }, appTree);
        expect(test_1.getFileContent(tree, 'apps/my-app/src/app/app.module.ts')).toContain('NxModule.forRoot()');
    });
});
