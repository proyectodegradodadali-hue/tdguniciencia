import { inject, Injectable } from '@angular/core';
import { and, collection, collectionData, collectionGroup, deleteDoc, doc, docData, DocumentSnapshot, Firestore, getDoc, getDocs, limit, or, orderBy, query, QuerySnapshot, serverTimestamp, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Models } from '../interfaces/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  _firestore: Firestore = inject(Firestore);

  constructor() { 

  }

  //-- CREATE DOCUMENTO--

  async createDocument<tipo>(path: string, data: tipo, id: string | null = null) {
    let refDoc;
    if (id){
      refDoc = doc(this._firestore,`${path}/${id}`);
    }else{
      const refCollection = collection(this._firestore, path);
      refDoc = doc(refCollection); 
    }
    //console.log('---->>>',refDoc)
    const dataDoc: any = data;
    dataDoc.id = refDoc.id;
    dataDoc.docCreado = serverTimestamp();
    dataDoc.estado = "Activo";
    return await setDoc(refDoc, dataDoc);
  }

  //-- CREATE DEVOLVER ID--

  async createDocumentDevolverId<tipo>(path: string, data: tipo, id: string | null = null) {
    let refDoc;
    if (id){
      refDoc = doc(this._firestore,`${path}/${id}`);
    }else{
      const refCollection = collection(this._firestore, path);
      refDoc = doc(refCollection); 
    }
    //console.log('---->>>',refDoc)
    const dataDoc: any = data;
    dataDoc.id = refDoc.id;
    dataDoc.docCreado = serverTimestamp();
    dataDoc.estado = "Activo";
    await setDoc(refDoc, dataDoc);
    return dataDoc ;
  }


  //-- ACTUALIZAR

  async updateDocument(path: string, data: any) {
    const refDoc = doc(this._firestore, path);
    data.docActualizado = serverTimestamp();
    return await updateDoc(refDoc, data, { merge: true });
  }

  //-- DELETE

  async deleteDocument(path: string) {
    const refDoc = doc(this._firestore, path);
    return await deleteDoc(refDoc);
  }
  

  //-- LEER UN DOCUMENTO INSTANTANEO

  async getDocument<tipo>(path: string) {
    const document = doc(this._firestore, path);
    return await getDoc(document) as DocumentSnapshot<tipo>;
  }

  //-- LEER MUCHOS DOCUMENTOS INSTANTANEO
  //Si group es true, hace una consulta a un collection group (subcolecciones con el mismo nombre en distintos documentos).
  async getDocuments<tipo>(path: string, group: boolean = false) {
    if (!group) {
      const refCollection = collection(this._firestore, path);
      return await getDocs(refCollection) as QuerySnapshot<tipo>;
    } else {
      const refCollectionGroup = collectionGroup(this._firestore, path);
      return await getDocs(refCollectionGroup) as QuerySnapshot<tipo>;
    }
  }
  

  //-- LEER UN DOCUMENTO SUSCRITO - TIEMPOREAL

  getDocumentChanges<tipo>(path: string) {
    const refDocument = doc(this._firestore, path);
    return docData(refDocument) as Observable<tipo>;
  }
  
  //-- LEER MUCHOS DOCUMENTOS SUSCRITO - TIEMPOREAL
  //Si group es true, hace una consulta a un collection group (subcolecciones con el mismo nombre en distintos documentos).
  getDocumentsChanges<tipo>(path: string, group: boolean = false) {
    if (!group) {
      const refCollection = collection(this._firestore, path);
      return collectionData(refCollection) as Observable<tipo[]>;
    } else {
      const refCollectionGroup = collectionGroup(this._firestore, path);
      return collectionData(refCollectionGroup) as Observable<tipo[]>;
    }
  }

  //-- QUERY

  async getDocumentsQuery<tipo>(
    path: string, 
    querys: Models.Firebases.whereQuery[], 
    extras: Models.Firebases.extrasQuery = Models.Firebases.defaultExtrasQuery
  ) {
    //console.log('getDocumentsQueryChanges()');
    let ref: any;
    if (!extras.group) {
      ref = collection(this._firestore, path);
    } else {
      ref = collectionGroup(this._firestore, path);
    }
  
    // q = [
    //   ['enable', '==', true, 'salty', '==', true],
    //   ['name', '==', 'Water']
    // ];
    let ors: any = [];
    querys.forEach((row) => {
      let wheres: any = [];
      for (let col = 0; col < row.length; col = col + 3) {
        wheres.push(where(row[col], row[col + 1], row[col + 2]));
      }
      const AND = and(...wheres);
      ors.push(AND);
    });
    let q = query(ref, or(...ors));

    // limit
    if (extras.limit) {
      q = query(q, limit(extras.limit));
    }

    // orderBy
    if (extras.orderParam) {
      q = query(q, orderBy(extras.orderParam, extras.directionSort));
    }

    // startAfter
    if (extras.startAfter) {
      q = query(q, orderBy(extras.startAfter));
    }

    return await getDocs(q) as QuerySnapshot<tipo>;

  }

  getDocumentsQueryChanges<tipo>(
    path: string, 
    querys: Models.Firebases.whereQuery[], 
    extras: Models.Firebases.extrasQuery = Models.Firebases.defaultExtrasQuery
  ) {
    //console.log('getDocumentsQueryChanges()');
    let ref: any;
    if (!extras.group) {
      ref = collection(this._firestore, path);
    } else {
      ref = collectionGroup(this._firestore, path);
    }
  
    // q = [
    //   ['enable', '==', true, 'salty', '==', true],
    //   ['name', '==', 'Water']
    // ];
    let ors: any = [];
    querys.forEach((row) => {
      let wheres: any = [];
      for (let col = 0; col < row.length; col = col + 3) {
        wheres.push(where(row[col], row[col + 1], row[col + 2]));
      }
      const AND = and(...wheres);
      ors.push(AND);
    });
    let q = query(ref, or(...ors));

    // limit
    if (extras.limit) {
      q = query(q, limit(extras.limit));
    }

    // orderBy
    if (extras.orderParam) {
      q = query(q, orderBy(extras.orderParam, extras.directionSort));
    }

    // startAfter
    if (extras.startAfter) {
      q = query(q, orderBy(extras.startAfter));
    }

    return collectionData(q) as Observable<tipo[]>;
  }  
  
}
