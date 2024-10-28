import { Player } from "./player";
import { WsMessage, MessageType, WsResponse, RoomData } from "../../models/models";
import WebSocket from "ws";
import { clients } from "../..";
import { PlayerShips, Ship } from "./ship";

export class Room {
    roomId: number;
    players: Player[] = [];
    playerShips: Map<number | string, PlayerShips> = new Map();
    gameId?: number | string;

    constructor(roomId: number) {
        this.roomId = roomId;
    }

    addPlayer(player: Player): boolean {
        if (this.players.length < 2) {
            this.players.push(player);
            return true;
        }
        return false;
    }

    setGameId(gameId: number | string) {
        this.gameId = gameId;
    }

    addShipsForPlayer(playerId: number | string, ships: Ship[]): void {
        let playerShips = this.playerShips.get(playerId);
        if (!playerShips) {
            playerShips = new PlayerShips(playerId);
            this.playerShips.set(playerId, playerShips);
        }

        ships.forEach(ship => {
            playerShips.ships.push(ship);
        });
    }
}

export class RoomDatabase {
    rooms: Room[] = [];
    private static roomCounter = 0;

    createRoom(): Room {
        const roomId = RoomDatabase.roomCounter++;
        const room = new Room(roomId);
        this.rooms.push(room);
        return room;
    }

    addUserToRoom(roomId: number, player: Player): boolean {
        const room = this.rooms.find(r => r.roomId === roomId);
        return room ? room.addPlayer(player) : false;
    }

    getPlayerShips(roomId: number, playerId: number | string): PlayerShips | undefined {
        const room = this.rooms.find(r => r.roomId === roomId);
        return room ? room.playerShips.get(playerId) : undefined;
    }

    updateRoomState(): RoomData[] {
        return this.rooms
        .filter(room => room.players.length < 2) 
        .map(room => ({
            roomId: room.roomId,
            roomUsers: room.players.map(player => ({
                name: player.name,
                index: player.index
            }))
        }));
    }
}

export function updateRoom() {
    const rooms = roomDatabase.updateRoomState();
    const response: WsMessage = new WsResponse(MessageType.UpdateRoom, JSON.stringify(rooms));
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(response));
        }
    });
}

export const roomDatabase = new RoomDatabase();