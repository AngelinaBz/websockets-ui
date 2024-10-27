import { WsMessage, RegistrationOutputResponse, MessageType, WsResponse } from "../../models/models";
import WebSocket from "ws";
import { playerDatabase, Player } from "../player/player";
import { roomDatabase } from "../room/room";
import { clients } from "../..";

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
        updateWinners();
        updateRoom();
    } else {
        result = new RegistrationOutputResponse(regData.name, regData.index, "Incorrect password");
    }
    let response: WsMessage = new WsResponse(MessageType.Registration, JSON.stringify(result));
    ws.send(JSON.stringify(response));
    console.log(response);
}

function updateWinners() {
    const winnersData = playerDatabase.players.map(player => ({
        name: player.name,
        wins: player.wins,
    }));

    let response: WsMessage = new WsResponse(MessageType.UpdateWinners, JSON.stringify(winnersData.sort((a, b) => b.wins - a.wins)));
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(response));
        }
    });
}

function updateRoom() {
    const rooms = roomDatabase.updateRoomState();
    const response: WsMessage = new WsResponse(MessageType.UpdateRoom, JSON.stringify(rooms));
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(response));
        }
    });
}