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
}