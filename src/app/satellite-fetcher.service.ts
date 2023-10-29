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

    protected geographicCoordsAtTime(
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
}
