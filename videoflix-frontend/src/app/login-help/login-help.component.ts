import { Component } from '@angular/core';
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
  selector: 'app-login-help',
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
  templateUrl: './login-help.component.html',
  styleUrl: './login-help.component.scss',
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
export class LoginHelpComponent {
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  matcher = new MyErrorStateMatcher();
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    public common: CommonService
  ) {}

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.common.component = 'home';
  }

  /**
   * Asynchronously resets the user's password by sending a password reset request to the server.
   *
   * This method performs the following steps:
   * 1. Constructs the URL for the password reset API endpoint.
   * 2. Sends a POST request to the server with the user's email to initiate the password reset process.
   * 3. Upon successful request, resets the `emailFormControl` to an empty state and displays a snackbar message
   *    informing the user to check their email for the password reset link.
   * 4. After a 5-second delay, navigates the user to the login page.
   * 5. If an error occurs during the process, logs the error to the console and displays an error message in a snackbar.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the password reset process is complete.
   */
  async resetPassword() {
    try {
      this.common.loading = true;
      let url = environment.baseUrl + '/api/accounts/password/reset/';
      let body = {
        email: this.emailFormControl.value,
      };
      const response = await lastValueFrom(this.http.post(url, body));
      this.emailFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
      ]);
      this.common.loading = false;
      this.common.openSnackBar(
        'To reset your password use the link in the email we just sent you.',
        ''
      );
      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 5000);
    } catch (error) {
      this.common.loading = false;
      this.common.openSnackBar(
        'Error at password reset. Please try again later.',
        'OK'
      );
    }
  }
}
