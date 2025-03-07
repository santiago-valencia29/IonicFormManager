import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from 'src/app/shared/models/user-session.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  loginForm!: FormGroup;
  passwordVisible: boolean = false;
  formSubmitted: boolean = false;

  constructor() {
    this.setupForm();
  }

  setupForm(): void {
    this.loginForm = this.formBuilder.group({
      documentNumber: [
        '',
        [
          Validators.required, 
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(6),
          Validators.maxLength(12)
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  async onSubmit(): Promise<void> {
    this.formSubmitted = true;

    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      await this.presentAlert('Error', 'Por favor, complete correctamente todos los campos.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'circles',
      cssClass: 'custom-loading',
    });

    await loading.present();

    const { documentNumber, email, password } = this.loginForm.value;

    this.authService.login(documentNumber, email, password).subscribe({
      next: async (response: LoginResponse) => {
        await loading.dismiss();

        if ('error' in response) {
          this.showErrorMessage(
            'Error al iniciar sesión. Verifique sus credenciales.'
          );
          return;
        }

        this.router.navigate(['/menu']);
        this.loginForm.reset();
        
      },
      error: async (error) => {
        await loading.dismiss();
        this.showErrorMessage('Error de conexión. Intente nuevamente.');
        console.error('Login error:', error);
      },
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    
    if (controlName === 'documentNumber') {
      if (control.errors['required']) return 'Documento es obligatorio';
      if (control.errors['pattern']) return 'Ingrese solo números';
      if (control.errors['minlength']) return 'Mínimo 6 dígitos';
      if (control.errors['maxlength']) return 'Máximo 12 dígitos';
    }
    
    if (controlName === 'email') {
      if (control.errors['required']) return 'Email es obligatorio';
      if (control.errors['email']) return 'Formato de email inválido';
    }
    
    if (controlName === 'password') {
      if (control.errors['required']) return 'Contraseña es obligatoria';
      if (control.errors['minlength']) return 'Mínimo 8 caracteres';
    }
    
    return 'Campo inválido';
  }

  private async showErrorMessage(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 4000,
      position: 'top',
      color: 'danger',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
        },
      ],
    });

    await toast.present();
  }

  async presentAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}