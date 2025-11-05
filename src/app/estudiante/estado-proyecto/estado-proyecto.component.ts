import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-estado-proyecto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estado-proyecto.component.html',
  styleUrl: './estado-proyecto.component.css'
})
export class EstadoProyectoComponent {

  // Datos simulados
  proyectos = [
    { nombre: 'App Angular', estado: 'Activo', fechaEntrega: '28/08/2025' },
    { nombre: 'Sistema de Seguridad', estado: 'En revisión', fechaEntrega: '30/08/2025' },
    { nombre: 'Proyecto SaaS', estado: 'Retrasado', fechaEntrega: '25/08/2025' },
  ];

  constructor() { }
}
