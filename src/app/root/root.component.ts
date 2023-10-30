import { Component } from '@angular/core';
import { Subscription, interval, map } from 'rxjs';
import {
    Satellite,
    SatelliteFetcherService,
    SatelliteObservation,
} from 'src/app/satellite-fetcher.service';
import { GeographicCoords } from '../utils/geographic-coords';

@Component({
    selector: 'root',
    templateUrl: './root.component.html',
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

        this.satelliteFetcher
            .closestFlybys(new GeographicCoords(51.507, -0.064), new Date())
            .subscribe((satellite) => {
                console.log('satellite overhead', satellite);
            });
    }

    private ngOnDestroy() {
        for (const subscription of this.subscriptions)
            subscription.unsubscribe();
    }
}
