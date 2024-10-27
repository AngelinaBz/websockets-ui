import { WsMessage, RegistrationOutputResponse, MessageType, WsResponse } from "../../models/models";
import WebSocket from "ws";
import { PlayerDatabase } from "../db";
import { wsServer } from "../..";

const playerDatabase = new PlayerDatabase();

export function handleMessage(ws: WebSocket, msg: WsMessage) {
    switch (msg.type) {
        case MessageType.Registration:
            handleRegistration(ws, msg);
            break;
        default:
            console.warn("Unknown message type: ", msg.type);
    }
}

function handleRegistration(ws: WebSocket, msg: WsMessage) {
    let regData = JSON.parse(msg.data);
    let result;
    if (playerDatabase.validatePlayer(regData.name, regData.password)) {
        result = new RegistrationOutputResponse(regData.name, regData.index);
        updateWinners(ws);
    } else {
        result = new RegistrationOutputResponse(regData.name, regData.index, "Incorrect password");
    }
    let response: WsMessage = new WsResponse(MessageType.Registration, JSON.stringify(result));
    ws.send(JSON.stringify(response));
    console.log(response);
}

function updateWinners(ws: WebSocket) {
    const winnersData = playerDatabase.players.map(player => ({
        name: player.name,
        wins: player.wins,
    }));

    let response: WsMessage = new WsResponse(MessageType.UpdateWinners, JSON.stringify(winnersData.sort((a, b) => b.wins - a.wins)));
    ws.send(JSON.stringify(response));
}