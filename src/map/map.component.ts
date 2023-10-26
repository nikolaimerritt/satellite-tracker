import { Component, Input } from '@angular/core';
import { Satellite } from './satellite';
import { Location } from './satellite';

interface ScreenPos {
    x: number,
    y: number,
}

@Component({
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent {
    @Input() satellites!: Satellite[];

    protected readonly dimensions = { 
        width: 300, 
        height: 400
    };

    protected locationToScreenPosition(location: Location): ScreenPos {
        const normalisedX = location.longitude;
        const latitudeRads = location.latitude * Math.PI / 180;
        const normalisedY = Math.log(Math.tan(Math.PI / 4 + latitudeRads / 2));
        return { 
            x: normalisedX * this.dimensions.width, 
            y: normalisedY * this.dimensions.height,
        };
    }
}
