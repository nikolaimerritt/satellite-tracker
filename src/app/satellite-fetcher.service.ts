import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, mergeMap, EMPTY, of } from 'rxjs';
import {
    twoline2satrec,
    eciToGeodetic,
    propagate,
    gstime,
    degreesLong,
    degreesLat,
} from 'satellite.js';

export interface Satellite {
    name: string;
    coords: GeographicCoords;
    time: Date;
}

export interface GeographicCoords {
    latitude: number;
    longitude: number;
}

interface SatelliteStatus {
    name: string;
    trajectory: TwoLineElement;
}

interface TwoLineElement {
    line1: string;
    line2: string;
}

@Injectable({
    providedIn: 'root',
})
export class SatelliteFetcherService {
    constructor(private httpClient: HttpClient) {}

    private readonly baseApiUrl = 'https://tle.ivanstanojevic.me/api/tle';
    private readonly satteliteIDs = [40075, 43696] as const;

    private readonly idToStatus: { [key: number]: SatelliteStatus } = {};

    public satellites(): Observable<Satellite[]> {
        const now = new Date();
        const satelliteObservables = this.satteliteIDs.map((id) =>
            this.getStatus(id).pipe(
                mergeMap((status: SatelliteStatus) => {
                    const coords = this.geographicCoordsAtTime(
                        status.trajectory,
                        now,
                    );
                    if (coords === undefined) return EMPTY;
                    return of({
                        name: status.name,
                        coords,
                        time: now,
                    });
                }),
            ),
        );
        return forkJoin(satelliteObservables);
    }

    private getStatus(satelliteId: number): Observable<SatelliteStatus> {
        type StatusAPIResponse = {
            name: string;
            satelliteId: number;
        } & TwoLineElement;

        if (satelliteId in this.idToStatus)
            return of(this.idToStatus[satelliteId]);

        return this.httpClient
            .get<StatusAPIResponse>(`${this.baseApiUrl}/${satelliteId}`)
            .pipe(
                map((response: StatusAPIResponse) => {
                    const status = {
                        name: response.name,
                        trajectory: {
                            line1: response.line1,
                            line2: response.line2,
                        },
                    };
                    this.idToStatus[satelliteId] = status;
                    return status;
                }),
            );
    }

    private geographicCoordsAtTime(
        trajectory: TwoLineElement,
        date: Date,
    ): GeographicCoords | undefined {
        const eciData = propagate(
            twoline2satrec(trajectory.line1, trajectory.line2),
            date,
        );
        if (typeof eciData.position === 'boolean') return undefined;

        const geodeticCoords = eciToGeodetic(eciData.position, gstime(date));
        return {
            latitude: degreesLat(geodeticCoords.latitude),
            longitude: degreesLong(geodeticCoords.longitude),
        };
    }

    public closestSatelliteInterception(
        observer: GeographicCoords,
        startTime: Date,
        timeStepMs: number = 50_000,
        maxTimeSteps: number = 1000,
    ): Observable<Satellite[]> {
        const times = [...Array(maxTimeSteps).keys()].map(
            (i) => new Date(startTime.getTime() + i * timeStepMs),
        );

        return forkJoin(
            this.satteliteIDs.map((id: number) =>
                this.getStatus(id).pipe(
                    mergeMap((status: SatelliteStatus) => {
                        let closestTime: Date | undefined = undefined;
                        let closestCoords: GeographicCoords | undefined =
                            undefined;

                        for (const time of times) {
                            const coords = this.geographicCoordsAtTime(
                                status.trajectory,
                                time,
                            );
                            if (
                                coords !== undefined &&
                                (closestCoords === undefined ||
                                    this.distance(observer, coords) <
                                        this.distance(observer, closestCoords))
                            ) {
                                closestTime = time;
                                closestCoords = coords;
                            }
                        }

                        if (
                            closestCoords === undefined ||
                            closestTime === undefined
                        )
                            return EMPTY;
                        return of({
                            name: status.name,
                            coords: closestCoords,
                            time: closestTime,
                        });
                    }),
                ),
            ),
        );
    }

    private distance(
        pointA: GeographicCoords,
        pointB: GeographicCoords,
    ): number {
        const pointARads = this.coordsInRads(pointA);
        const pointBRads = this.coordsInRads(pointB);

        const sineSquareLatitudeDifference = Math.pow(
            Math.sin((pointARads.latitude - pointBRads.latitude) / 2),
            2,
        );
        const sineSquareLongitudeDifference = Math.pow(
            Math.sin((pointARads.longitude - pointBRads.longitude) / 2),
            2,
        );

        return (
            2 *
            Math.asin(
                Math.sqrt(
                    sineSquareLatitudeDifference +
                        Math.cos(pointARads.latitude) *
                            Math.cos(pointBRads.latitude) *
                            sineSquareLongitudeDifference,
                ),
            )
        );
    }

    private coordsInRads(coords: GeographicCoords): GeographicCoords {
        const scaleFactor = Math.PI / 180;
        return {
            latitude: coords.latitude * scaleFactor,
            longitude: coords.longitude * scaleFactor,
        };
    }
}
