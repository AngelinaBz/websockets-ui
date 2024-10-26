export enum MessageType {
    Registration = "reg",
}

export interface RegistrationData {
    name: string;
    password: string;
}

export interface WsMessage {
    type: string;
    data: string;
    id: number;
}

export interface RegistrationOutputMessage {
    name: string;
    index: number | string;
    error: boolean;
    errorText: string;
}

export class RegistrationResponse implements WsMessage {
    type: string;
    data: string;
    id: number;
    constructor(data: string){
        this.type = MessageType.Registration;
        this.data = data;
        this.id = 0;
    }
}

export class RegistrationOutputResponse implements RegistrationOutputMessage {
    name: string;
    index: number | string;
    error: boolean;
    errorText: string;
    constructor(name: string, index: number, errorText?: string){
        this.name = name;
        this.index = index;
        this.error = Boolean(errorText);
        this.errorText = errorText || '';
    }
}