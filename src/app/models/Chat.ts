
/* Datos del objeto Chat */

export interface Chat{
    id?: number,
    nombre?: any,
    urlImagen:string,
    descripcion:string,
    ultimo_mensaje:any,
    mensajes_nuevos:number,
    otherUser?:any,
    avatar:any,
    lastMensajeId?:any,
}