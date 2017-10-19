/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Tree } from '@angular-devkit/schematics';
import { Change } from '@schematics/angular/utility/change';
import * as ts from 'typescript';
export declare function addParameterToConstructor(source: ts.SourceFile, modulePath: string, opts: {
    className: string;
    param: string;
}): Change[];
export declare function addMethod(source: ts.SourceFile, modulePath: string, opts: {
    className: string;
    methodHeader: string;
    body: string;
}): Change[];
export declare function removeFromNgModule(source: ts.SourceFile, modulePath: string, property: string): Change[];
export declare function offset(text: string, numberOfTabs: number, wrap: boolean): string;
export declare function addImportToModule(source: ts.SourceFile, modulePath: string, symbolName: string): Change[];
export declare function getBootstrapComponent(source: ts.SourceFile, moduleClassName: string): string;
export declare function getImport(source: ts.SourceFile, predicate: (a: any) => boolean): {
    moduleSpec: string;
    bindings: string[];
}[];
export declare function addProviderToModule(source: ts.SourceFile, modulePath: string, symbolName: string): Change[];
export declare function addDeclarationToModule(source: ts.SourceFile, modulePath: string, symbolName: string): Change[];
export declare function addEntryComponents(source: ts.SourceFile, modulePath: string, symbolName: string): Change[];
export declare function insert(host: Tree, modulePath: string, changes: Change[]): void;
export declare function getAppConfig(host: Tree, name: string): any;
export declare function readBootstrapInfo(host: Tree, app: string): {
    moduleSpec: string;
    modulePath: string;
    mainPath: string;
    moduleClassName: string;
    moduleSource: ts.SourceFile;
    bootstrapComponentClassName: string;
    bootstrapComponentFileName: string;
};
