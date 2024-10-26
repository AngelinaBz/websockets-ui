import { WsMessage, RegistrationResponse, RegistrationOutputResponse, MessageType } from "../../models/models";
import WebSocket from "ws";
import { PlayerDatabase } from "../db";

export function handleMessage(ws: WebSocket, msg: WsMessage) {
    switch (msg.type) {
        case MessageType.Registration:
            handleRegistration(ws, msg);
            break;
        default:
            console.warn("Unknown message type: ", msg.type);
    }
}

const playerDatabase = new PlayerDatabase();

export function handleRegistration(ws: WebSocket, msg: WsMessage) {
    let regData = JSON.parse(msg.data);
    let result;
    if (playerDatabase.validatePlayer(regData.name, regData.password)) {
        result = new RegistrationOutputResponse(regData.name, regData.index);
    } else {
        result = new RegistrationOutputResponse(regData.name, regData.index, "Incorrect password");
    }
    let response: WsMessage = new RegistrationResponse(JSON.stringify(result));
    ws.send(JSON.stringify(response));
}