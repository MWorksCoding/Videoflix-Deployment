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
import { Router } from '@angular/router';
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

/** Error when invalid control is dirty, touched, or submitted. */
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
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
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
export class RegisterComponent {
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  passwordFormControl = new FormControl('', [Validators.required]);
  confirmPasswordFormControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();
  rememberMe: boolean = false;
  email: string = '';
  password: string = '';
  form: FormGroup | undefined;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    public common: CommonService
  ) {}

  /**
   * Initializes the component.
   * If there is an existing email stored in
   * `common.existingEmail`, it populates the `emailFormControl` with that value, allowing the email field to be pre-filled.
   */
  ngOnInit(): void {
    this.common.component = 'home';
    if (this.common.existingEmail) {
      this.emailFormControl.setValue(this.common.existingEmail);
    }
  }

  /**
   * Asynchronously registers a new user by sending a signup request to the server.
   *
   * This method performs the following steps:
   * 1. Constructs the URL for the signup API endpoint.
   * 2. Sends a POST request with the user's email and password to register a new account.
   * 3. Upon successful registration, resets the `emailFormControl`, `passwordFormControl`, and `confirmPasswordFormControl`.
   * 4. Displays a success message in a snackbar, informing the user to confirm their registration via email.
   * 5. After a 5-second delay, navigates the user to the login page.
   * 6. If an error occurs, logs the error and displays an error message in a snackbar.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the registration process is complete.
   */
  async registerUser() {
    try {
      this.common.loading = true;
      let url = environment.baseUrl + '/api/accounts/signup/';
      let body = {
        email: this.emailFormControl.value,
        password: this.passwordFormControl.value,
      };
      const response = await lastValueFrom(this.http.post(url, body));
      this.emailFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
      ]);
      this.passwordFormControl = new FormControl('', [Validators.required]);
      this.confirmPasswordFormControl = new FormControl('', [
        Validators.required,
      ]);
      this.common.loading = false;
      this.common.openSnackBar(
        'Please confirm your registration using the link in the email we just sent you.',
        ''
      );
      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 5000);
    } catch (error) {
      console.error('Error at registration. Please try again later.', error);
      this.common.loading = false;
      this.common.openSnackBar(
        'Error at registration. Please try again later.',
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
   * Checks if the registration form is valid.
   *
   * This method ensures that:
   * 1. The `emailFormControl` is valid.
   * 2. The `passwordFormControl` is valid.
   * 3. The `confirmPasswordFormControl` is valid.
   * 4. Both passwords match (as validated by `passwordsMatch()`).
   *
   * It is typically used to enable or disable the registration button and prevent form submission
   * if any of these conditions are not met.
   *
   * @returns {boolean} `true` if the form is valid and the passwords match, otherwise `false`.
   */
  isFormValid(): boolean {
    return (
      this.emailFormControl.valid &&
      this.passwordFormControl.valid &&
      this.confirmPasswordFormControl.valid &&
      this.passwordsMatch()
    );
  }
}
