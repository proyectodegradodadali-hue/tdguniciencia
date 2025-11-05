import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-observaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './observaciones.component.html',
  styleUrl: './observaciones.component.css'
})
export class ObservacionesComponent {

  // Datos simulados de observaciones
  observaciones = [
    { estudiante: 'Juan Pérez', proyecto: 'App Angular', texto: 'Falta detalle en el módulo de login', fecha: '20/08/2025' },
    { estudiante: 'María Gómez', proyecto: 'Sistema de Seguridad', texto: 'Buen avance en la documentación', fecha: '21/08/2025' },
    { estudiante: 'Carlos Rodríguez', proyecto: 'Proyecto SaaS', texto: 'Revisar la integración con API externa', fecha: '22/08/2025' },
    { estudiante: 'Laura Torres', proyecto: 'Web Corporativa', texto: 'Mejorar la presentación de la interfaz', fecha: '23/08/2025' },
    { estudiante: 'Pedro Jiménez', proyecto: 'Aplicación Móvil', texto: 'Agregar pruebas unitarias', fecha: '24/08/2025' },
  ];

  constructor() {}
  
}
