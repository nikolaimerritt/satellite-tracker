import { Injectable } from '@angular/core';
import { Satellite } from './map/satellite';
import { HttpClient } from "@angular/common/http";
import { Observable, map, forkJoin, filter, mergeMap, EMPTY, of } from 'rxjs';
import { Location } from './map/satellite';
import { twoline2satrec, eciToGeodetic, propagate, gstime, degreesLong, degreesLat } from "satellite.js"

interface SatelliteId {
    name: string,
    id: number,
}

type SatelliteResponse = { name: string } & TwoLineElement;

interface TwoLineElement {
    line1: string,
    line2: string,
}

@Injectable({
    providedIn: 'root'
})
export class SatelliteFetcherService {
    constructor(private httpClient: HttpClient) { }

    private readonly baseApiUrl = "https://tle.ivanstanojevic.me/api/tle";
    private readonly satelliteIds: SatelliteId[] = [
        { 
            name: "ISS (ZARYA)",
            id: 25544
        },
        // {
        //     name: "CENTAURI-1",
        //     id: 43809,
        // },
    ]

    public satellites(): Observable<Satellite[]> {
        const date = new Date();
        const satelliteObservables = this.satelliteIds.map((satelliteId) => 
            this.httpClient
            .get<SatelliteResponse>(`${this.baseApiUrl}/${satelliteId.id}`)
            .pipe(mergeMap((response: SatelliteResponse) => {
                const location = this.twoLineElementToLatLong(response, date);
                if (location === undefined) return EMPTY;

                return of({ name: response.name, location });
            }))
        )
        return forkJoin(satelliteObservables)
    }

    protected twoLineElementToLatLong(twoLineElement: TwoLineElement, date: Date): Location | undefined {
        const eciData = propagate(twoline2satrec(twoLineElement.line1, twoLineElement.line2), date);
        console.log("hello, its this high", eciData);
        if (typeof eciData.position === "boolean")
            return undefined;

        const geodesicPosition = eciToGeodetic(eciData.position, gstime(date));
        return {
            latitude: degreesLat(geodesicPosition.latitude),
            longitude: degreesLong(geodesicPosition.longitude),
        };
    }
}
