import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { LoginResponse, UserSession } from 'src/app/shared/models/user-session.model';
import { environment } from 'src/environments/environment';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loadingCtrl = inject(LoadingController);
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly USER_STORAGE_KEY = 'user_session';
  private userSignal = signal<UserSession | null>(this.getStoredUser());
  readonly user = this.userSignal.asReadonly();
  
  login(documentNumber: string, email: string, password: string): Observable<LoginResponse> {
    return this.http.get<UserSession>(environment.apiUrl)
      .pipe(
        tap(response => {
          const userSession: UserSession = {
            userId: response.userId,
            id: response.id,
            title: response.title,
            completed: response.completed,
            email: email,
            documentNumber: documentNumber
          };
            
          this.setUserSession(userSession);
        }),
        catchError(error => {
          console.error('Error durante el inicio de sesión:', error);
          return of({ error: 'Error durante el inicio de sesión' } as LoginResponse);    
        })
      );
}
  
async logout(): Promise<void> {
  const loading = await this.loadingCtrl.create({
    message: 'Cerrando sesión...',
    spinner: 'crescent', // Opcional: 'bubbles', 'circles', 'dots', 'lines', 'lines-small'
    duration: 2000 // Simulación de tiempo (puedes ajustar)
  });

  await loading.present();

  setTimeout(() => {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.router.navigate(['login']);
    loading.dismiss();
  }, 2000);
}
  
  isAuthenticated(): boolean {
    return !!this.userSignal();
  }
  
  private setUserSession(user: UserSession): void {
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }
  
  private getStoredUser(): UserSession | null {
    const storedUser = localStorage.getItem(this.USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  }
}