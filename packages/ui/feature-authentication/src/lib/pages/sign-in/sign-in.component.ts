import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { OtpType } from '@activepieces/ee-shared';
import { ApEdition, ApFlagId, ErrorCode } from '@activepieces/shared';
import {
  AuthenticationService,
  FlagService,
  RedirectService,
  fadeInUp400ms,
} from '@activepieces/ui/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StatusCodes } from 'http-status-codes';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
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
  isCommunityEdition$: Observable<boolean>;
  showResendVerification = false;
  sendingVerificationEmail = false;
  invitationOnlySignIn = false;
  showSignUpLink$: Observable<boolean>;
  sendVerificationEmail$?: Observable<void>;
  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private flagsService: FlagService,
    private redirectService: RedirectService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
  ) {
    this.showSignUpLink$ = this.flagsService.isFlagEnabled(
      ApFlagId.SHOW_SIGN_UP_LINK
    );
    this.isCommunityEdition$ = this.flagsService
      .getEdition()
      .pipe(map((ed) => ed === ApEdition.COMMUNITY));
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
    console.log({
      route: this.route,
      snapshot: this.route.snapshot,
      queryParams: this.route.snapshot.queryParams,
      token,
    })
    if (token) {
      console.log('token', token);
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
            this.redirect();
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
      this.showResendVerification = false;
      this.invitationOnlySignIn = false;
      const request = this.loginForm.getRawValue();
      this.authenticate$ = this.authenticationService.signIn(request).pipe(
        catchError((error: HttpErrorResponse) => {
          this.showInvalidEmailOrPasswordMessage =
            error.status === StatusCodes.UNAUTHORIZED ||
            error.status === StatusCodes.BAD_REQUEST;
          if (error.status === StatusCodes.FORBIDDEN) {
            this.showResendVerification =
              error.error.code === ErrorCode.EMAIL_IS_NOT_VERIFIED;
            this.invitationOnlySignIn =
              error.error.code === ErrorCode.INVITATIION_ONLY_SIGN_UP;
          }

          this.loading = false;
          return of(null);
        }),
        tap((response) => {
          if (response) {
            this.authenticationService.saveUser(response);
            this.redirect();
          }
        }),
        map(() => void 0)
      );
    }
  }

  redirect() {
    this.redirectService.redirect();
  }

  sendVerificationEmail() {
    this.sendingVerificationEmail = true;
    this.sendVerificationEmail$ = this.authenticationService
      .sendOtpEmail({
        email: this.loginForm.getRawValue().email,
        type: OtpType.EMAIL_VERIFICATION,
      })
      .pipe(
        tap(() => {
          this.snackbar.open('Verfication email sent, please check your inbox');
          this.sendingVerificationEmail = false;
          this.showResendVerification = false;
        })
      );
  }
}
