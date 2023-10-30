import { Component, Input, ElementRef } from '@angular/core';
import { SatelliteObservation } from '../satellite-fetcher.service';
import { GeographicCoords } from '../utils/geographic-coords';

interface ScreenCoords {
    x: number;
    y: number;
}

@Component({
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
})
export class MapComponent {
    constructor(private element: ElementRef) {}

    @Input() satellites!: SatelliteObservation[];

    protected toScreenCoords(coords: GeographicCoords): ScreenCoords {
        const mapWidth = this.element.nativeElement.offsetWidth;
        const mapHeight = this.element.nativeElement.offsetHeight;

        const x = ((coords.longitude + 180) * mapWidth) / 360;
        const latitudeRadians = (coords.latitude * Math.PI) / 180;
        const mercatorFactor = Math.log(
            Math.tan(Math.PI / 4 + latitudeRadians / 2),
        );
        const y = mapHeight / 2 - (mapWidth * mercatorFactor) / (2 * Math.PI);
        return { x, y };
    }
}
