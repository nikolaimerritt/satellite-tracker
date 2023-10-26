import { Component } from '@angular/core';
import { Satellite } from 'src/map/satellite';
import { SatelliteFetcherService } from 'src/services/satellite-fetcher.service';

@Component({
    selector: 'root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss']
})
export class RootComponent {
    title = 'satellite-tracker';

    protected satellites: Satellite[] = [];

    // protected readonly satellites: Satellite[] = [
    //     { 
    //         name: "Tower of London",
    //         location: { 
    //             latitude:  51.5,
    //             longitude: -0.08,
    //         },
    //     },
    //     {
    //         name: "Chad",
    //         location: {
    //             latitude: 14.8,
    //             longitude: 18.7,
    //         },
    //     },
    //     {
    //         name: "Sri Lanka",
    //         location: {
    //             latitude: 6.932515443044662, 
    //             longitude: 80.83209679317419,
    //         }
    //     }
    // ]

    constructor(private satelliteFetcher: SatelliteFetcherService) {}

    private ngOnInit() {
        setTimeout(() => this.satelliteFetcher.satellites().subscribe((satellites) => this.satellites = satellites), 5000)
    }
}
