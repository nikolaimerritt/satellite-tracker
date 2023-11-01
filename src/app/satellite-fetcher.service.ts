import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
import { Satellite, Trajectory, TwoLineElement } from './model/satellite';

@Injectable({
    providedIn: 'root',
})
export class SatelliteFetcherService {
    constructor(
        private httpClient: HttpClient,
        private config: ConfigService,
    ) {}

    private readonly baseApiUrl = 'https://tle.ivanstanojevic.me/api/tle';

    public satellites(): Observable<Satellite[]> {
        return forkJoin(
            this.config.satellites.map((config) =>
                this.fetchTrajectory(config.id).pipe(
                    map(
                        (trajectory: Trajectory) =>
                            new Satellite(config.name, config.id, trajectory),
                    ),
                ),
            ),
        );
    }

    private fetchTrajectory(satelliteId: number): Observable<Trajectory> {
        return this.httpClient
            .get<TwoLineElement>(`${this.baseApiUrl}/${satelliteId}`)
            .pipe(
                map(
                    (twoLineElement: TwoLineElement) =>
                        new Trajectory(new Date(), twoLineElement),
                ),
            );
    }
}
