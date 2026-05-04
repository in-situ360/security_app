import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/User';
import { UtilitiesService } from './utilities.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public userChanges = new Subject<User>();
  public userChanges2 = new Subject<void>();
  public userNotCountChanges = new Subject<void>();
  public laguageChanges = new Subject<void>();
  public projectsChanges = new Subject<void>();
  public translatesChanges = new Subject<void>();
  public projectDetailsChanges = new Subject<void>();
  public foldersChanges = new Subject<void>();
  public chatsChanges = new Subject<void>();
  public chatUserStatusChanges = new Subject<void>();
  public userRequests = new Subject<void>();
  public userRequestsOption= new Subject<void>();
  public chatsOption= new Subject<void>(); 
  public personalArchiveChanges = new Subject<any>();
  public personalArchiveNew = new Subject<any>();
  public deleteJobChange = new Subject<any>();
  public linkAddChange = new Subject<[string, any]>();


  public folderChanges = new Subject<any>();
  public httpOptions: any;
  public fromRegister:number=0;
  public userId:number=0;
  public showModalSplash:boolean=true;
  public mediaActivated = new Subject<void>();
  public mediaActivatedFolder = new Subject<void>();
  public photoActivated = new Subject<void>();


  // Reenvía SIEMPRE el último valor a nuevos suscriptores, sin valor inicial basura
  /*private linkSubject = new ReplaySubject<[string, any]>(1);
  public link$ = this.linkSubject.asObservable();

  // Llamada manual desde cualquier parte
  emitLink(title: string, value: any) {
    this.linkSubject.next([title, value]);
  }*/
  
  
  public menuMustClose = new Subject<void>();

  private nuevosMensajesSubject = new BehaviorSubject<boolean>(false);
  private nuevasSolicitudesSubject = new BehaviorSubject<boolean>(false);

  public userFollowSubject= new BehaviorSubject<[number, any]>([null, null]);
  userFollow$ = this.userFollowSubject.asObservable();

  public httpOptionsFiles: any;


  nuevosMensajes$ = this.nuevosMensajesSubject.asObservable();
  nuevasSolicitudes$ = this.nuevasSolicitudesSubject.asObservable();


  constructor(
    private http: HttpClient,
    private utilities: UtilitiesService,
  ) { }


  changeHasFollowInUser(userId:number,followData: any) {
    this.userFollowSubject.next([userId,followData]);
  }
  

  // Método para notificar nuevos mensajes
  notificarNuevosMensajes(hayNuevos: boolean) {
    this.nuevosMensajesSubject.next(hayNuevos);
  }

  // Método para notificar nuevas solicitudes
  notificarNuevasSolicitudes(hayNuevas: boolean) {
    this.nuevasSolicitudesSubject.next(hayNuevas);
  }

  public getFromRegister(){
    return this.fromRegister;
  }

  public setFromRegister(arg:number){
    this.fromRegister=arg;
  }


  public getUserId(){
    return this.userId;
  }

  public setUserId(arg:number){
    this.userId=arg;
  }

 /* public getShowModalSplash(){
    return this.showModalSplash;
  }*/

  public getShowModalSplash(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(this.showModalSplash);
    });
  }

  public setShowModalSplash(arg:boolean){
    this.showModalSplash=arg;
  }

  

  /**
   * Hace una petición GET al dominio asociado de la aplicación para comprobar si está o no suspendido.
   * **IMPORTANTE**: En el archivo src/environments/environment.ts, debe establecerse correctamente la propiedad domainUrl
   */
  public checkAppDomain(): Observable<any> {
    return this.http.get(environment.domainUrl, { responseType: 'text' });
  }

  /**
   * Método para iniciar sesión
   * @param email 
   * @param password 
   */
  public login(user: User) {
    return this.http.post<User>(environment.apiUrl + 'login', user);
  }

  /**
   * Inicio de sesión con los datos devueltos de Facebook
   * @param user 
   */
  public loginFacebook(user): any {
    return this.http.post<User>(environment.apiUrl + 'login-facebook', user);
  }

  /**
   * Inicio de sesión con los datos devueltos de Google
   * @param user
   */
  public loginGoogle(user): any {
    return this.http.post<User>(environment.apiUrl + 'login-google', user);
  }

  /**
   * Método para el registro básico
   * @param user 
   */
  public register(user: User) {
    return this.http.post<User>(environment.apiUrl + 'signup', user);
  }

  /**
   * Método para recuperar contraseña
   * @param email 
   */
  public forgotPassword(params) {
    return this.http.post(environment.apiUrl + 'forgot-password', params);
  }

  /**
   * Método para añadir el bearer token a las cabeceras 
   */
  public setTokenToHeaders(token: string): void {

    //Asignar token a las siguientes peticiones
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    this.httpOptionsFiles = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'enctype': 'multipart/form-data'
      }),
      reportProgress: true,
    };
  }

  public removeTokenToHeaders(): void {
    this.httpOptions = null;
  }

  /**
   * Método para actualizar los datos del usuario
   * @param user 
   */
  public updateUser(user: User): any {
    this.userChanges.next(user);
    //this.userChanges2.next();
    return this.http.post<User>(environment.apiUrl + 'update-user', user, this.httpOptions);
  }

  


  /**
   * Guardar el token del dispositivo en el servidor firebase
   * @param tokenRegistro 
   */
  public guardarTokenDeRegistro(tokenRegistro,identificadorDispositivo) {
    return this.http.post(environment.apiUrl + 'guardar-token', { registerToken: tokenRegistro, platform: this.utilities.getPlatform(),idenDispositivo:identificadorDispositivo }, this.httpOptions);
  } 

  /**
 * Método para procesar el pago stripe
 */
  public procesarPago(params: { precio: number, stripeToken?: any }): any {

    return this.http.post(environment.apiUrl + 'pago', params, this.httpOptions);
  }


  // ====================== Métodos API RESTFUL ==========================


  // Como obtener los productos por ejemplo:
  // this.apiService.getEntity('productos').subscribe((productos:Productos)=>{console.log(productos)});

  
// ====================== Obtener entidades ================================

public getEntity(entity: string, id?: number): any {
  if (id)
    return this.http.get(environment.apiUrl + entity + '/' + id, this.httpOptions);
  else
    return this.http.get(environment.apiUrl + entity, this.httpOptions);
}

public getSubEntity(entity: string, idEntity: number, subEntity: string, idSubEntity?: number): any {
  if (idSubEntity)
    return this.http.get(environment.apiUrl + entity + '/' + idEntity + '/' + subEntity + '/' + idSubEntity, this.httpOptions);
  else
    return this.http.get(environment.apiUrl + entity + '/' + idEntity + '/' + subEntity, this.httpOptions);
}

public getSubSubEntity(entity: string, idEntity: number, subEntity: string, idSubEntity: number, subSubEntity: string, idSubSubEntity?: number): any {
  if (idSubSubEntity)
    return this.http.get(environment.apiUrl + entity + '/' + idEntity + '/' + subEntity + '/' + idSubEntity + '/' + subSubEntity + '/' + idSubSubEntity, this.httpOptions);
  else
    return this.http.get(environment.apiUrl + entity + '/' + idEntity + '/' + subEntity + '/' + idSubEntity + '/' + subSubEntity, this.httpOptions);
}


// ====================== Añadir entidades ================================


public addEntity(entity: string, params: any): any {
  return this.http.post(environment.apiUrl + entity, params, this.httpOptions);
}

public addSubEntity(entity: string, idEntity: number, subEntity: string, params?: any): any {
  return this.http.post(environment.apiUrl + entity + '/' + idEntity + '/' + subEntity, params, this.httpOptions);
}

public addSubSubEntity(entity: string, idEntity: number, subEntity: string, idSubEntity: number, subSubEntity: string, params?: any): any {
  return this.http.post(environment.apiUrl + entity + '/' + idEntity + '/' + subEntity + '/' + idSubEntity + '/' + subSubEntity, params, this.httpOptions);
}


// ====================== Borrar entidades ================================


public deleteEntity(entity: string, id: number): any {
  return this.http.delete(environment.apiUrl + entity + '/' + id, this.httpOptions);
}

public deleteSubEntity(entity: string, idEntity: number, subEntity: string, idSubEntity: number): any {
  return this.http.delete(environment.apiUrl + entity + '/' + idEntity + '/' + subEntity + '/' + idSubEntity, this.httpOptions);
}

public deleteSubSubEntity(entity: string, idEntity: number, subEntity: string, idSubEntity: number, subSubEntity: string, idSubSubEntity: number): any {
  return this.http.delete(environment.apiUrl + entity + '/' + idEntity + '/' + subEntity + '/' + idSubEntity + '/' + subSubEntity + '/' + idSubSubEntity, this.httpOptions);
}


// ====================== Actualizar entidades ================================


public updateEntity(entity: string, id: number, params: any): any {
  return this.http.put(environment.apiUrl + entity + '/' + id, params, this.httpOptions);
}

public updateSubEntity(entity: string, idEntity: number, subEntity: string, idSubEntity: number, params: any): any {
  return this.http.put(environment.apiUrl + entity + '/' + idEntity + '/' + subEntity + '/' + idSubEntity, params, this.httpOptions);
}

public updateSubSubEntity(entity: string, idEntity: number, subEntity: string, idSubEntity: number, subSubEntity: string, params: any): any {
  return this.http.put(environment.apiUrl + entity + '/' + idEntity + '/' + subEntity + '/' + idSubEntity + '/' + subSubEntity, params, this.httpOptions);
}



//VENDEDOR VEHICULOS
public obtainUserJobList(params: any): any {
  
  return this.http.post(environment.apiUrl + 'obtainUserJobList', params, this.httpOptions);
}

public obtainOtherUserJobList(params: any): any {
  
  return this.http.post(environment.apiUrl + 'obtainOtherUserJobList', params, this.httpOptions);
}

public obtainUserLocations(params: { language_code: string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainUserLocations',params, this.httpOptions);
}

public obtainUserWebLinks(params: { language_code: string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainUserWebLinks',params, this.httpOptions);
}

public obtainOtherUserWebLinks(params: { userId:number,language_code: string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainOtherUserWebLinks',params, this.httpOptions);
}

public obtainOtherUserLocations(params: { userId:number, language_code: string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainOtherUserLocations',params, this.httpOptions);
}

public obtainAllUserLocations(params: { language_code: string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainAllUserLocations',params, this.httpOptions);
}

public obtainAllUserLanguajes(params: { language_code: string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainAllUserLanguajes',params, this.httpOptions);
}

public obtainUserLanguajes(params: { language_code: string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainUserLanguajes',params, this.httpOptions);
}

public obtainOtherUserLanguajes(params: { userId:number, language_code: string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainOtherUserLanguajes',params, this.httpOptions);
}


public obtainUserLabels(params: {language_code:string,userId:number}): any {
  
  return this.http.post(environment.apiUrl + 'obtainUserLabels',params, this.httpOptions);
}

public obtainCreatorUserLabels(params: {userId:number, language_code:string,}): any {
  
  return this.http.post(environment.apiUrl + 'obtainCreatorUserLabels',params, this.httpOptions);
}


public updateLocations(params: any): any {
  
  return this.http.post(environment.apiUrl + 'updateLocations',params, this.httpOptions);
}


public logout(params: any): any {
  
  return this.http.post(environment.apiUrl + 'logout',params, this.httpOptions);
}

public updateLanguajes(params: any): any {
  
  return this.http.post(environment.apiUrl + 'updateLanguajes',params, this.httpOptions);
}






public deleteJob(params: { jobId: number }): any {
  
  return this.http.post(environment.apiUrl + 'deleteJob',params, this.httpOptions);
}

public deletePersonalArchive(params: { multimediaId: number }): any {
  
  return this.http.post(environment.apiUrl + 'deletePersonalArchive',params, this.httpOptions);
}

public obtainPersonalArchiveImage(params: { multimediaId: number }): any {
  
  return this.http.post(environment.apiUrl + 'obtainPersonalArchiveImage',params, this.httpOptions);
}

public createJob(params: any): any {
  
  return this.http.post(environment.apiUrl + 'createJob',params, this.httpOptions);
}

public obtainUserNetworks(params: any): any {
  
  return this.http.post(environment.apiUrl + 'obtainUserNetworks',params, this.httpOptions);
}

public obtainOtherUserNetworks(params: any): any {
  
  return this.http.post(environment.apiUrl + 'obtainOtherUserNetworks',params, this.httpOptions);
}


public updateNetworks(params: any): any {
  
  return this.http.post(environment.apiUrl + 'updateNetworks',params, this.httpOptions);
}


public  deleteUser(params: any){
  return this.http.post(environment.apiUrl + 'deleteUser',params, this.httpOptions);
}

public getUsers(params: any){
  return this.http.post(environment.apiUrl + 'getUsers',params, this.httpOptions);
}

public getUsersPending(params: any){
  return this.http.post(environment.apiUrl + 'getUsersPending',params, this.httpOptions);
}

public getListUsers(params: any){
  return this.http.post(environment.apiUrl + 'getListUsers',params, this.httpOptions);
}

public getCategoryListUsers(params: any){
  return this.http.post(environment.apiUrl + 'getCategoryListUsers',params, this.httpOptions);
}

public getPolicyTextValue(params: any){
  return this.http.post(environment.apiUrl + 'getPolicyTextValue',params, this.httpOptions);
}

public getTerConTextValue(params: any){
  return this.http.post(environment.apiUrl + 'getTerConTextValue',params, this.httpOptions);
}

public getAdvertisements(params: any){
  return this.http.post(environment.apiUrl + 'getAdvertisements',params, this.httpOptions);
}

public  getCategoryCounter(params: {}){
  return this.http.post(environment.apiUrl + 'getCategoryCounter',params, this.httpOptions);
}

public obtainUserCreateProjects(params: any): any {
  
  return this.http.post(environment.apiUrl + 'obtainUserCreateProjects',params, this.httpOptions);
}

public obtainProjectsAddedToUser(params: any): any {
  
  return this.http.post(environment.apiUrl + 'obtainProjectsAddedToUser',params, this.httpOptions);
}

public obtainProjects(params: any): any {
  
  return this.http.post(environment.apiUrl + 'obtainProjects',params, this.httpOptions);
}

public declineUserProject(params: { projectId: number }): any {
  
  return this.http.post(environment.apiUrl + 'declineUserProject',params, this.httpOptions);
}

public acceptProject(params: { projectId: number,keyCode:number }): any {
  
  return this.http.post(environment.apiUrl + 'acceptProject',params, this.httpOptions);
}

public createProject(params: any): any {
  
  return this.http.post(environment.apiUrl + 'createProject',params, this.httpOptions);
}



public deleteProject(params: { id: number }): any {
  
  return this.http.post(environment.apiUrl + 'deleteProject',params, this.httpOptions);
}

public updateProject(params: any): any {
  
  return this.http.post(environment.apiUrl + 'updateProject',params, this.httpOptions);
}

public updateFolder(params: any): any {
  
  return this.http.post(environment.apiUrl + 'updateFolder',params, this.httpOptions);
}

public updateCount(params: any): any {
  
  return this.http.post(environment.apiUrl + 'updateCount',params, this.httpOptions);
}

public updateUserBillingData(params: any): any {
  
  return this.http.post(environment.apiUrl + 'updateUserBillingData',params, this.httpOptions);
}

public obtainParticipants(params: any): any {
  
  return this.http.post(environment.apiUrl + 'obtainParticipants',params, this.httpOptions);
}

public obtainParticipantsOfFollowAndChat(params: any): any {
  
  return this.http.post(environment.apiUrl + 'obtainParticipantsOfFollowAndChat',params, this.httpOptions);
}

public obtainParticipantsOfChat(params: any): any {
  
  return this.http.post(environment.apiUrl + 'obtainParticipantsOfChat',params, this.httpOptions);
}

public obtainUserFollows(params: any): any {
  
  return this.http.post(environment.apiUrl + 'obtainUserFollows',params, this.httpOptions);
}

public obtainUserFollowsFilteredByChat(params: any): any {
  
  return this.http.post(environment.apiUrl + 'obtainUserFollowsFilteredByChat',params, this.httpOptions);
}



public addParticipants(params: any): any {
  
  return this.http.post(environment.apiUrl + 'addParticipants',params, this.httpOptions);
}

public addParticipantsOfFollows(params: any): any {
  
  return this.http.post(environment.apiUrl + 'addParticipantsOfFollows',params, this.httpOptions);
}

public updateParticipants(params: any): any {
  
  return this.http.post(environment.apiUrl + 'updateParticipants',params, this.httpOptions);
}

public obtainProjectParticipants(params: { projectId: number }): any {
  
  return this.http.post(environment.apiUrl + 'obtainProjectParticipants',params, this.httpOptions);
}



public obtainAllProjectParticipants(params: { projectId: number,filter:any,pendingParticipants:boolean }): any {
  
  return this.http.post(environment.apiUrl + 'obtainAllProjectParticipants',params, this.httpOptions);
}


public obtainProjectParticipantToChats(params: { chatId: number,opc:number }): any {
  
  return this.http.post(environment.apiUrl + 'obtainProjectParticipantToChats',params, this.httpOptions);
}

public addPermissionsToParticipants(params: any): any {
  
  return this.http.post(environment.apiUrl + 'addPermissionsToParticipants',params, this.httpOptions);
}

public obtainProjectFolders(params: { projectId: number,foldersIds:any,language_code:string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainProjectFolders',params, this.httpOptions);
}

public obtainProjectFoldersAndFiles(params: { projectId: number,foldersIds:any,multimediasIds:any,language_code:string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainProjectFoldersAndFiles',params, this.httpOptions);
}

public obtainFolderData(params: { folderId: number,multimediasIds:any, language_code:string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainFolderData',params, this.httpOptions);
}

public obtainPersonalArchives(params: { multimediasIds:any, language_code:string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainPersonalArchives',params, this.httpOptions);
}

public obtainPersonalArchivesOtherUser(params: { userId:any,multimediasIds:any, language_code:string }): any {
  
  return this.http.post(environment.apiUrl + 'obtainPersonalArchivesOtherUser',params, this.httpOptions);
}


 //ELIMINAR MEDIA
 public deleteMultimedia(id: number): any {
  return this.http.get(environment.apiUrl + 'deleteMultimedia/'+id, this.httpOptions);
  
}

 public deleteMultimediaArray(params): any {
  return this.http.post(environment.apiUrl + 'deleteMultimediaArray',params, this.httpOptions);
  
}

//multimedia web
public multimediaWeb(params:any): any {
  
  
  return this.http.post(environment.apiUrl + 'multimediaWeb', params, this.httpOptionsFiles);
}

public getMultimediaImageBase64(ruta:any): any {
  
  
  return this.http.post(environment.apiUrl + 'getMultimediaImageBase64', ruta, this.httpOptionsFiles);
}


public createFolder(params: any): any {
  
  return this.http.post(environment.apiUrl + 'createFolder',params, this.httpOptions);
}

public createNewFolder(params: any): any {
  
  return this.http.post(environment.apiUrl + 'createNewFolder',params, this.httpOptions);
}

public createNewFirstLevelFolder(params: any): any {
  
  return this.http.post(environment.apiUrl + 'createNewFirstLevelFolder',params, this.httpOptions);
}

public createNewFolderLink(params: any): any {
  
  return this.http.post(environment.apiUrl + 'createNewFolderLink',params, this.httpOptions);
}

public createNewProjectLink(params: any): any {
  
  return this.http.post(environment.apiUrl + 'createNewProjectLink',params, this.httpOptions);
}


public multimediaWebEdit(params:any): any {
  
  
  return this.http.post(environment.apiUrl + 'multimediaWebEdit', params, this.httpOptionsFiles);
}

public multimediaCroppedEdit(params:any): any {
  
  
  return this.http.post(environment.apiUrl + 'multimediaCroppedEdit', params, this.httpOptionsFiles);
}

public multimediaCroppedEditPD(params:any): any {
  
  
  return this.http.post(environment.apiUrl + 'multimediaCroppedEditPD', params, this.httpOptionsFiles);
}

public obtenerMensajesNuevos(params: any): any {
  //idChat  
    return this.http.post(environment.apiUrl + 'obtenerMensajesNuevos', params, this.httpOptions);
  }

  public obtainOtherUser(params: { userId: number, language_code:string }): any {
  
    return this.http.post(environment.apiUrl + 'obtainOtherUser',params, this.httpOptions);
  }

  public sendRequest(params: { userId: number,message:string, language_code:string }): any {
  
    return this.http.post(environment.apiUrl + 'sendRequest',params, this.httpOptions);
  }

  public sendCreateContactEmail(params: { email:string, motive:string, message:string, name:string,surname:string,surname2:string, language_code:string }): any {
  
    return this.http.post(environment.apiUrl + 'sendCreateContactEmail',params, this.httpOptions);
  }

  public controlRequest(params: { userId: number }): any {
  
    return this.http.post(environment.apiUrl + 'controlRequest',params, this.httpOptions);
  }

  public controlChat(params: { userId: number }): any {
  
    return this.http.post(environment.apiUrl + 'controlChat',params, this.httpOptions);
  }

  public followUnfollow(params: { userId: number,opc:number }): any {
  
    return this.http.post(environment.apiUrl + 'followUnfollow',params, this.httpOptions);
  }

  public obtainUserRequests(params:{ language_code:string }): any {
  
    return this.http.post(environment.apiUrl + 'obtainUserRequests',params, this.httpOptions);
  }

  public deleteUserRequests(params: { id: number }): any {
  
    return this.http.post(environment.apiUrl + 'deleteUserRequests',params, this.httpOptions);
  }

  

  public acceptUserRequests(params: { id: number }): any {
  
    return this.http.post(environment.apiUrl + 'acceptUserRequests',params, this.httpOptions);
  }


  public getNotificationPermissions(params: {}): any {
  
    return this.http.post(environment.apiUrl + 'getNotificationPermissions',params, this.httpOptions);
  }

  public setNotificationPermissions(params: any): any {
  
    return this.http.post(environment.apiUrl + 'setNotificationPermissions',params, this.httpOptions);
  }


  public getComentarios(params: { chatId: number,lastMessageId:any,language_code:string }): any {
  
    return this.http.post(environment.apiUrl + 'getComentarios',params, this.httpOptions);
  }

  public obtainProject(params: { projectId: number,withBase64:boolean, language_code:string }): any {
  
    return this.http.post(environment.apiUrl + 'obtainProject',params, this.httpOptions);
  }


  public getPNComentarios(params: { chatId: number,lastMessageId:any, language_code:string }): any {
  
    return this.http.post(environment.apiUrl + 'getPNComentarios',params, this.httpOptions);
  }

  public obtenerPNMensajesNuevos(params: any): any {
    //idChat  
      return this.http.post(environment.apiUrl + 'obtenerPNMensajesNuevos', params, this.httpOptions);
    }



    public getPnChats(params: { projectId: number, language_code:string }): any {
  
      return this.http.post(environment.apiUrl + 'pnchats',params, this.httpOptions);
    }

    public getPgChats(params: { projectId: number, language_code:string }): any {
  
      return this.http.post(environment.apiUrl + 'pgchats',params, this.httpOptions);
    }

    public getPGComentarios(params: { chatId: number,lastMessageId:any,language_code:string }): any {
  
      return this.http.post(environment.apiUrl + 'getPGComentarios',params, this.httpOptions);
    }
  
    public obtenerPGMensajesNuevos(params: any): any {
      //idChat  
      return this.http.post(environment.apiUrl + 'obtenerPGMensajesNuevos', params, this.httpOptions);
    }


    public createChatGroup(params: any): any {
  
      return this.http.post(environment.apiUrl + 'createChatGroup',params, this.httpOptions);
    }

    public removeUsersOfChat(params: any): any {
  
      return this.http.post(environment.apiUrl + 'removeUsersOfChat',params, this.httpOptions);
    }

    public addUsersToChat(params: any): any {
  
      return this.http.post(environment.apiUrl + 'addUsersToChat',params, this.httpOptions);
    }

    public getFirstsProjectsAndUsersPay(params: {}): any {
  
      return this.http.post(environment.apiUrl + 'getFirstsProjectsAndUsersPay',params, this.httpOptions);
    }

    public getNewUserNoifications(params: {}): any {
  
      return this.http.post(environment.apiUrl + 'getNewUserNoifications',params, this.httpOptions);
    }

    public obtainBannerByCategory(params: { selectedKey: any }): any {
  
      return this.http.post(environment.apiUrl + 'obtainBannerByCategory',params, this.httpOptions);
    }

    public obtainAdvertisedUserByCategory(params: { selectedKey: any }): any {
  
      return this.http.post(environment.apiUrl + 'obtainAdvertisedUserByCategory',params, this.httpOptions);
    }
  


    public obtainAudioMenssage(params: { id: any }): any {
  
      return this.http.post(environment.apiUrl + 'obtainAudioMenssage',params, this.httpOptions);
    }

    public obtainMessage(params: { id: any }): any {
  
      return this.http.post(environment.apiUrl + 'obtainMessage',params, this.httpOptions);
    }

    public obtainPNMessage(params: { id: any }): any {
  
      return this.http.post(environment.apiUrl + 'obtainPNMessage',params, this.httpOptions);
    }

    public obtainPGMessage(params: { id: any }): any {
  
      return this.http.post(environment.apiUrl + 'obtainPGMessage',params, this.httpOptions);
    }

    public ejemploTraduccion(params: { valor: any }): any {
  
      return this.http.post(environment.apiUrl + 'ejemploTraduccion',params, this.httpOptions);
    }

    public obtainUserNotifications(params: any): any {
  
      return this.http.post(environment.apiUrl + 'obtainUserNotifications',params, this.httpOptions);
    }

    public obtainAllUserNotifications(params: any): any {
  
      return this.http.post(environment.apiUrl + 'obtainAllUserNotifications',params, this.httpOptions);
    }

    public translateAllUserNotifications(params: any): any {
  
      return this.http.post(environment.apiUrl + 'translateAllUserNotifications',params, this.httpOptions);
    }

    public obtainPendingNotifications(params: any): any {
  
      return this.http.post(environment.apiUrl + 'obtainPendingNotifications',params, this.httpOptions);
    }

    public changeUserLanguaje(params: { language_code:string }): any {
  
      return this.http.post(environment.apiUrl + 'changeUserLanguaje',params, this.httpOptions);
    }

    public blockUser(params: { userToBlockeId:number }): any {
  
      return this.http.post(environment.apiUrl + 'blockUser',params, this.httpOptions);
    }

    public unlockedUser(params: { userUnlockedId:number }): any {
  
      return this.http.post(environment.apiUrl + 'unlockedUser',params, this.httpOptions);
    }

    public sendUserReport(params: any): any {
  
      return this.http.post(environment.apiUrl + 'sendUserReport',params, this.httpOptions);
    }

    public obtainBlockedUsers(params: { language_code:string }): any {
  
      return this.http.post(environment.apiUrl + 'obtainBlockedUsers',params, this.httpOptions);
    }

    public obtainFrequentlyQuestions(params: { language_code:string }): any {
  
      return this.http.post(environment.apiUrl + 'obtainFrequentlyQuestions',params, this.httpOptions);
    }

    public obtainUserRatings(params: any): any {
  
      return this.http.post(environment.apiUrl + 'obtainUserRatings', params, this.httpOptions);
    }

    public sendRating(params: { message: string, userValoredId:number, ratingValue:any,language_code: string }): any {
  
      return this.http.post(environment.apiUrl + 'sendRating',params, this.httpOptions);
    }

    public registerTimeScreen(params: {screenId:number, screenTime:number}): any {//obtainCreatorUserLabels
  
      return this.http.post(environment.apiUrl + 'registerTimeScreen',params, this.httpOptions);
    }


    public getDataToChangeSuscriptions(params: any): any {
  
      return this.http.post(environment.apiUrl + 'getDataToChangeSuscriptions', params, this.httpOptions);
    }


    public incrementProjectCount(params: {}): any {
  
      return this.http.post(environment.apiUrl + 'incrementProjectCount',params, this.httpOptions);
    }



    public cambioGratis(params: {nuevaSub:number}): any {
  
      return this.http.post(environment.apiUrl + 'cambioGratis', params, this.httpOptions);
    }


    public chatUserStatus(params: any){
      return this.http.post(environment.apiUrl + 'chatUserStatus',params, this.httpOptions);
    }

    public hasProjectPendingMessages(params: any){
      return this.http.post(environment.apiUrl + 'hasProjectPendingMessages',params, this.httpOptions);
    }


    public obtainBanner(){
      return this.http.get(environment.apiUrl + 'obtainBanner', this.httpOptions);
    }


    public deleteChat(param: any): any {
  
      return this.http.post(environment.apiUrl + 'deleteChat', param, this.httpOptions);
    }


    public disableFolderArchives(param: {projectId:any,archivesIds:any,foldersIds:any}): any {
  
      return this.http.post(environment.apiUrl + 'disableFolderArchives',param, this.httpOptions);
    }

    public deleteChatMessage(param: { messageId: any,  }): any {
  
      return this.http.post(environment.apiUrl + 'deleteChatMessage', param, this.httpOptions);
    }

    public deletePNChatMessage(param: { messageId: any,  }): any {
  
      return this.http.post(environment.apiUrl + 'deletePNChatMessage', param, this.httpOptions);
    }

    public deletePGChatMessage(param: { messageId: any,  }): any {
  
      return this.http.post(environment.apiUrl + 'deletePGChatMessage', param, this.httpOptions);
    }


    public obtainFoldersPermissions(params: any): any {
  
      return this.http.post(environment.apiUrl + 'obtainFoldersPermissions',params, this.httpOptions);
    }

    public updateFolderParticipantPermission(param: {folderId:any,userId:any,permission:any}): any {
  
      return this.http.post(environment.apiUrl + 'updateFolderParticipantPermission',param, this.httpOptions);
    }

    public obtainParticipantList(param: {projectId:any}): any {
  
      return this.http.post(environment.apiUrl + 'obtainParticipantList',param, this.httpOptions);
    }

    public createNewPnChat(param: {projectId:any,userToCreateId:any}): any {
  
      return this.http.post(environment.apiUrl + 'createNewPnChat',param, this.httpOptions);
    }


    public obtainUserSub(){
      return this.http.get(environment.apiUrl + 'obtainUserSub', this.httpOptions);
    }

    


    public deleteNotification(param: { notificationId: any }): any {
  
      return this.http.post(environment.apiUrl + 'deleteNotification', param, this.httpOptions);
    }

    public markNotificationRead(param: { notificationId: any }): any {
  
      return this.http.post(environment.apiUrl + 'markNotificationRead', param, this.httpOptions);
    }

    public markAllNotificationRead(param:{}): any{
      return this.http.post(environment.apiUrl + 'markAllNotificationRead', param, this.httpOptions);

    }



    public deleteFolder(param: {folderId:any}): any {
  
      return this.http.post(environment.apiUrl + 'deleteFolder',param, this.httpOptions);
    }

    public deletePGChat(param: {id:any}): any {
  
      return this.http.post(environment.apiUrl + 'deletePGChat',param, this.httpOptions);
    }


    public deletePNChat(param: {id:any}): any {
  
      return this.http.post(environment.apiUrl + 'deletePNChat',param, this.httpOptions);
    }


    public multimediaWebPersonalArchive(params:any): any {
      return this.http.post(environment.apiUrl + 'multimediaWebPersonalArchive', params, this.httpOptionsFiles);
    }


    public createFolderContentImage(params: any): any {
      return this.http.post(environment.apiUrl + 'createFolderContentImage',params, this.httpOptions);
    }

    public updatePGChatImage(params: any): any {
      return this.http.post(environment.apiUrl + 'updatePGChatImage',params, this.httpOptions);
    }

    public obtainUserBillings(){
      return this.http.get(environment.apiUrl + 'obtainUserBillings', this.httpOptions);
    }

    public getSubscriptionInfo(){
      return this.http.get(environment.apiUrl + 'getSubscriptionInfo/300', this.httpOptions);
    }

    public generatePDF(){
      return this.http.get(environment.apiUrl + 'generatePDF/263/2', this.httpOptions);
    }




}
