import { Component, EventEmitter, Output } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-agregar-archivos',
  standalone: true,
  imports: [],
  templateUrl: './agregar-archivos.component.html',
  styleUrl: './agregar-archivos.component.css'
})
export class AgregarArchivosComponent {

  @Output() sendUrlParent = new EventEmitter<string>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  uploadProgress = 0;
  errorMessage = '';
  uid = '';
  nit = '';

  constructor(
    private firestoreService: FirestoreService,
    private storageService: StorageService,
    //private _authcations: AuthenticacionService,
    // private signalsimagen: SignalsService
  ) {
    //this.uid = this._authcations.getCurrentUser().uid;
    //this.nit = this._authcations.getCurrentUser().displayName;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar el tipo de archivo
      if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
        this.errorMessage = 'Por favor, selecciona una imagen png, jpg o jpeg';
        return;
      }

      // Validar el tamaño del archivo (por ejemplo, máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'La imagen no debe superar los 2MB';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      this.uploadImage();
    }
  }

  async uploadImage() {
    if (!this.selectedFile) return;

    const userId = this.uid;
    if (!userId) {
      this.errorMessage = 'No hay usuario autenticado';
      return;
    }

    try {
      this.uploading = true;
      
      // Crear la ruta para el archivo en Storage
      const path = `DocumentosProyectos/${this.selectedFile.name}`;
      
      // Subir archivo y obtener URL
      const url = await this.storageService.uploadFileProgreso(
        path,
        this.selectedFile,
        (progress) => {
          this.uploadProgress = Math.round(progress);
        }
      );
      
      this.sendUrlParent.emit(url);

      // Actualizar URL en Firestore
      // await this.firestoreService.setDocument(
      //   `Proyectos/${userId}`,
      //   { documentos: [url] }
      // );

      // Actualizar el Signal
      //this.signalsimagen.setLogoUrl(url);

      // Resetear el estado
      this.selectedFile = null;
      this.uploadProgress = 0;
      this.errorMessage = '';
      
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      this.errorMessage = 'Error al subir la imagen. Por favor, intenta nuevamente.';
    } finally {
      this.uploading = false;
    }
  }
}
