import { WsMessage, RegistrationOutputResponse, MessageType, WsResponse } from "../../models/models";
import WebSocket from "ws";
import { playerDatabase } from "../player/player";
import { roomDatabase, updateRoom } from "../room/room";
import { clients } from "../..";
import { updateWinners } from "../player/player";

export function handleMessage(ws: WebSocket, msg: WsMessage) {
    switch (msg.type) {
        case MessageType.Registration:
            handleRegistration(ws, msg);
            break;
        case MessageType.CreateRoom:
            handleCreateRoom(ws);
            break;
        case MessageType.AddUserToRoom:
            handleAddUserToRoom(ws, msg);
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

function handleCreateRoom(ws: WebSocket) {
    const currentPlayer = playerDatabase.getPlayer(ws as WebSocket);
    
    if (currentPlayer) {
        const newRoom = roomDatabase.createRoom();
        roomDatabase.addUserToRoom(newRoom.roomId, currentPlayer);

        updateRoom();
    }
}

function handleAddUserToRoom(ws: WebSocket, msg: WsMessage) {
    const data = JSON.parse(msg.data);
    const roomId = data.indexRoom;
    const currentPlayer = playerDatabase.getPlayer(ws as WebSocket);

    const room = roomDatabase.rooms.find(r => r.roomId === roomId);

    if (room && currentPlayer && !room.players.some(p => p.name === currentPlayer.name) && roomDatabase.addUserToRoom(roomId, currentPlayer)) {
        updateRoom();

        if (room.players.length === 2) {
            const gameData = {
                idGame: Math.random(),
                idPlayer: currentPlayer.index
            };
            let response: WsMessage = new WsResponse(MessageType.CreateGame, JSON.stringify((gameData)));

            room.players.forEach(player => {
                const playerWs = Array.from(clients).find(client => player.name === playerDatabase.getPlayer(client)?.name);
                if (playerWs && playerWs.readyState === WebSocket.OPEN) {
                    playerWs.send(JSON.stringify(response));
                }
            });
        }
    }
}