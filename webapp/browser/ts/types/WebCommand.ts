export interface WebCommand{
    type: "serv" | "priv" | "broad" | "servFile" | "servFileStream";
    content?:string;
    from?:string;
    to?:string
}