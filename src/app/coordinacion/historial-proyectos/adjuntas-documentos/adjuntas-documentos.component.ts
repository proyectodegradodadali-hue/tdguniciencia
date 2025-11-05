import { Component, EventEmitter, inject, Output, signal, SimpleChanges } from '@angular/core';
import { AuthenticacionService } from '../../../services/authenticacion.service';
import { FirestoreService } from '../../../services/firestore.service';
import { AlertaService } from '../../../services/alerta.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertaInformativoComponent } from '../../../shared/alerta-informativo/alerta-informativo.component';
import { StorageService } from '../../../services/storage.service';

interface DocumentoAdjunto {
  url: string;
  nombreOriginal: string;
  fechaSubida: string;
}

@Component({
  selector: 'app-adjuntas-documentos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertaInformativoComponent],
  templateUrl: './adjuntas-documentos.component.html',
  styleUrl: './adjuntas-documentos.component.css'
})
export class AdjuntasDocumentosComponent {

  private _authcations = inject(AuthenticacionService);
  private _firestore = inject(FirestoreService);
  private _storage = inject(StorageService);
  public _alerta = inject(AlertaService);

  proyectoId = '';
  urlDocumentos: DocumentoAdjunto[] = [];

  // Signal para controlar la visibilidad del modal (igual que app-form1-sedes)
  mostrarModal = signal<boolean>(false);


  constructor() {
  }

  // Abrir modal. Permite pasar datos cuando es edición o contexto cuando es creación
  abrirModal(dato: any) {
    this.mostrarModal.set(true);
    this.proyectoId = dato.id;
    
    // Manejar compatibilidad con datos antiguos (que solo tenían URLs)
    if (dato.urlDocumentos && dato.urlDocumentos.length > 0) {
      // Si es el formato antiguo (array de strings)
      if (typeof dato.urlDocumentos[0] === 'string') {
        this.urlDocumentos = dato.urlDocumentos.map((url: string) => ({
          url: url,
          nombreOriginal: this.obtenerNombreArchivo(url),
          fechaSubida: new Date().toISOString()
        }));
      } else {
        // Si ya es el formato nuevo (array de objetos)
        this.urlDocumentos = dato.urlDocumentos;
      }
    } else {
      this.urlDocumentos = [];
    }
    
    console.log(this.urlDocumentos);
  }

  // Cerrar modal
  cerrarModal() {
    this.mostrarModal.set(false);
  }

  // Guardar cambios (crear o editar)
  // async handleSave() {
  //   const path = `Proyectos`;
  //   const raw = this.agregarProyectoForm.value;
  //   console.log(raw);

  //   try {
  //     if (this.modo === 'editar' && this.datosEdicion?.id) {
  //       await this._firestore.updateDocument(`${path}/${this.datosEdicion.id}`, raw);
  //       this._alerta.showSuccess('Proyecto actualizado exitosamente.');
  //     } else {
  //       // crear: adjunta metadatos mínimos
  //       // const nuevo = {
  //       //   ...payload,
  //       //   programId: this.programIdForCreate
  //       // };
  //       await this._firestore.createDocument(path, raw);
  //       this._alerta.showSuccess('Proyecto creado exitosamente.');
  //     }
  //     this.cerrarModal();
  //   } catch (error) {
  //     this._alerta.showError('Tu Conexión Internet Falló');
  //   }
    
  // }



  @Output() sendUrlParent = new EventEmitter<string>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  uploadProgress = 0;
  errorMessage = '';
  uid = '';
  nit = '';

  

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar el tipo de archivo
      if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'application/pdf' && file.type !== 'application/msword' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && file.type !== 'application/zip' && file.type !== 'application/x-rar-compressed' && file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.type !== 'application/vnd.ms-excel' && file.type !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.errorMessage = 'Formato de archivo no válido';
        event.target.value = ''; // Resetear input
        return;
      }

      // Validar el tamaño del archivo (por ejemplo, máximo 20MB)
      if (file.size > 20 * 1024 * 1024) {
        this.errorMessage = 'El archivo no debe superar los 20MB';
        event.target.value = ''; // Resetear input
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';

      // Crear preview (solo si es imagen)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
      
      // Subir automáticamente
      this.uploadImage();
      
      // Resetear el input para permitir seleccionar el mismo archivo de nuevo
      event.target.value = '';
    }
  }

  async uploadImage() {
    if (!this.selectedFile) return;

    try {
      this.uploading = true;
      
      // Guardar nombre original
      const nombreOriginal = this.selectedFile.name;
      
      // Generar nombre único con timestamp
      const timestamp = Date.now();
      const extension = nombreOriginal.substring(nombreOriginal.lastIndexOf('.'));
      const nombreSinExtension = nombreOriginal.substring(0, nombreOriginal.lastIndexOf('.'));
      const nombreUnico = `${nombreSinExtension}_${timestamp}${extension}`;
      
      // Crear la ruta para el archivo en Storage
      const path = `DocumentosProyectos/${nombreUnico}`;
      
      // Subir archivo y obtener URL
      const url = await this._storage.uploadFileProgreso(
        path,
        this.selectedFile,
        (progress) => {
          this.uploadProgress = Math.round(progress);
        }
      );
      
      // Crear objeto con metadata
      const nuevoDocumento: DocumentoAdjunto = {
        url: url,
        nombreOriginal: nombreOriginal,
        fechaSubida: new Date().toISOString()
      };
      
      this.sendUrlParent.emit(url);

      // Actualizar URL en Firestore con metadata
      const documentosActualizados = [...this.urlDocumentos, nuevoDocumento];
      await this._firestore.updateDocument(
        `Proyectos/${this.proyectoId}`,
        { urlDocumentos: documentosActualizados }
      );

      // Actualizar localmente
      this.urlDocumentos = documentosActualizados;

      this._alerta.showSuccess('Documento subido exitosamente.');

      // Resetear el estado
      this.selectedFile = null;
      this.previewUrl = null;
      this.uploadProgress = 0;
      this.errorMessage = '';
      
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      this.errorMessage = 'Error al subir la imagen. Por favor, intenta nuevamente.';
    } finally {
      this.uploading = false;
    }
  }

  // Extraer el nombre del archivo de la URL
  obtenerNombreArchivo(item: string | DocumentoAdjunto): string {
    // Si es un objeto con nombreOriginal, usarlo
    if (typeof item === 'object' && item.nombreOriginal) {
      return item.nombreOriginal;
    }
    
    // Si es string (formato antiguo), extraer de la URL
    const url = typeof item === 'string' ? item : item.url;
    
    try {
      const decodedUrl = decodeURIComponent(url);
      const match = decodedUrl.match(/DocumentosProyectos%2F([^?]+)/);
      if (match && match[1]) {
        // Remover el timestamp si existe
        const nombreConTimestamp = decodeURIComponent(match[1]);
        return nombreConTimestamp.replace(/_\d{13}(\.[^.]+)$/, '$1');
      }
      
      const segments = decodedUrl.split('/');
      const lastSegment = segments[segments.length - 1];
      const filename = lastSegment.split('?')[0];
      return filename || 'Documento sin nombre';
    } catch (error) {
      return 'Documento';
    }
  }

  // Obtener la extensión del archivo
  obtenerExtension(item: string | DocumentoAdjunto): string {
    const nombre = this.obtenerNombreArchivo(item);
    const extension = nombre.split('.').pop()?.toUpperCase() || 'DOC';
    return extension;
  }

  obtenerClaseExtension(item: string | DocumentoAdjunto): string {
    const ext = this.obtenerExtension(item).toLowerCase();
    
    const clases: { [key: string]: string } = {
      'pdf': 'bg-red-100 text-red-800',
      'doc': 'bg-blue-100 text-blue-800',
      'docx': 'bg-blue-100 text-blue-800',
      'zip': 'bg-yellow-100 text-yellow-800',
      'rar': 'bg-yellow-100 text-yellow-800',
      'png': 'bg-yellow-100 text-yellow-800',
      'jpg': 'bg-yellow-100 text-yellow-800',
      'jpeg': 'bg-green-100 text-green-800',
      'xlsx': 'bg-green-100 text-green-800',
      'pptx': 'bg-orange-100 text-orange-800',
      'ppt': 'bg-orange-100 text-orange-800',
      'xls': 'bg-green-100 text-green-800',
    };
    
    return clases[ext] || 'bg-gray-100 text-gray-800';
  }

  // Ver documento (abre en nueva pestaña)
  verDocumento(item: string | DocumentoAdjunto): void {
    const url = typeof item === 'string' ? item : item.url;
    window.open(url, '_blank');
  }

  // Eliminar documento
  async eliminarDocumento(index: number): Promise<void> {
    if (confirm('¿Estás seguro de eliminar este documento?')) {
      try {
        // Crear nuevo array sin el documento eliminado
        const nuevasUrls = this.urlDocumentos.filter((_, i) => i !== index);
        
        // Actualizar en Firestore
        await this._firestore.updateDocument(
          `Proyectos/${this.proyectoId}`,
          { urlDocumentos: nuevasUrls }
        );
        
        // Actualizar localmente
        this.urlDocumentos = nuevasUrls;
        
        this._alerta.showSuccess('Documento eliminado exitosamente.');
      } catch (error) {
        console.error('Error al eliminar documento:', error);
        this._alerta.showError('Error al eliminar el documento.');
      }
    }
  }
}
