import { Component } from '@angular/core';
import { Subscription, interval, map } from 'rxjs';
import {
    SatelliteFetcherService,
    SatelliteObservation,
} from 'src/app/satellite-fetcher.service';
import { GeographicCoords } from '../utils/geographic-coords';

@Component({
    selector: 'root',
    templateUrl: './root.component.html',
})
export class RootComponent {
    protected satellites: SatelliteObservation[] = [];

    private readonly subscriptions: Subscription[] = [];
    private readonly satelliteUpdateInterval = 1000 * 1000;

    constructor(private satelliteFetcher: SatelliteFetcherService) {}

    private ngOnInit() {
        this.updateSatellites();
        this.subscriptions.push(
            interval(this.satelliteUpdateInterval).subscribe(() =>
                this.updateSatellites(),
            ),
        );

        this.satelliteFetcher
            .closestFlybys(new GeographicCoords(51.507, -0.064), new Date())
            .subscribe((satellite) => {
                console.log('satellite overhead', satellite);
            });
    }

    private updateSatellites() {
        this.subscriptions.push(
            this.satelliteFetcher.observationsAtTime().subscribe((satellites) => {
                this.satellites = satellites;
            }),
        );
    }

    private ngOnDestroy() {
        for (const subscription of this.subscriptions)
            subscription.unsubscribe();
    }
}
