import * as Lint from 'tslint';
import { IOptions } from 'tslint';
import * as ts from 'typescript';
export declare class Rule extends Lint.Rules.AbstractRule {
    private path;
    constructor(options: IOptions, path?: string);
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
