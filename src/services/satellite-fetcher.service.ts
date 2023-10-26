import { Injectable } from '@angular/core';
import { Satellite } from 'src/map/satellite';
import { HttpClient } from "@angular/common/http";
import { Observable, map, forkJoin } from 'rxjs';
import { Location } from 'src/map/satellite';

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
        {
            name: "CENTAURI-1",
            id: 43809,
        },
        {
            name: "ROBUSTA 1B",
            id: 42792,
        },
    ]

    public satellites(): Observable<Satellite[]> {
        console.log("Fetching satellites");
        const satelliteObservables = this.satelliteIds.map((satelliteId) => 
            this.httpClient
            .get<SatelliteResponse>(`${this.baseApiUrl}/${satelliteId.id}`)
            .pipe(map((response =>
                ({ name: response.name, location: this.twoLineElementToLatLong(response) }) as Satellite
            )))
        )
        return forkJoin(satelliteObservables)
    }

    protected twoLineElementToLatLong(twoLineElement: TwoLineElement): Location {
        console.log("Converting two line element", twoLineElement);
        return { latitude: 43, longitude: 51 };
    }
}
