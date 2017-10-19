"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var testing_utils_1 = require("../testing-utils");
var test_1 = require("@schematics/angular/utility/test");
describe('ngrx', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
        appTree = testing_utils_1.createApp(appTree, 'myapp');
    });
    it('should add empty root', function () {
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'state',
            module: 'apps/myapp/src/app/app.module.ts',
            onlyEmptyRoot: true
        }, appTree);
        var appModule = test_1.getFileContent(tree, '/apps/myapp/src/app/app.module.ts');
        expect(appModule).toContain('StoreModule.forRoot');
        expect(appModule).toContain('EffectsModule.forRoot');
        expect(tree.exists('apps/myapp/src/app/+state')).toBeFalsy();
    });
    it('should add root', function () {
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'state',
            module: 'apps/myapp/src/app/app.module.ts',
            root: true
        }, appTree);
        var appModule = test_1.getFileContent(tree, '/apps/myapp/src/app/app.module.ts');
        expect(appModule).toContain('StoreModule.forRoot');
        expect(appModule).toContain('EffectsModule.forRoot');
        expect(tree.exists("/apps/myapp/src/app/+state/state.actions.ts")).toBeTruthy();
        expect(tree.exists("/apps/myapp/src/app/+state/state.effects.ts")).toBeTruthy();
        expect(tree.exists("/apps/myapp/src/app/+state/state.effects.spec.ts")).toBeTruthy();
        expect(tree.exists("/apps/myapp/src/app/+state/state.init.ts")).toBeTruthy();
        expect(tree.exists("/apps/myapp/src/app/+state/state.interfaces.ts")).toBeTruthy();
        expect(tree.exists("/apps/myapp/src/app/+state/state.reducer.ts")).toBeTruthy();
        expect(tree.exists("/apps/myapp/src/app/+state/state.reducer.spec.ts")).toBeTruthy();
    });
    it('should add feature', function () {
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'state',
            module: 'apps/myapp/src/app/app.module.ts'
        }, appTree);
        var appModule = test_1.getFileContent(tree, '/apps/myapp/src/app/app.module.ts');
        expect(appModule).toContain('StoreModule.forFeature');
        expect(appModule).toContain('EffectsModule.forFeature');
        expect(tree.exists("/apps/myapp/src/app/+state/state.actions.ts")).toBeTruthy();
    });
    it('should only add files', function () {
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'state',
            module: 'apps/myapp/src/app/app.module.ts',
            onlyAddFiles: true
        }, appTree);
        var appModule = test_1.getFileContent(tree, '/apps/myapp/src/app/app.module.ts');
        expect(appModule).not.toContain('StoreModule');
        expect(tree.exists("/apps/myapp/src/app/+state/state.actions.ts")).toBeTruthy();
    });
    it('should update package.json', function () {
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'state',
            module: 'apps/myapp/src/app/app.module.ts'
        }, appTree);
        var packageJson = JSON.parse(test_1.getFileContent(tree, '/package.json'));
        expect(packageJson.dependencies['@ngrx/store']).toBeDefined();
        expect(packageJson.dependencies['@ngrx/router-store']).toBeDefined();
        expect(packageJson.dependencies['@ngrx/effects']).toBeDefined();
    });
    it('should error when no module is provided', function () {
        expect(function () {
            return schematicRunner.runSchematic('ngrx', {
                name: 'state'
            }, appTree);
        }).toThrow('Property "/module" is required but missing.');
    });
});
