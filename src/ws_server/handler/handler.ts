import { WsMessage, RegistrationResponse, RegistrationOutputResponse, MessageType } from "../../models/models";
import WebSocket from "ws";

export function handleMessage(ws: WebSocket, msg: WsMessage) {
    switch (msg.type) {
        case MessageType.Registration:
            handleRegistration(ws, msg);
            break;
        default:
            console.warn("Unknown message type: ", msg.type);
    }
}

export function handleRegistration(ws: WebSocket, msg: WsMessage) {
    let regData = JSON.parse(msg.data);
    let result = new RegistrationOutputResponse(regData.name, regData.index);
    let response: WsMessage = new RegistrationResponse(JSON.stringify(result));
    ws.send(JSON.stringify(response));
}