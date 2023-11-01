import { Component } from '@angular/core';
import { Subscription, interval, map } from 'rxjs';
import { SatelliteFetcherService } from 'src/app/satellite-fetcher.service';
import { GeographicCoords } from '../model/geographic-coords';
import { Satellite } from '../model/satellite';
import { ecfToEci, eciToGeodetic, geodeticToEcf, gstime } from 'satellite.js';
import { CentredCartesianCoords } from '../model/centred-cartesian-coords';

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

        this.subscriptions.push(
            this.satelliteFetcher.satellites().subscribe((satellites) => {
                const me = { x: 7974.81, y: -9.87, z: 9962.1 };
                const closest = satellites[0].closestObservation(
                    new GeographicCoords(51.50786, -0.063964),
                );
                console.log("root: closest", closest);
            }),
        );

        // const g = new GeographicCoords(51.50786, -0.063964).toRadians();
        // const now = new Date();
        // const g2 = eciToGeodetic(ecfToEci(geodeticToEcf(g), gstime(now)), gstime(now));
        // console.log("conversion", g, new GeographicCoords(g2.latitude, g2.longitude, g.height, 'Radians'));
    }

    private ngOnDestroy() {
        for (const subscription of this.subscriptions)
            subscription.unsubscribe();
    }
}
