import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cronograma',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cronograma.component.html',
  styleUrl: './cronograma.component.css'
})
export class CronogramaComponent {

  // Datos simulados de actividades
  actividades = [
    {
      titulo: 'Entrega de informe inicial',
      descripcion: 'Subir el informe inicial del proyecto',
      fecha: new Date('2025-08-28'),
      estado: 'Pendiente'
    },
    {
      titulo: 'Revisión con tutor',
      descripcion: 'Sesión de revisión del proyecto con el tutor',
      fecha: new Date('2025-08-30'),
      estado: 'Pendiente'
    },
    {
      titulo: 'Entrega final del proyecto',
      descripcion: 'Subir la versión final del proyecto',
      fecha: new Date('2025-09-05'),
      estado: 'Retrasado'
    },
    {
      titulo: 'Presentación de proyecto',
      descripcion: 'Defensa del proyecto frente al comité',
      fecha: new Date('2025-09-10'),
      estado: 'Completo'
    }
  ];

  constructor() {}
}
