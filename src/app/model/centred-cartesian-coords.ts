import { ecfToEci, eciToGeodetic, geodeticToEcf, gstime } from 'satellite.js';
import { GeographicCoords } from './geographic-coords';

export type Unit = 'Kilometers' | 'Normalised';

export interface MercatorCoordinates {
	x: number,
	y: number,
}

export class CentredCartesianCoords {
    public constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly z: number,
    ) {}
    private static readonly radiusOfEarthKm = 6_378.1;

	public static fromMercatorProjection(mercator: MercatorCoordinates) {
        const longitude = 2 * Math.PI * mercator.x - Math.PI;
        const mercatorFactor = (0.5 - mercator.y) * 2 * Math.PI;
        const latitude =
            2 * (Math.atan(Math.exp(mercatorFactor)) - Math.PI / 4);
		const geodetic = { latitude, longitude, height: CentredCartesianCoords.radiusOfEarthKm };
		const ecf = geodeticToEcf(geodetic);
		return new CentredCartesianCoords(ecf.x, ecf.y, ecf.z);
	}

    public squaredMagnitude(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    public squaredDistance(other: CentredCartesianCoords): number {
        return new CentredCartesianCoords(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z,
        ).squaredMagnitude();
    }

    public normalised(): CentredCartesianCoords {
        const magnitude = Math.sqrt(this.squaredMagnitude());
        return new CentredCartesianCoords(
            this.x / magnitude,
            this.y / magnitude,
            this.z / magnitude,
        );
    }

	public mercatorProjection(): MercatorCoordinates {
		const gmstTime = 0;
		const geodetic = eciToGeodetic(ecfToEci(this, gmstTime), gmstTime);
		const x = (geodetic.longitude + Math.PI) / (2 * Math.PI);
		const mercatorFactor = Math.log(Math.tan(Math.PI / 4 + geodetic.latitude / 2));
		const y = 0.5 - mercatorFactor / (2 * Math.PI);
		return { x, y };
	}
}
