export interface ServRes{
    type:string;

}
export interface Register extends ServRes{
    type:"welcome";
    id:string
}
export interface Message extends ServRes{
    type:"message";
    res:string;
}
export interface FilePrep extends ServRes{
    type:"filemeta";
    mime:string
}
export interface EndFile extends ServRes{
    type:"endfile";
}