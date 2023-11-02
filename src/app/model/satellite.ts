import { propagate, twoline2satrec, gstime, eciToEcf } from 'satellite.js';
import { EarthCentredCoords as EarthCentredCoords } from './earth-centred-coords';

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

export interface Flyby {
    satellite: Satellite;
    coords: EarthCentredCoords;
    time: Date;
}

export class Satellite {
    public constructor(
        public readonly name: string,
        public readonly id: number,
        private readonly trajectory: Trajectory,
    ) {}

    public coordsAt(time: Date): EarthCentredCoords | undefined {
        const eciCoords = propagate(
            twoline2satrec(
                this.trajectory.twoLineElement.line1,
                this.trajectory.twoLineElement.line2,
            ),
            time,
        );
        if (typeof eciCoords.position === 'boolean') return undefined;
        const coords = eciToEcf(eciCoords.position, gstime(time));
        return new EarthCentredCoords(coords.x, coords.y, coords.z);
    }

    public closestFlyby(observer: EarthCentredCoords): Flyby | undefined {
        const normalisedObserver = observer.normalised();
        const startTime = this.trajectory.start.getTime();
        const endTime = startTime + TwoLineElement.accuracyMs;
        const distFromObserver = (timestamp: number) =>
            this.coordsAt(new Date(timestamp))
                ?.normalised()
                ?.squaredDistance(normalisedObserver) ?? NaN;

        const samples = [1000, 100];
        const closestTime = new Date(
            Satellite.minimiseFn(distFromObserver, startTime, endTime, samples),
        );
        const closestCoords = this.coordsAt(closestTime);
        if (closestCoords === undefined) return undefined;
        return {
            satellite: this,
            coords: closestCoords,
            time: closestTime,
        };
    }

    private static minimiseFn(
        fn: (x: number) => number,
        xStart: number,
        xEnd: number,
        samples: number[],
    ): number {
        if (samples.length === 0) return (xStart + xEnd) / 2;

        let minimumF = fn(xStart);
        let minimumX = xStart;

        const deltaX = (xEnd - xStart) / samples[0];
        const sampleWindow = [...Array(4).keys()].map((i) =>
            fn(xStart + i * deltaX),
        );
        for (let i = 0; i + 4 <= samples[0]; i++) {
            const diffBeforeMin = sampleWindow[2] - sampleWindow[0];
            const diffAfterMin = sampleWindow[3] - sampleWindow[1];
            if (diffBeforeMin <= 0 && diffAfterMin >= 0) {
                const inflectionX = Satellite.minimiseFn(
                    fn,
                    xStart + (i + 1) * deltaX,
                    xStart + (i + 2) * deltaX,
                    samples.slice(1),
                );
                const inflectionF = fn(inflectionX);
                if (inflectionF < minimumF) {
                    minimumF = inflectionF;
                    minimumX = inflectionX;
                }
            }
            sampleWindow.shift();
            sampleWindow.push(fn(xStart + (i + 4) * deltaX));
        }
        return minimumX;
    }
}
