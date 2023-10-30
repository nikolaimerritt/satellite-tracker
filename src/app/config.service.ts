import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface SatelliteConfig {
    name: string;
    id: number;
}

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private _satellites: SatelliteConfig[] = [];
    private readonly configFilepath = '/assets/config.json';

    public get satellites(): SatelliteConfig[] {
        return [...this._satellites];
    }

    public async load(): Promise<any> {
        const config = await lastValueFrom(this.http.get(this.configFilepath));
        if ('satellites' in config && Array.isArray(config['satellites'])) {
            this._satellites = config['satellites'];
        }
    }

    constructor(private http: HttpClient) {}
}
