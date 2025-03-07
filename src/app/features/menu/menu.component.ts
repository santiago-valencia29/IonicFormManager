import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserSession } from 'src/app/shared/models/user-session.model';
import { MenuOption } from 'src/app/shared/models/menu-options.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MenuComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  userData = signal<UserSession | null>(null);
  
  menuOptions = signal<MenuOption[]>([
    {
      id: 'create',
      title: 'Crear Solicitud',
      icon: 'add-circle',
      color: 'success',
      description: 'Cree sus solicitudes de manera eficiente'
    },
    {
      id: 'edit',
      title: 'Editar Solicitud',
      icon: 'create',
      color: 'warning',
      description: 'Edite sus solicitudes de manera eficiente'
    },
    {
      id: 'view',
      title: 'Consultar Solicitud',
      icon: 'search',
      color: 'tertiary',
      description: 'Consulte sus solicitudes de manera eficiente'
    },
    {
      id: 'sync',
      title: 'Sincronizar Solicitud',
      icon: 'sync',
      color: 'primary',
      description: 'Sincronice sus solicitudes de manera eficiente'
    }
  ]);
  
  ngOnInit(): void {
    this.userData.set(this.authService.user());
  }
  
  logout(): void {
    this.authService.logout();
  }
}