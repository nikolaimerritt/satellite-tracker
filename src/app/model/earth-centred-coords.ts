import { ecfToEci, eciToGeodetic, geodeticToEcf } from 'satellite.js';

export interface MercatorProjection {
    x: number;
    y: number;
}

export interface SphericalCoords {
    latitude: number;
    longitude: number;
}

export class EarthCentredCoords {
    public constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly z: number,
    ) {}
    private static readonly radiusOfEarthKm = 6_378.1;

    public static fromMercatorProjection(
        mercator: MercatorProjection,
    ): EarthCentredCoords {
        const longitude = 2 * Math.PI * mercator.x - Math.PI;
        const mercatorFactor = (0.5 - mercator.y) * 2 * Math.PI;
        const latitude =
            2 * (Math.atan(Math.exp(mercatorFactor)) - Math.PI / 4);
        const geodetic = {
            latitude,
            longitude,
            height: EarthCentredCoords.radiusOfEarthKm,
        };
        const ecf = geodeticToEcf(geodetic);
        return new EarthCentredCoords(ecf.x, ecf.y, ecf.z);
    }

    public toMercatorProjection(): MercatorProjection {
        const geodetic = eciToGeodetic(ecfToEci(this, 0), 0);
        const x = (geodetic.longitude + Math.PI) / (2 * Math.PI);
        const mercatorFactor = Math.log(
            Math.tan(Math.PI / 4 + geodetic.latitude / 2),
        );
        const y = 0.5 - mercatorFactor / (2 * Math.PI);
        return { x, y };
    }

    public toSpherical(): SphericalCoords {
        const geodetic = eciToGeodetic(ecfToEci(this, 0), 0);
        return {
            latitude: (geodetic.latitude * 180) / Math.PI,
            longitude: (geodetic.longitude * 180) / Math.PI,
        };
    }

    public squaredMagnitude(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    public squaredDistance(other: EarthCentredCoords): number {
        return new EarthCentredCoords(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z,
        ).squaredMagnitude();
    }

    public normalised(): EarthCentredCoords {
        const magnitude = Math.sqrt(this.squaredMagnitude());
        return new EarthCentredCoords(
            this.x / magnitude,
            this.y / magnitude,
            this.z / magnitude,
        );
    }
}
