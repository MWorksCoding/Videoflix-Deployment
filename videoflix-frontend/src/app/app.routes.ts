import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { PrivacyComponent } from './shared/privacy/privacy.component';
import { VideosComponent } from './videoflix/videos/videos.component';
import { LegalNoticeComponent } from './shared/legal-notice/legal-notice.component';
import { LoginHelpComponent } from './login-help/login-help.component';
import { RegisterComponent } from './register/register.component';
import { RegisterVerifiedComponent } from './register-verified/register-verified.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'login-help', component: LoginHelpComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'password-reset', component: PasswordResetComponent  },
    { path: 'register-verified', component: RegisterVerifiedComponent },
    { path: 'legal-notice', component: LegalNoticeComponent },
    { path: 'privacy', component: PrivacyComponent },
    { path: 'videos', component: VideosComponent },
    { path: '404', component: NotFoundComponent },
    { path: '**', redirectTo: '404', pathMatch: 'full' },
];
