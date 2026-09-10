import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}
  error: string = '';

  /**
   * Logs in a user with the provided email and password.
   * @param email The email of the user.
   * @param password The password of the user.
   * @returns HTTP response after logging in.
   */
  public loginWithEmailAndPassword(email: string, password: string) {
    const url = environment.baseUrl + '/login/';
    const body = {
      username: email,
      password: password,
    };
    return lastValueFrom(this.http.post(url, body));
  }
}