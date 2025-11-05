import { Injectable, inject, signal } from '@angular/core';
import { Auth,authState,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,updateProfile } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticacionService {

  public periodo = signal<number>(new Date().getFullYear()); //Periodo actual seleccionado de admin-navbar component
  public auth = inject(Auth);
  authState = authState(this.auth); /// Observable. esta es la proiedad que debo importar en todos los componentes denotro del Oninit

  constructor() {

   }

  // Método para obtener el usuario actual de forma síncrona
  getCurrentUser(){
    return this.auth.currentUser;
  }

   // Método para registrar un usuario con correo y contraseña
  async registerWithEmail(email: string, password: string, codigoEstudiante: string, programa: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    // Luego actualizamos el perfil con el displayName
    await updateProfile(userCredential.user, {
      displayName: codigoEstudiante,
      photoURL: programa
    });
    return userCredential;
  }


  // Método para iniciar sesión con correo y contraseña
  async signInWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword( this.auth, email, password);
  }

  periodoActual(periodoSeleccionado:number){
    this.periodo.set(periodoSeleccionado);
  }

  // Método para cerrar sesión
  logout() {
    signOut(this.auth);
    //return this.auth.signOut();
  }
}
