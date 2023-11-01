import { Component } from '@angular/core';
import { Subscription, interval, map } from 'rxjs';
import { SatelliteFetcherService } from 'src/app/satellite-fetcher.service';
import { GeographicCoords } from '../model/geographic-coords';
import { Satellite } from '../model/satellite';

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

        // this.satelliteFetcher
        //     .closestFlybys(new GeographicCoords(51.507, -0.064), new Date())
        //     .subscribe((satellite) => {
        //         console.log('satellite overhead', satellite);
        //     });
        this.subscriptions.push(
            this.satelliteFetcher.satellites().subscribe((satellites) => {
                const me = { x: 7974.81, y: -9.87, z: 9962.1 };
                const closest = satellites[0].closestObservation(
                    new GeographicCoords(51.50786, -0.063964),
                );
                console.log("root: closest", closest);
            }),
        );
    }

    private ngOnDestroy() {
        for (const subscription of this.subscriptions)
            subscription.unsubscribe();
    }
}
