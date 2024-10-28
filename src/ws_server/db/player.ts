import { clients } from "../..";
import { WebSocket } from 'ws';
import { WsMessage, MessageType, WsResponse } from "../../models/models";

export class Player {
    index: string | number;
    name: string;
    password: string;
    wins: number;
    socket: WebSocket;

    constructor(name: string, password: string, index: number, socket: WebSocket) {
        this.index = index;
        this.name = name;
        this.password = password;
        this.wins = 0;
        this.socket = socket;
    }
}

export class PlayerDatabase {
    players: Player[] = [];

    validatePlayer(name: string, password: string, socket: WebSocket): boolean {
        const existingPlayer = this.players.find(player => player.name === name);
        if (!existingPlayer) {
            this.players.push(new Player(name, password, this.players.length, socket));
            return true;
        }
        if (existingPlayer.password === password) {
            if (existingPlayer.socket.readyState === WebSocket.OPEN) {
                existingPlayer.socket.close();
            }
            existingPlayer.socket = socket;
            return true;
        }
        
        return false;
    }

    getPlayer(socket: WebSocket): Player | undefined {
        return this.players.find(player => player.socket === socket);
    }
}

export function updateWinners() {
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

export const playerDatabase = new PlayerDatabase();