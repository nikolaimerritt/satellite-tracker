import { Component } from '@angular/core';
import { Observable, Subscription, interval, map } from 'rxjs';
import { SatelliteFetcherService } from 'src/app/satellite-fetcher.service';
import { Flyby, Satellite } from '../model/satellite';
import { ecfToEci, eciToGeodetic, geodeticToEcf, gstime } from 'satellite.js';
import { EarthCentredCoords } from '../model/earth-centred-coords';

@Component({
    selector: 'root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
})
export class RootComponent {
    protected satellites: Satellite[] = [];

    private readonly subscriptions: Subscription[] = [];

    constructor(private satelliteFetcher: SatelliteFetcherService) {}

    private ngOnInit() {
        this.subscriptions.push(
            this.satelliteFetcher
                .satellites()
                .subscribe(
                    (satellites: Satellite[]) => (this.satellites = satellites),
                ),
        );
    }

    private ngOnDestroy() {
        for (const subscription of this.subscriptions)
            subscription.unsubscribe();
    }
}
