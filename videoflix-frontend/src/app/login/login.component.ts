import { Component, inject } from '@angular/core';
import { MaterialDesignModule } from '../shared/material-design.module';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
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
import { CommonService } from '../services/common.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
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
export class LoginComponent {
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  passwordFormControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();
  rememberMe: boolean = false;
  password: string = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    public common: CommonService
  ) {}

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.common.component = 'login';
  }

  /**
   * Asynchronously logs the user in using their email and password.
   *
   * This method performs the following steps:
   * 2. Retrieves the values from the email and password form controls.
   * 3. Attempts to log in using the `auth.loginWithEmailAndPassword()` method.
   * 4. If the login is successful, it stores the authentication token, user email, and user ID in `localStorage`.
   * 5. Navigates the user to the `/videos` route upon successful login.
   * 6. If an error occurs during login, an error message is logged to the console, and a snackbar is shown to the user with a "Wrong Login data" message.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the login process is complete.
   */
  async login() {
    try {
      this.common.loading = true;
      const email = this.emailFormControl.value ?? '';
      const password = this.passwordFormControl.value ?? '';
      let resp: any = await this.auth.loginWithEmailAndPassword(
        email,
        password
      );
      localStorage.setItem('token', resp.token);
      localStorage.setItem('user-Email', resp.email);
      localStorage.setItem('user-Id', resp.user_id);
      this.common.loading = false;
      this.router.navigateByUrl('/videos');
    } catch (e) {
      console.error(e);
      this.common.loading = false;
      this.common.openSnackBar('Wrong Login data, please try again', 'OK');
    }
  }

  /**
   * Checks if the login form is valid.
   *
   * This method checks whether both the email and password form controls
   * have valid values. It can be used to conditionally enable or disable
   * the login button, or prevent form submissions.
   *
   * @returns {boolean} `true` if both the email and password fields are valid, otherwise `false`.
   */
  isFormValid(): boolean {
    return this.emailFormControl.valid && this.passwordFormControl.valid;
  }
}
