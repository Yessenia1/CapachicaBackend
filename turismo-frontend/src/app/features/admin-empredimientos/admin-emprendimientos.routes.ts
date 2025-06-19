import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ADMIN_EMPRENDEDORES_ROUTES: Routes = [
  {
    path: 'seleccion-panel',
    loadComponent: () => import('./seleccion-panel/seleccion-panel.component').then(c => c.SeleccionPanelComponent),
    canActivate: [authGuard],
    title: 'Selección de Panel'
  },
  {
    path: 'mis-emprendimientos',
    loadComponent: () => import('./mis-emprendimientos/mis-emprendimientos.component').then(c => c.MisEmprendimientosComponent),
    canActivate: [authGuard],
    title: 'Mis Emprendimientos'
  },
  {
    path: 'emprendimiento/:id',
    loadComponent: () => import('./emprendimiento-detalle/emprendimiento-detalle.component').then(c => c.EmprendimientoDetalleComponent),
    canActivate: [authGuard],
    title: 'Detalle de Emprendimiento'
  },
  {
    path: 'emprendimiento/:id/servicios',
    loadComponent: () => import('./servicios-list/servicios-list.component').then(c => c.ServiciosListComponent),
    canActivate: [authGuard],
    title: 'Servicios del Emprendimiento'
  },
  {
    path: 'emprendimiento/:id/servicio/nuevo',
    loadComponent: () => import('./servicios-form/servicio-form.component').then(c => c.ServicioFormComponent),
    canActivate: [authGuard],
    title: 'Nuevo Servicio'
  },
  {
    path: 'emprendimiento/:id/servicio/:servicioId',
    loadComponent: () => import('./servicios-form/servicio-form.component').then(c => c.ServicioFormComponent),
    canActivate: [authGuard],
    title: 'Editar Servicio'
  },
  {
    path: 'emprendimiento/:id/administradores',
    loadComponent: () => import('./administradores-list/administradores-list.component').then(c => c.AdministradoresListComponent),
    canActivate: [authGuard],
    title: 'Administradores del Emprendimiento'
  }
];