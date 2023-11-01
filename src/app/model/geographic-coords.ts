import { geodeticToEcf } from 'satellite.js';
import { CentredCartesianCoords } from './centred-cartesian-coords';

export class GeographicCoords {
    public constructor(
        public readonly latitude: number,
        public readonly longitude: number,
        public readonly height: number = GeographicCoords.radiusOfEarthKm,
        public angleUnit: Unit = 'Degrees',
    ) {}

    private static readonly degreesToRadiansFactor = Math.PI / 180;
    private static readonly radiusOfEarthKm = 6_378.1;

    public distanceKm(other: GeographicCoords): number {
        const thisRads = this.toRadians();
        const otherRads = other.toRadians();

        const sineSquareLatitudeDifference = Math.pow(
            Math.sin((thisRads.latitude - otherRads.latitude) / 2),
            2,
        );
        const sineSquareLongitudeDifference = Math.pow(
            Math.sin((thisRads.longitude - otherRads.longitude) / 2),
            2,
        );

        return (
            2 *
            GeographicCoords.radiusOfEarthKm *
            Math.asin(
                Math.sqrt(
                    sineSquareLatitudeDifference +
                        Math.cos(thisRads.latitude) *
                            Math.cos(otherRads.latitude) *
                            sineSquareLongitudeDifference,
                ),
            )
        );
    }

    public toDegrees(): GeographicCoords {
        if (this.angleUnit === 'Degrees') return this;
        return new GeographicCoords(
            this.latitude / GeographicCoords.degreesToRadiansFactor,
            this.longitude / GeographicCoords.degreesToRadiansFactor,
            this.height,
            'Degrees',
        );
    }

    public toRadians(): GeographicCoords {
        if (this.angleUnit === 'Radians') return this;
        return new GeographicCoords(
            this.latitude * GeographicCoords.degreesToRadiansFactor,
            this.longitude * GeographicCoords.degreesToRadiansFactor,
            this.height,
            'Radians',
        );
    }

    public toCentredCartesian(): CentredCartesianCoords {
        const centred = geodeticToEcf(this);
        return new CentredCartesianCoords(centred.x, centred.y, centred.z);
    }
}

export type Unit = 'Degrees' | 'Radians';
