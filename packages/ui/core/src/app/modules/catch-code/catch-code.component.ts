import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { filter, interval, map, Observable, take } from 'rxjs';

@Component({
    selector: 'app-catch-code',
    templateUrl: './catch-code.component.html',
    styleUrls: ['./catch-code.component.css'],
})
export class CatchCodeComponent implements OnInit {
    authUrl: string | null = null;
    authWindow: Window | null = null;
    embedUrl$: Observable<boolean> = new Observable<boolean>();
    catchedCode$: Observable<string> = new Observable<string>();

    appName: Observable<string> = new Observable<string>();
    appIcon: Observable<SafeResourceUrl> = new Observable<SafeResourceUrl>();

    constructor(private route: ActivatedRoute, protected _sanitizer: DomSanitizer) {}

    openPopup() {
        if (this.authUrl) {
            this.authWindow = window.open(this.authUrl, '_blank');
        }
    }

    ngOnInit(): void {
        const fillTemplates = (value: string | undefined, params: Params) => {
            if (typeof value !== 'string') return undefined;
            let replaced = value.replaceAll('{{window.location.origin}}', window.location.origin);
            Object.entries(params)
                .filter((pair): pair is [string, string] => typeof pair[1] === 'string')
                .map(([key, value]) => (replaced = replaced.replaceAll(`{{${key}}}`, value)));
            return replaced;
        };
        this.appName = this.route.queryParams
            .pipe(map((params) => fillTemplates(params['appName'], params)))
            .pipe(filter((appNameOrNull): appNameOrNull is string => typeof appNameOrNull === 'string'));

        this.appIcon = this.route.queryParams
            .pipe(map((params) => fillTemplates(params['appIcon'], params)))
            .pipe(filter((appIconOrNull): appIconOrNull is string => typeof appIconOrNull === 'string'))
            .pipe(map((appIcon) => this._sanitizer.bypassSecurityTrustResourceUrl(appIcon)));

        this.embedUrl$ = this.route.queryParams.pipe(
            map((params) => {
                let url = fillTemplates(params['url'], params);
                if (typeof url === 'string') {
                    this.authUrl = url;
                }
                return Boolean(url);
            })
        );

        this.catchedCode$ = interval(500)
            .pipe(take(120))
            .pipe(
                map(() => {
                    const code = window.localStorage.getItem('__oauth_code');
                    if (code) {
                        window.localStorage.removeItem('__oauth_code');
                        console.log('code is ' + code);
                        window.opener.postMessage(
                            {
                                code,
                            },
                            '*'
                        );
                        this.authWindow?.close();
                        window.close();
                    } else {
                        console.log('wait for code');
                    }
                    return code;
                })
            )
            .pipe(filter((codeOrNull): codeOrNull is string => Boolean(codeOrNull)));
    }
}
