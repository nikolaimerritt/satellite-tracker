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
} from 'satellite.js';
import { ConfigService } from './config.service';

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

    public observationsAtTime(time = new Date()): Observable<SatelliteObservation[]> {
        const observations = this.config.satellites.map((satellite) =>
            this.fetchTrajectory(satellite.id).pipe(
                map((trajectory: Trajectory) => {
                    const coords = this.geographicCoordsAtTime(trajectory, time);
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

    private geographicCoordsAtTime(
        trajectory: Trajectory,
        date: Date,
    ): GeographicCoords | undefined {
        const eciData = propagate(
            twoline2satrec(trajectory.line1, trajectory.line2),
            date,
        );
        if (typeof eciData.position === 'boolean') return undefined;

        const geodeticCoords = eciToGeodetic(eciData.position, gstime(date));
        return new GeographicCoords(
            degreesLat(geodeticCoords.latitude),
            degreesLong(geodeticCoords.longitude),
        );
    }
}
