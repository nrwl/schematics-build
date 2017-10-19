"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var testing_utils_1 = require("../testing-utils");
var test_1 = require("@schematics/angular/utility/test");
describe('downgrade-module', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
        appTree = testing_utils_1.createApp(appTree, 'myapp');
    });
    it('should update main.ts', function () {
        var tree = schematicRunner.runSchematic('downgrade-module', {
            name: 'legacy'
        }, appTree);
        var main = test_1.getFileContent(tree, '/apps/myapp/src/main.ts');
        expect(main).toContain('downgradeModule(bootstrapAngular)');
        expect(main).toContain("import 'legacy';");
        expect(main).toContain("angular.bootstrap(document, ['legacy', downgraded.name]);");
    });
    it('should update module', function () {
        var tree = schematicRunner.runSchematic('downgrade-module', {
            name: 'legacy'
        }, appTree);
        var appModule = test_1.getFileContent(tree, 'apps/myapp/src/app/app.module.ts');
        expect(appModule).not.toContain('bootstrap:');
        expect(appModule).toContain('entryComponents: [AppComponent]');
        expect(appModule).toContain('ngDoBootstrap');
    });
    it('should update package.json by default', function () {
        appTree.overwrite("/package.json", JSON.stringify({
            dependencies: {
                '@angular/core': '4.4.4'
            }
        }));
        var tree = schematicRunner.runSchematic('downgrade-module', {
            name: 'legacy'
        }, appTree);
        var packageJson = JSON.parse(test_1.getFileContent(tree, '/package.json'));
        expect(packageJson.dependencies['@angular/upgrade']).toEqual('4.4.4');
        expect(packageJson.dependencies['angular']).toBeDefined();
    });
    it('should not package.json when --skipPackageJson=true', function () {
        appTree.overwrite("/package.json", JSON.stringify({
            dependencies: {
                '@angular/core': '4.4.4'
            }
        }));
        var tree = schematicRunner.runSchematic('downgrade-module', {
            name: 'legacy',
            skipPackageJson: true
        }, appTree);
        var packageJson = JSON.parse(test_1.getFileContent(tree, '/package.json'));
        expect(packageJson.dependencies['@angular/upgrade']).not.toBeDefined();
    });
    it('should support custom angularJsImport', function () {
        var tree = schematicRunner.runSchematic('downgrade-module', {
            name: 'legacy',
            angularJsImport: 'legacy-app'
        }, appTree);
        var main = test_1.getFileContent(tree, '/apps/myapp/src/main.ts');
        expect(main).toContain("import 'legacy-app';");
        expect(main).not.toContain("import 'legacy';");
    });
});
