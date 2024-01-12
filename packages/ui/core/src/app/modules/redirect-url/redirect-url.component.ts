import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, tap } from 'rxjs';

@Component({
    selector: 'app-redirect-url',
    templateUrl: './redirect-url.component.html',
    styleUrls: ['./redirect-url.component.css'],
})
export class RedirectUrlComponent implements OnInit {
    sendCodeFromIFrame$: Observable<void> = new Observable<void>();
    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.sendCodeFromIFrame$ = this.route.queryParams
            .pipe(
                tap((params) => {
                    if (typeof params['code'] !== 'undefined') {
                        if (window.opener) {
                            window.opener.postMessage(
                                {
                                    code: params['code'],
                                },
                                '*'
                            );
                        } else {
                            window.localStorage.setItem('__oauth_code', params['code']);
                            window.close();
                        }
                    }
                })
            )
            .pipe(map(() => void 0));
    }
}
