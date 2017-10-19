"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createEmptyWorkspace(tree) {
    tree.create('/.angular-cli.json', JSON.stringify({}));
    tree.create('/package.json', JSON.stringify({}));
    return tree;
}
exports.createEmptyWorkspace = createEmptyWorkspace;
function createApp(tree, appName) {
    tree.create("/apps/" + appName + "/src/app/app.module.ts", "\n     import { NgModule } from '@angular/core';\n     import { BrowserModule } from '@angular/platform-browser';\n     import { AppComponent } from './app.component';\n     @NgModule({\n       imports: [BrowserModule],\n       declarations: [AppComponent],\n       bootstrap: [AppComponent]\n     })\n     export class AppModule {}\n  ");
    tree.create("/apps/" + appName + "/src/main.ts", "\n    import { enableProdMode } from '@angular/core';\n    import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';\n    \n    import { AppModule } from './app/app.module';\n    import { environment } from './environments/environment';\n    \n    if (environment.production) {\n      enableProdMode();\n    }\n    \n    platformBrowserDynamic()\n      .bootstrapModule(AppModule)\n      .catch(err => console.log(err));\n  ");
    tree.overwrite('/.angular-cli.json', JSON.stringify({
        apps: [
            {
                name: appName,
                root: "apps/" + appName + "/src",
                main: 'main.ts',
                index: 'index.html'
            }
        ]
    }));
    return tree;
}
exports.createApp = createApp;
