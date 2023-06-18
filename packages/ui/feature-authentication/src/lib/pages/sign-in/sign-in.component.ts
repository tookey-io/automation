import { ChangeDetectionStrategy, OnInit, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService, fadeInUp400ms } from '@activepieces/ui/common';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { StatusCodes } from 'http-status-codes';
interface SignInForm {
  email: FormControl<string>;
  password: FormControl<string>;
}
@Component({
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  animations: [fadeInUp400ms],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent implements OnInit {
  loginForm: FormGroup<SignInForm>;
  showInvalidEmailOrPasswordMessage = false;
  showInvalidOTPError = false;
  loading = false;
  hideForm = false;
  authenticate$: Observable<void> | undefined;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService
  ) {
    this.loginForm = this.formBuilder.group({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  ngOnInit() {
    const token = this.route.snapshot.queryParams['otp'];
    if (token) {
      this.hideForm = true;
      this.authenticate$ = this.authenticationService.externalAuth(token).pipe(
        catchError((error: HttpErrorResponse) => {
          if (
            error.status === StatusCodes.UNAUTHORIZED ||
            error.status === StatusCodes.BAD_REQUEST
          ) {
            this.showInvalidOTPError = true;
          }
          this.loading = false;
          return of(null);
        }),
        tap((response) => {
          if (response) {
            this.authenticationService.saveUser(response);
            this.redirectToBack();
          }
        }),
        map(() => void 0)
      );
    }
  }

  signIn(): void {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      this.showInvalidEmailOrPasswordMessage = false;
      const request = this.loginForm.getRawValue();
      this.authenticate$ = this.authenticationService.signIn(request).pipe(
        catchError((error: HttpErrorResponse) => {
          if (
            error.status === StatusCodes.UNAUTHORIZED ||
            error.status === StatusCodes.BAD_REQUEST
          ) {
            this.showInvalidEmailOrPasswordMessage = true;
          }
          this.loading = false;
          return of(null);
        }),
        tap((response) => {
          if (response) {
            this.authenticationService.saveUser(response);
            this.redirectToBack();
          }
        }),
        map(() => void 0)
      );
    }
  }

  redirectToBack() {
    const redirectUrl = this.route.snapshot.queryParamMap.get('redirect_url');
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      this.router.navigate(['/flows']);
    }
  }
}
