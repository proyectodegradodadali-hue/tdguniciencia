import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subir-documentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subir-documentos.component.html',
  styleUrl: './subir-documentos.component.css'
})
export class SubirDocumentosComponent {

  archivoSeleccionado: File | null = null;
  descripcion: string = '';

  constructor() {}

  // Evento al seleccionar un archivo
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  // Función para "subir" documento (simulado)
  subirDocumentos() {
    if (!this.archivoSeleccionado) return;

    // Aquí puedes conectar con Firebase Storage o tu backend
    console.log('Subiendo archivo:', this.archivoSeleccionado.name);
    console.log('Descripción:', this.descripcion);

    // Reset del formulario
    this.archivoSeleccionado = null;
    this.descripcion = '';
    alert('Documento subido correctamente!');
  }

}
