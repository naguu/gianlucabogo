import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css',
})
export class AdminLoginComponent {
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    if (!this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/admin');
      },
      error: () => {
        this.loading = false;
        this.error = 'Falsches Passwort.';
      },
    });
  }
}
