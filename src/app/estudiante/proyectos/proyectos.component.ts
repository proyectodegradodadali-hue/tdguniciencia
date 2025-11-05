import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.css'
})
export class ProyectosComponent {

  // Datos simulados
  proyectos = [
    { nombre: 'App Angular', estado: 'Activo', fechaEntrega: '28/08/2025' },
    { nombre: 'Sistema de Seguridad', estado: 'En revisión', fechaEntrega: '30/08/2025' },
    { nombre: 'Proyecto SaaS', estado: 'Retrasado', fechaEntrega: '25/08/2025' },
    { nombre: 'Web Corporativa', estado: 'Activo', fechaEntrega: '10/09/2025' },
    { nombre: 'Aplicación Móvil', estado: 'En revisión', fechaEntrega: '15/09/2025' },
  ];

  constructor() {}

}
