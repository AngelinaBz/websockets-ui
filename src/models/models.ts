export enum MessageType {
    Registration = "reg",
    UpdateWinners = "update_winners",
    CreateRoom = "create_room",
    AddUserToRoom = "add_user_to_room",
    CreateGame = "create_game",
    UpdateRoom = "update_room",
    AddShips = "add_ships",
    StartGame = "start_game",
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

export interface RoomData {
    roomId: number;
    roomUsers: { name: string; index: number | string; }[];
}

export interface ShipPosition {
    x: number;
    y: number;
}

export interface ShipData {
    position: ShipPosition;
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";
}

export class WsResponse implements WsMessage {
    type: string;
    data: string;
    id: number;
    constructor(type: string, data: string){
        this.type = type;
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