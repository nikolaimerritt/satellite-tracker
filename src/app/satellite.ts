import { GeographicCoords } from './geographic-coords';

export class Satellite {
    public constructor(
        public readonly name: string,
        public readonly id: number,
        private readonly trajectory: Trajectory,
    ) {}

    public coordsAt(time: Date): GeographicCoords | undefined {
        return undefined;
    }

    public closestFlyby(
        observer: GeographicCoords,
        from: Date,
        to: Date,
    ): Flyby | undefined {
        return undefined;
    }
}

export interface Trajectory {
    line1: string;
    line2: string;
}

export interface Flyby {
    location: GeographicCoords;
    time: Date;
}
