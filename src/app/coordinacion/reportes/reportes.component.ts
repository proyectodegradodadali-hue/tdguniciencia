import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';


interface Reporte {
  nombre: string;
  tipo: 'PDF' | 'Excel' | 'Gráfico';
  fecha: string;
  generadoPor: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent {

  filtrosForm: FormGroup;

  reportes: Reporte[] = [
    { nombre: 'Proyectos Completados 2025', tipo: 'PDF', fecha: '2025-08-23', generadoPor: 'Coordinación' },
    { nombre: 'Estado de Proyectos', tipo: 'Excel', fecha: '2025-08-22', generadoPor: 'Coordinación' },
    { nombre: 'Estadísticas Docentes', tipo: 'Gráfico', fecha: '2025-08-21', generadoPor: 'Coordinación' },
  ];

  constructor(private fb: FormBuilder) {
    this.filtrosForm = this.fb.group({
      busqueda: [''],
      tipo: ['']
    });
  }

  reportesFiltrados(): Reporte[] {
    const busqueda = this.filtrosForm.get('busqueda')!.value.toLowerCase();
    const tipo = this.filtrosForm.get('tipo')!.value;
    return this.reportes.filter(r =>
      r.nombre.toLowerCase().includes(busqueda) &&
      (tipo ? r.tipo === tipo : true)
    );
  }

  limpiarFiltros() {
    this.filtrosForm.reset();
  }

  descargarReporte(reporte: Reporte) {
    alert(`Descargando reporte: ${reporte.nombre} (${reporte.tipo})`);
    // Aquí puedes integrar lógica real de descarga desde backend
  }
}
