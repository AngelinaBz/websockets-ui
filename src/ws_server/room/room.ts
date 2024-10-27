import { Player } from "../player/player";

interface RoomData {
    roomId: number;
    roomUsers: { name: string; index: number | string; }[];
}

export class Room {
    roomId: number;
    players: Player[] = [];

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

export const roomDatabase = new RoomDatabase();