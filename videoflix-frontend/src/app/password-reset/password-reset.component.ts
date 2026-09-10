import { Component } from '@angular/core';
import { MaterialDesignModule } from '../shared/material-design.module';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../services/common.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../environments/environments';
import { lastValueFrom } from 'rxjs';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [
    MaterialDesignModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss',
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0,
        })
      ),
      transition('void <=> *', animate('0.5s ease-in-out')),
    ]),
  ],
})
export class PasswordResetComponent {
  passwordFormControl = new FormControl('', [Validators.required]);
  confirmPasswordFormControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();
  rememberMe: boolean = false;
  email: string = '';
  password: string = '';
  form: FormGroup | undefined;
  resetForm: FormGroup;
  code: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    public common: CommonService
  ) {
    this.resetForm = new FormGroup({
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.common.component = 'home';
    this.route.queryParamMap.subscribe((params) => {
      this.code = params.get('code');
    });
  }

  /**
   * Asynchronously resets the user's password using a verification code.
   *
   * This method performs the following steps:
   * 1. Constructs the URL for the verified password reset API endpoint.
   * 2. Sends a POST request with the reset `code` and new password.
   * 3. Resets the `passwordFormControl` and `confirmPasswordFormControl` after a successful password reset.
   * 4. Displays a success message in a snackbar and redirects the user to the login page after a 5-second delay.
   * 5. If an error occurs, logs the error and shows an error message in a snackbar.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the password reset process is complete.
   */
  async resetPassword() {
    try {
      this.common.loading = true;
      let url = environment.baseUrl + '/api/accounts/password/reset/verified/';
      let body = {
        code: this.code,
        password: this.passwordFormControl.value,
      };
      const response = await lastValueFrom(this.http.post(url, body));
      this.passwordFormControl = new FormControl('', [Validators.required]);
      this.confirmPasswordFormControl = new FormControl('', [
        Validators.required,
      ]);
      this.common.loading = false;
      this.common.openSnackBar(
        'Password reset was successfull. Now we redirect you to the login',
        ''
      );
      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 5000);
    } catch (error) {
      console.error(
        'Error resetting your password. Please try again later.',
        error
      );
      this.common.loading = false;
      this.common.openSnackBar(
        'Error resetting your password. Please try again later.',
        'OK'
      );
    }
  }

  /**
   * Checks if the password and confirm password fields match.
   *
   * This method compares the values of `passwordFormControl` and `confirmPasswordFormControl`
   * to ensure that they are identical. It can be used to display validation errors or
   * prevent form submissions when the passwords do not match.
   *
   * @returns {boolean} `true` if both password fields match, otherwise `false`.
   */
  passwordsMatch(): boolean {
    return (
      this.passwordFormControl.value === this.confirmPasswordFormControl.value
    );
  }

  /**
   * Checks if the form is valid.
   *
   * This method ensures that:
   * 1. The `passwordFormControl` is valid.
   * 2. The `confirmPasswordFormControl` is valid.
   * 3. Both passwords match (as validated by `passwordsMatch()`).
   *
   * It is typically used to enable or disable the submit button and prevent form submission
   * if any of these conditions are not met.
   *
   * @returns {boolean} `true` if the form is valid and the passwords match, otherwise `false`.
   */
  isFormValid(): boolean {
    return (
      this.passwordFormControl.valid &&
      this.confirmPasswordFormControl.valid &&
      this.passwordsMatch()
    );
  }
}
