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
import { CommonModule } from '@angular/common';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ErrorStateMatcher } from '@angular/material/core';
import { CommonService } from '../services/common.service';
import { Router } from '@angular/router';

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
  selector: 'app-home',
  standalone: true,
  imports: [
    MaterialDesignModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
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
export class HomeComponent {
  matcher = new MyErrorStateMatcher();
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(public common: CommonService, private router: Router) {}

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.common.component = 'home';
  }

  /**
   * Checks if the email form control is valid.
   *
   * This method verifies if the email field has a valid value based on the validators
   * defined (e.g., required field and email format). It can be used to conditionally
   * enable or disable buttons, or prevent form submissions.
   *
   * @returns {boolean} `true` if the form is valid, otherwise `false`.
   */
  isFormValid(): boolean {
    return this.emailFormControl.valid;
  }

  /**
   * Redirects the user to the sign-up page and saves the entered email.
   *
   * This method stores the value of `emailFormControl` into `common.existingEmail` and
   * navigates the user to the `/register` route. The stored email can be pre-filled in
   * the sign-up form to provide a better user experience.
   *
   * @returns {void}
   */
  redirectToSignUp(): void {
    this.common.existingEmail = this.emailFormControl.value;
    this.router.navigateByUrl('/register');
  }
}
