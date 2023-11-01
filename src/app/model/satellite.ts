import {
    propagate,
    twoline2satrec,
    eciToGeodetic,
    gstime,
    degreesLat,
    degreesLong,
    eciToEcf,
} from 'satellite.js';
import { GeographicCoords } from './geographic-coords';
import { CentredCartesianCoords } from './centred-cartesian-coords';

export class Trajectory {
    public constructor(
        public readonly start: Date,
        public readonly twoLineElement: TwoLineElement,
    ) {}

    public isInRange(time: Date): boolean {
        return (
            this.start <= time &&
            time <= new Date(this.start.getTime() + TwoLineElement.accuracyMs)
        );
    }
}

export class TwoLineElement {
    public constructor(
        public line1: string,
        public line2: string,
    ) {}

    public static readonly accuracyMs = 172_800_000;
}

export interface Observation {
    coords: GeographicCoords;
    time: Date;
}

export class Satellite {
    public constructor(
        public readonly name: string,
        public readonly id: number,
        private readonly trajectory: Trajectory,
    ) {}

    public coordsAt(time: Date): GeographicCoords | undefined {
        if (!this.trajectory.isInRange(time)) return undefined;

        const eciCoords = propagate(
            twoline2satrec(
                this.trajectory.twoLineElement.line1,
                this.trajectory.twoLineElement.line2,
            ),
            time,
        );
        if (typeof eciCoords.position === 'boolean') return undefined;
        const geodeticCoords = eciToGeodetic(eciCoords.position, gstime(time));
        return new GeographicCoords(
            degreesLat(geodeticCoords.latitude),
            degreesLong(geodeticCoords.longitude),
            geodeticCoords.height,
        );
    }

    private cartesianCoordsAt(time: Date): CentredCartesianCoords | undefined {
        if (!this.trajectory.isInRange(time)) return undefined;

        const eciCoords = propagate(
            twoline2satrec(
                this.trajectory.twoLineElement.line1,
                this.trajectory.twoLineElement.line2,
            ),
            time,
        );
        if (typeof eciCoords.position === 'boolean') return undefined;
        const coords = eciToEcf(eciCoords.position, gstime(time));
        return new CentredCartesianCoords(coords.x, coords.y, coords.z);
    }

    public closestObservation(
        observer: GeographicCoords,
    ): Observation | undefined {
        const normalisedObserver = observer.toCentredCartesian().normalised();
        const startTime = this.trajectory.start.getTime();
        const endTime = startTime + 2 * 24 * 60 * 60_000;
        const distFromObserver = (timestamp: number) =>
            this.cartesianCoordsAt(new Date(timestamp))
                ?.normalised()
                ?.squaredDistance(normalisedObserver) ?? NaN;

        const closestTime = new Date(
            Satellite.minimiseFn(distFromObserver, startTime, endTime, [1000, 100]),
        );
        const closestCoords = this.coordsAt(closestTime);
        if (closestCoords === undefined) return undefined;
        return {
            coords: closestCoords,
            time: closestTime,
        };
    }

    private static minimiseFn(
        fn: (x: number) => number,
        xStart: number,
        xEnd: number,
        sampleSchedules: number[],
    ): number {
        if (sampleSchedules.length === 0) return (xStart + xEnd) / 2;

        let lowestF = fn(xStart);
        let lowestX = xStart;

        const deltaX = (xEnd - xStart) / sampleSchedules[0];
        const sampleWindow = [...Array(4).keys()].map((i) =>
            fn(xStart + i * deltaX),
        );
        for (let i = 0; i + 4 <= sampleSchedules[0]; i++) {
            const diffBeforeMin = sampleWindow[2] - sampleWindow[0];
            const diffAfterMin = sampleWindow[3] - sampleWindow[1];
            if (diffBeforeMin <= 0 && diffAfterMin >= 0) {
                const xInflection = Satellite.minimiseFn(fn, xStart + (i + 1) * deltaX, xStart + (i + 2) * deltaX, sampleSchedules.slice(1,))
                const inflectionPoint = fn(xInflection);
                if (inflectionPoint < lowestF) {
                    lowestF = inflectionPoint;
                    lowestX = xInflection;
                }
            }
            sampleWindow.shift();
            sampleWindow.push(fn(xStart + (i + 4) * deltaX));
        }
        return lowestX;
    }
}
