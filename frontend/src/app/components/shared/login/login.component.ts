import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @ViewChild('loginform', { static: false })
  loginForm!: NgForm;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private uiService: UiService
  ) {}

  onLoginSubmit() {
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;

    const headers = new HttpHeaders({ 'Content-type': 'application/json' });

    const reqObject = {
      username: username,
      password: password,
    };

    this.http
      .post('http://localhost:3000/login', reqObject, {
        headers: headers,
      })
      .subscribe({
        // The response data
        next: (response) => {
          // If the user authenticates successfully, we need to store the JWT returned in localStorage
          this.authService.setLocalStorage(response);
        },

        // If there is an error
        error: (error) => {
          console.log(error);
        },

        // When observable completes
        complete: () => {
          this.router.navigate([`/profile/${username}`]);
          this.uiService.updateUsername(username);
        },
      });
  }

  ngOnInit() {}
}
