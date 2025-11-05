import { inject, Injectable } from '@angular/core';
import { Storage, uploadString, getDownloadURL, uploadBytesResumable, ref, uploadBytes, getBlob } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private storage: Storage = inject(Storage);

  constructor() { 
    //console.log('Servicio storage')
  }

  uploadString(){

  }

  async uploadFile(carpeta:string, nombreArchivo:string, file: File | Blob){
    const storageRef = ref(this.storage,`${carpeta}/${nombreArchivo}`);
    const snapshop = await uploadBytes(storageRef,file);
    return snapshop;
  }

  getDownloadURL(path: string){ //para archivos publicos
    const storageRef = ref(this.storage,path);
    return getDownloadURL(storageRef);
  }

  async obtenerURLTemporal(path: string, nombreArchivo: string){
    const storageRef = ref(this.storage, path);
    const blob = await getBlob(storageRef);
    return URL.createObjectURL(blob);
  }

  async downloadFile(path: string){
    const storageRef = ref(this.storage, path);
    const blob = await getBlob(storageRef);

    //1 metodo creadno un elemento
    const urlLocal = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlLocal;
    // Elimina los números y el guion bajo inicial
    let nombre = storageRef.name.replace(/^\d+_/, '');
    link.download = nombre;
    link.click();
    link.remove();

  }

  // Método para subir un archivo y obtener la URL de descarga
  async uploadFileProgreso(path: string, file: File | Blob, progressCallback?: (progress: number) => void): Promise<string> {
    const storageRef = ref(this.storage, path);  // Creamos una referencia en el storage

    // Usamos uploadBytesResumable para permitir la carga con seguimiento de progreso
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Creamos una promesa para manejar el progreso y obtener la URL de descarga
    return new Promise((resolve, reject) => {
      // Seguimiento del progreso de la carga
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculamos el progreso
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // Llamamos al callback para pasar el progreso
          if (progressCallback) {
            progressCallback(progress);  // Llamamos al callback para pasar el progreso
          }
        },
        (error) => {
          // En caso de error, rechazamos la promesa
          console.error('Error al cargar el archivo:', error);
          reject(error);
        },
        async () => {
          // Cuando la carga finalice con éxito, obtenemos la URL de descarga
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            //console.log('Archivo subido correctamente a Storage:', downloadURL);
            resolve(downloadURL);  // Resolvemos la promesa con la URL
          } catch (error) {
            //console.error('Error al obtener la URL de descarga:', error);
            reject(error);
          }
        }
      );
    });
  }
}
