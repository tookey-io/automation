import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  ProjectEffects,
  UiCommonModule,
  environment,
  projectReducer,
} from '@activepieces/ui/common';
import { JwtModule } from '@auth0/angular-jwt';
import { NotFoundComponent } from './modules/not-found/not-found.component';
import { RedirectUrlComponent } from './modules/redirect-url/redirect-url.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ImportFlowComponent } from './modules/import-flow/import-flow.component';
import { LottieCacheModule, LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { ImportFlowUriEncodedComponent } from './modules/import-flow-uri-encoded/import-flow-uri-encoded.component';
import {
  MonacoEditorModule,
  NgxMonacoEditorConfig,
} from 'ngx-monaco-editor-v2';
import { apMonacoTheme } from './monaco-themes/ap-monaco-theme';
import { cobalt2 } from './monaco-themes/cobalt-2-theme';
import { UiFeatureChatBotModule } from '@activepieces/ui/feature-chatbot';
import { EeComponentsModule } from '@activepieces/ee-components';
import { UiFeatureAuthenticationModule } from '@activepieces/ui/feature-authentication';

const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: '/assets', // configure base path for monaco editor. Starting with version 8.0.0 it defaults to './assets'. Previous releases default to '/assets'
  defaultOptions: { scrollBeyondLastLine: false, fixedOverflowWidgets: true }, // pass default options to be used
  onMonacoLoad: () => {
    const monaco = (window as any).monaco;
    monaco.editor.defineTheme('apTheme', apMonacoTheme);
    monaco.editor.defineTheme('cobalt2', cobalt2);
    const stopImportResolutionError = () => {
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        diagnosticCodesToIgnore: [2792],
      });
    };
    stopImportResolutionError();
    // Assuming you have already initialized the Monaco editor instance as 'editor'
  },
};
export function tokenGetter() {
  const jwtToken: any = localStorage.getItem(environment.jwtTokenName);
  return jwtToken;
}
// Note we need a separate function as it's required
// by the AOT compiler.
export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    RedirectUrlComponent,
    ImportFlowComponent,
    ImportFlowUriEncodedComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    UiFeatureAuthenticationModule,
    StoreModule.forFeature('commonState', {
      projectsState: projectReducer,
    }),
    EffectsModule.forFeature([ProjectEffects]),
    AppRoutingModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
    }),
    EffectsModule.forRoot(),
    HttpClientModule,
    FontAwesomeModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        allowedDomains: [
          extractHostname(environment.apiUrl),
          extractHostname(environment.backendUrl),
        ],
      },
    }),
    AngularSvgIconModule.forRoot(),
    UiCommonModule,
    LottieModule.forRoot({ player: playerFactory }),
    LottieCacheModule.forRoot(),
    EeComponentsModule,
    MonacoEditorModule.forRoot(monacoConfig),
    UiFeatureChatBotModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
function extractHostname(url: string): string {
  // for relative urls we should return empty string
  if (url.startsWith('/')) {
    return '';
  }
  const parsedUrl = new URL(url);
  if (parsedUrl.port.length > 0) {
    return parsedUrl.hostname + ':' + parsedUrl.port;
  }
  return parsedUrl.host;
}
