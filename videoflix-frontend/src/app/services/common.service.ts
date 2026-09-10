import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  component: string = 'home';
  existingEmail!: string | null;
  public _snackBar = inject(MatSnackBar);
  loading: boolean = false;
  mobileView:boolean = false;

  constructor(
    private router: Router
  ) {}

  /**
   * Opens a snack bar (toast notification) with the provided message and action.
   *
   * This method displays a snack bar with a message and an optional action. The snack bar is automatically
   * dismissed after a duration of 3 seconds.
   *
   * @param {string} message - The message to be displayed in the snack bar.
   * @param {string | undefined} action - The optional action label for the snack bar (e.g., "OK", "Undo").
   * If no action is needed, `undefined` can be passed.
   *
   * @returns {void}
   */
  openSnackBar(message: string, action: string | undefined) {
    this._snackBar.open(message, action, {
      duration: 3000,
    });
  }

  /**
   * Navigates the user to the login page.
   * This method uses the Angular `Router` to navigate the application to the `/login` route.
   *
   * @returns {void}
   */
      redirectToLogin(): void {
        this.router.navigateByUrl('/login');
      }
}
