/* Datos del objeto Mensaje */

export interface Mensaje{
    id?: number,
    texto?: string,
    created_at:any,
    user_name?:string,
    chat_id?:number,
    imagen?:string,
    avatar?:string,
    image?:string,
    urlImagen?:string,
    urlarchive?:string,
    archive?:any,
    pdfbase64?:any,
    pdfData?:any,
    audiodata?:any,
    urlarchiveaudio?:any,
    audiobase64?:any,
    response?:any,
    pdfdata?:any,
    visto?:boolean,
    language_code?:string,
    idDevice?:string,
    user_id?:any,
    selectedFile?:any

}