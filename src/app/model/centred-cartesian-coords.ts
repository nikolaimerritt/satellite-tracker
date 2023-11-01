import { geodeticToEcf } from "satellite.js";
import { GeographicCoords } from "./geographic-coords";

export type Unit = 'Kilometers' | 'Normalised'

export class CentredCartesianCoords {
    public constructor(public readonly x: number, public readonly y: number, public readonly z: number, public readonly unit: Unit = 'Kilometers') {}
    private static readonly radiusOfEarthKm = 6_378.1;

    public squaredMagnitude(): number {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2);
    }

    public squaredDistance(other: CentredCartesianCoords): number {
        return new CentredCartesianCoords(this.x - other.x, this.y - other.y, this.z - other.z).squaredMagnitude();
    }

    public normalised(): CentredCartesianCoords {
        if (this.unit === 'Normalised') return { ...this };
        const magnitude = Math.sqrt(this.squaredMagnitude());
        return new CentredCartesianCoords(this.x / magnitude, this.y / magnitude, this.z / magnitude);
    }
}