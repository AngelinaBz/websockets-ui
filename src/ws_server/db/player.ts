import { clients } from "../..";
import { WebSocket } from 'ws';
import { WsMessage, MessageType, WsResponse } from "../../models/models";

export class Player {
    index: string | number;
    name: string;
    password: string;
    wins: number;

    constructor(name: string, password: string, index: number) {
        this.index = index;
        this.name = name;
        this.password = password;
        this.wins = 0;
    }
}

export class PlayerDatabase {
    players: Player[] = [];

    validatePlayer(name: string, password: string): boolean {
        const existingPlayer = this.players.find(player => player.name === name);
        if (!existingPlayer) {
            this.players.push(new Player(name, password, this.players.length));
            return true;
        }
        return existingPlayer.password === password;
    }

    getPlayer(socket: WebSocket): Player | undefined {
        const playerIndex = Array.from(clients).findIndex(client => client === socket);
        return playerIndex !== -1 ? this.players[playerIndex] : undefined;
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