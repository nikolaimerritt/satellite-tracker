import { Component, Input } from '@angular/core';
import { Satellite, GeographicCoords as GeographicCoords } from '../satellite-fetcher.service';

interface ScreenCoords {
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
        width: 2058, 
        height: 2058,
    };

    protected toScreenCoords(coords: GeographicCoords): ScreenCoords {
        const x = (coords.longitude + 180) * this.dimensions.width / 360;
        const latitudeRadians = coords.latitude * Math.PI / 180;
        const mercatorFactor = Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2));
        const y = this.dimensions.height / 2 - this.dimensions.width * mercatorFactor / (2 * Math.PI);
        return { x, y };
    }
}
