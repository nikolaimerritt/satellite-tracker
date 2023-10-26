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
        { 
            name: "Tower of London",
            location: { 
                latitude:  51.5,
                longitude: -0.08,
            },
        },
        {
            name: "Chad",
            location: {
                latitude: 14.8,
                longitude: 18.7,
            },
        },
        {
            name: "Brazil",
            location: {
                latitude: -7.6,
                longitude: -56.0
            }
        }
    ]
}
