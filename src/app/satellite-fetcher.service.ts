import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, map, forkJoin, filter, mergeMap, EMPTY, of } from 'rxjs';
import { twoline2satrec, eciToGeodetic, propagate, gstime, degreesLong, degreesLat } from "satellite.js"

export interface Satellite {
    name: string,
    id: number,
    geographicCoords: GeographicCoords,
}

export interface GeographicCoords {
    latitude: number,
    longitude: number,
}

interface SatelliteId {
    name: string,
    id: number,
}

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
    ]

    public satellites(): Observable<Satellite[]> {
        type Response  = {
            name: string,
            satelliteId: number,
        } & TwoLineElement

        const date = new Date();
        const satelliteObservables = this.satelliteIds.map((satelliteId) => 
            this.httpClient
            .get<Response>(`${this.baseApiUrl}/${satelliteId.id}`)
            .pipe(mergeMap((response: Response) => {
                const geographicCoords = this.geographicCoordsAtTime(response, date);
                if (geographicCoords === undefined) return EMPTY;

                return of({ 
                    name: response.name,  
                    id: response.satelliteId,
                    geographicCoords,
                });
            }))
        )
        return forkJoin(satelliteObservables)
    }

    protected geographicCoordsAtTime(twoLineElement: TwoLineElement, date: Date): GeographicCoords | undefined {
        const eciData = propagate(twoline2satrec(twoLineElement.line1, twoLineElement.line2), date);
        if (typeof eciData.position === "boolean")
            return undefined;

        const geodeticCoords = eciToGeodetic(eciData.position, gstime(date));
        return {
            latitude: degreesLat(geodeticCoords.latitude),
            longitude: degreesLong(geodeticCoords.longitude),
        };
    }
}
