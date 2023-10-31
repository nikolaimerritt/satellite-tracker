import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeographicCoords } from './utils/geographic-coords';
import { Observable, map, forkJoin, mergeMap, EMPTY, of, filter } from 'rxjs';
import {
    twoline2satrec,
    eciToGeodetic,
    propagate,
    gstime,
    degreesLong,
    degreesLat,
    EciVec3,
    eciToEcf,
    EcfVec3,
} from 'satellite.js';
import { ConfigService } from './config.service';
import { subtract, multiply, dot, add } from 'mathjs';

export interface Satellite {
    name: string;
    id: number;
    path: (time: Date) => GeographicCoords | undefined;
}

export interface SatelliteObservation {
    name: string;
    coords: GeographicCoords;
    time: Date;
}

interface Trajectory {
    line1: string;
    line2: string;
}

@Injectable({
    providedIn: 'root',
})
export class SatelliteFetcherService {
    constructor(
        private httpClient: HttpClient,
        private config: ConfigService,
    ) {}

    private readonly baseApiUrl = 'https://tle.ivanstanojevic.me/api/tle';
    private readonly idToTrajectory: { [id: number]: Trajectory } = {};

    public observationsAtTime(
        // TO SELF: not needed any more
        time = new Date(),
    ): Observable<SatelliteObservation[]> {
        const observations = this.config.satellites.map((satellite) =>
            this.fetchTrajectory(satellite.id).pipe(
                map((trajectory: Trajectory) => {
                    const coords = this.geographicCoordsAtTime(
                        trajectory,
                        time,
                    );
                    if (coords === undefined) return undefined;
                    return {
                        name: satellite.name,
                        coords,
                        time: time,
                    };
                }),
            ),
        );
        return forkJoin(observations).pipe(
            map(
                (observations) =>
                    observations.filter(
                        (observation) => observation !== undefined,
                    ) as SatelliteObservation[],
            ),
        );
    }

    public satellites(): Observable<Satellite[]> {
        return forkJoin(
            this.config.satellites.map((config) =>
                this.fetchTrajectory(config.id).pipe(
                    map((trajectory: Trajectory) => ({
                        name: config.name,
                        id: config.id,
                        path: (time: Date) =>
                            this.geographicCoordsAtTime(trajectory, time),
                    })),
                ),
            ),
        );
    }

    public closestFlyby(satellite: Satellite, observer: EciVec3<number>, startTime: Date, endTime: Date) {
        console.log("computing closest fly by between", startTime, endTime);

        const squaredNorm = (coords: EcfVec3<number>) => coords.x * coords.x + coords.y * coords.y + coords.z * coords.z;
        const subtract = (coords: EcfVec3<number>, other: EcfVec3<number>) => ({ x: coords.x - other.x, y: coords.y - other.y, z: coords.z - other.z } as EcfVec3<number>);
        const normalize = (coords: EcfVec3<number>) => {
            const norm = Math.sqrt(squaredNorm(coords));
            return { x: coords.x / norm, y: coords.y / norm, z: coords.z / norm } as EcfVec3<number>;
        };
        const squaredDistance = (a: EciVec3<number>, b: EciVec3<number>) => Math.sqrt(squaredNorm(subtract(a, b)));
        const throwIfUndefined = (coords: EcfVec3<number> | undefined) => {
            if (coords === undefined) throw new Error("Undefined coords");
            return coords;
        }

        const normalizedObserver = normalize(observer);
        const samples = 1000;

        this.fetchTrajectory(satellite.id).subscribe((trajectory: Trajectory) => {
            const path = (time: number) => normalize(throwIfUndefined(this.cartesianCoordsAtTime(trajectory, new Date(time))));
            const squaredDistanceFromObserver = (time: number) => squaredDistance(path(time), normalizedObserver);

            const squaredDistanceSamples = [...Array(samples).keys()].map((i) => {
                const time = startTime.getTime() + (endTime.getTime() - startTime.getTime()) * i / samples;
                return [(time - startTime.getTime()) / 1000_000, squaredDistanceFromObserver(time)];
            });
            console.log("squared distance", JSON.stringify(squaredDistanceSamples));
            const centralDiffSamples = [];
            for (let i = 1; i + 1 < squaredDistanceSamples.length; i++) {
                const left = squaredDistanceSamples[i - 1];
                const centralTime = squaredDistanceSamples[i][0];
                const right = squaredDistanceSamples[i + 1];

                const distDiff = right[1] - left[1];
                const timeDiff = right[0] - left[0];
                centralDiffSamples.push([centralTime, distDiff / timeDiff]);
            }
            console.log("central diff", JSON.stringify(centralDiffSamples)); // works

            const inflectionSamples = [];
            for (let i = 1; i < centralDiffSamples.length; i++) {
                const left = centralDiffSamples[i - 1];
                const right = centralDiffSamples[i];
                if ((left[1] <= 0 && right[1] >= 0 ) || (left[1] >= 0 && right[1] <= 0)) {
                    const t = (left[0] + right[0]) / 2;
                    const s = squaredDistanceFromObserver(t * 1000_000 + startTime.getTime());
                    inflectionSamples.push([t, s]);
                }
            }
            console.log("inflections", JSON.stringify(inflectionSamples)); // also works

            console.log("lowest point", [...inflectionSamples].sort(([, dist1], [, dist2]) => dist1 - dist2)[0]) // also works
        })
    }

    public closestFlybys(
        observer: GeographicCoords,
        startTime: Date,
        timeStepMs: number = 50_000,
        maxTimeSteps: number = 1000,
    ): Observable<SatelliteObservation[]> {
        const times = [...Array(maxTimeSteps).keys()].map(
            (i) => new Date(startTime.getTime() + i * timeStepMs),
        );

        const closestObservations = this.config.satellites.map((satellite) =>
            this.fetchTrajectory(satellite.id).pipe(
                map((trajectory: Trajectory) => {
                    let closestTime: Date | undefined = undefined;
                    let closestCoords: GeographicCoords | undefined = undefined;

                    for (const time of times) {
                        const coords = this.geographicCoordsAtTime(
                            trajectory,
                            time,
                        );
                        if (
                            coords !== undefined &&
                            (closestCoords === undefined ||
                                observer.distanceKm(coords) <
                                    observer.distanceKm(closestCoords))
                        ) {
                            closestTime = time;
                            closestCoords = coords;
                        }
                    }

                    if (
                        closestCoords === undefined ||
                        closestTime === undefined
                    )
                        return undefined;
                    return {
                        name: satellite.name,
                        coords: closestCoords,
                        time: closestTime,
                    };
                }),
            ),
        );

        return forkJoin(closestObservations).pipe(
            map(
                (observations) =>
                    observations.filter(
                        (o) => o !== undefined,
                    ) as SatelliteObservation[],
            ),
        );
    }

    private fetchTrajectory(satelliteId: number): Observable<Trajectory> {
        if (satelliteId in this.idToTrajectory)
            return of(this.idToTrajectory[satelliteId]);

        return this.httpClient
            .get<Trajectory>(`${this.baseApiUrl}/${satelliteId}`)
            .pipe(
                map((trajectory: Trajectory) => {
                    this.idToTrajectory[satelliteId] = trajectory;
                    return trajectory;
                }),
            );
    }

    private cartesianCoordsAtTime(trajectory: Trajectory, time: Date): EcfVec3<number> | undefined {
        const eciData = propagate(
            twoline2satrec(trajectory.line1, trajectory.line2),
            time,
        );
        if (typeof eciData.position === 'boolean') return undefined;
        return eciToEcf(eciData.position, gstime(time));
    }

    private geographicCoordsAtTime(
        trajectory: Trajectory,
        time: Date,
    ): GeographicCoords | undefined {
        const eciCoords = propagate(
            twoline2satrec(trajectory.line1, trajectory.line2),
            time,
        );
        if (typeof eciCoords.position === 'boolean') return undefined;
        const geodeticCoords = eciToGeodetic(eciCoords.position, gstime(time));
        return new GeographicCoords(
            degreesLat(geodeticCoords.latitude),
            degreesLong(geodeticCoords.longitude),
        );
    }
}
