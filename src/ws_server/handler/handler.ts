import { WsMessage, RegistrationOutputResponse, MessageType, WsResponse, ShipData } from "../../models/models";
import WebSocket from "ws";
import { playerDatabase } from "../db/player";
import { roomDatabase, updateRoom } from "../db/room";
import { clients } from "../..";
import { updateWinners } from "../db/player";
import { Ship } from "../db/ship";

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
        case MessageType.AddShips:
            handleAddShips(ws, msg);
            break;
        default:
            console.warn("Unknown command: ", msg.type);
    }
}

function handleRegistration(ws: WebSocket, msg: WsMessage) {
    let regData = JSON.parse(msg.data);
    let result;
    if (playerDatabase.validatePlayer(regData.name, regData.password, ws)) {
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
            room.setGameId(gameData.idGame);
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

function handleAddShips(ws: WebSocket, msg: WsMessage) {
    const { gameId, ships, indexPlayer } = JSON.parse(msg.data);
    const currentPlayer = playerDatabase.getPlayer(ws as WebSocket);

    const room = roomDatabase.rooms.find(r => r.gameId === gameId);

    if (room && currentPlayer) {
        room.addShipsForPlayer(currentPlayer.index, ships.map((shipData: ShipData) => new Ship(shipData.position, shipData.direction, shipData.length, shipData.type)));

        const otherPlayer = room.players.find(player => player.index !== currentPlayer.index);
        const playerShips = room.playerShips.get(currentPlayer.index);
        
        if (playerShips && otherPlayer && room.playerShips.has(otherPlayer.index)) {
            const ships = playerShips.ships;
            const otherPlayerShips = room.playerShips.get(otherPlayer.index);
            if (otherPlayerShips) {
                const gameData = {
                    ships: ships,
                    currentPlayerIndex: currentPlayer.index,
                };
                let response: WsMessage = new WsResponse(MessageType.StartGame, JSON.stringify(gameData));
                room.players.forEach(player => {
                    const playerWs = Array.from(clients).find(client => player.name === playerDatabase.getPlayer(client)?.name);
                    if (playerWs && playerWs.readyState === WebSocket.OPEN) {
                        playerWs.send(JSON.stringify(response));
                    }
                });
            }
        }
    }
}