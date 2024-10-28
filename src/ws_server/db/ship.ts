import { ShipPosition } from "../../models/models";

export class Ship {
    position: ShipPosition;
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";

    constructor(position: ShipPosition, direction: boolean, length: number, type: "small" | "medium" | "large" | "huge") {
        this.position = position;
        this.direction = direction;
        this.length = length;
        this.type = type;
    }
}

export class PlayerShips {
    playerId: number | string;
    ships: Ship[];

    constructor(playerId: number | string) {
        this.playerId = playerId;
        this.ships = [];
    }
}