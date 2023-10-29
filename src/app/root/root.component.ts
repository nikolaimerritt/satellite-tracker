import { Component } from '@angular/core';
import { Subscription, interval, map } from 'rxjs';
import { SatelliteFetcherService, Satellite } from 'src/app/satellite-fetcher.service';

@Component({
    selector: 'root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss']
})
export class RootComponent {
    protected satellites: Satellite[] = [];

    private readonly subscriptions: Subscription[] = [];
    private readonly satelliteUpdateInterval = 6_000 * 1000;

    constructor(private satelliteFetcher: SatelliteFetcherService) {}

    private ngOnInit() {
        this.updateSatellites();
        this.subscriptions.push(interval(this.satelliteUpdateInterval).subscribe(() => this.updateSatellites()));
    }

    private updateSatellites() {
        this.satelliteFetcher.satellites().subscribe((satellites) => {
            this.satellites = satellites;
        });
    }

    private ngOnDestroy() {
        for (const subscription of this.subscriptions) subscription.unsubscribe();
    }
}
