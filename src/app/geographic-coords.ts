export class GeographicCoords {
    public constructor(
        public readonly latitude: number,
        public readonly longitude: number,
        public unit: Unit = 'Degrees',
    ) {}

    private readonly degreesToRadiansFactor = Math.PI / 180;
    private readonly radiusOfEarthKm = 6_378.1;

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
            this.radiusOfEarthKm *
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
        if (this.unit === 'Degrees') return this;
        return new GeographicCoords(
            this.latitude / this.degreesToRadiansFactor,
            this.longitude / this.degreesToRadiansFactor,
            'Degrees',
        );
    }

    public toRadians(): GeographicCoords {
        if (this.unit === 'Radians') return this;
        return new GeographicCoords(
            this.latitude * this.degreesToRadiansFactor,
            this.longitude * this.degreesToRadiansFactor,
            'Radians',
        );
    }
}

export type Unit = 'Degrees' | 'Radians';
