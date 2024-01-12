import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

@Component({
    selector: 'app-redirect-catch',
    templateUrl: './redirect-catch.component.html',
    styleUrls: ['./redirect-catch.component.css'],
})
export class RedirectCatchComponent implements OnInit {
    sendCodeFromIFrame$: Observable<void> = new Observable<void>();
    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.sendCodeFromIFrame$ = this.route.queryParams
            .pipe(
                tap((params) => {
                    if (params['code'] != undefined) {
                        window.localStorage.setItem('__oauth_code', params['code']);
                        window.close();
                    }
                })
            )
            .pipe(map(() => void 0));
    }
}
