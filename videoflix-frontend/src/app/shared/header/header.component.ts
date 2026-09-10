import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { MaterialDesignModule } from '../material-design.module';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Location } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialDesignModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(
    private router: Router,
    public common: CommonService,
    private http: HttpClient,
    private location: Location
  ) {}

  /**
   * Asynchronously logs out the user by sending a logout request to the server.
   *
   * This method performs the following steps:
   * 1. Constructs the URL for the logout API endpoint.
   * 2. Creates an `HttpHeaders` object and sets the `Authorization` header using the token stored in `localStorage`.
   * 3. Sends a POST request to the logout URL to log the user out.
   * 4. Removes the token and user information from `localStorage` upon successful logout.
   * 5. Displays a snackbar notification to inform the user they have logged out.
   * 6. Redirects the user to the login page after a successful logout.
   * 7. If an error occurs during the logout process, it sets an error message.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the logout process is complete.
   */
  async logout() {
    try {
      this.common.loading = true;
      const url = environment.baseUrl + '/logout/';
      let headers = new HttpHeaders();
      headers = headers.set(
        'Authorization',
        'Token' + localStorage.getItem('token')
      );
      await lastValueFrom(this.http.post(url, {}, { headers }));
      localStorage.removeItem('token');
      localStorage.removeItem('user-Email');
      localStorage.removeItem('user-Id');
      this.common.loading = false;
      this.common.openSnackBar('Now you are logged out', 'OK');
      this.router.navigateByUrl('/login');
    } catch (e) {
      this.common.loading = false;
      this.common.openSnackBar('Error while logging out', '');
    }
  }

  /**
   * Navigates the user back to the previous page in the browser's history.
   * This method uses the Angular `Location` service to navigate back to the previous page.
   * @returns {void}
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Navigates the user to the legal notice page
   */
  redirectToLegalNotice() {
    this.router.navigateByUrl('/legal-notice');
  }

  /**
   * Navigates the user to the privacy page.
   */
  redirectToPrivacy() {
    this.router.navigateByUrl('/privacy');
  }
}
