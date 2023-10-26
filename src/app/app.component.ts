import { Component } from '@angular/core';
import { Satellite } from 'src/map/satellite';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'satellite-tracker';

    protected readonly satellites: Satellite[] = [
        // { 
        //     name: "Tower of London",
        //     location: { 
        //         latitude:  51.5,
        //         longitude: -0.08,
        //     },
        // },
        // {
        //     name: "Chad",
        //     location: {
        //         latitude: 14.8,
        //         longitude: 18.7,
        //     },
        // },
        {
            name: "Ireland",
            location: {
                latitude: 6.932515443044662, 
                longitude: 80.83209679317419,
            }
        }
    ]
}
