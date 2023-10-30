import { Component, Input, ElementRef, ViewChild } from '@angular/core';
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

    public animateLoop(element: ElementRef) {
        let startTimestamp: number | undefined = undefined;
        const step = (timestamp: number) => {
            if (startTimestamp === undefined) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / 1000, 1);
            element.nativeElement.style.left = 100 + 100 * progress + 'px';
            if (progress < 1) window.requestAnimationFrame(step);
        }

        window.requestAnimationFrame(step);
    }

    public animateSatellite(satellite: SatelliteObservation, element: ElementRef) {
        let startTimestamp: number | undefined = undefined;
        const step = (timestamp: number) => {
            if (startTimestamp === undefined) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / 1000, 1);


            element.nativeElement.style.left = 100 + 100 * progress + 'px';
            if (progress < 1) window.requestAnimationFrame(step);
        }

        window.requestAnimationFrame(step);
    }

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
