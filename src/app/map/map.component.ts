import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { GeographicCoords } from '../model/geographic-coords';
import { Satellite } from '../model/satellite';

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
    @Input() satellites!: Satellite[];

    public animateSatellite(satellite: Satellite, element: ElementRef) {
        const animationStart = new Date();
        const step = (msSinceAnimationStart: number) => {
            const geographicCoords = satellite.coordsAt(
                new Date(animationStart.getTime() + msSinceAnimationStart),
            );
            if (geographicCoords) {
                const screenCoords = this.toScreenCoords(geographicCoords);
                element.nativeElement.style.left = screenCoords.x + 'px';
                element.nativeElement.style.top = screenCoords.y + 'px';
            }
            window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    private toScreenCoords(coords: GeographicCoords): ScreenCoords {
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

    private toGeographicCoords(coords: ScreenCoords): GeographicCoords {
        // works
        const mapWidth = this.element.nativeElement.offsetWidth;
        const mapHeight = this.element.nativeElement.offsetHeight;

        const longitude = (360 * coords.x) / mapWidth - 180;
        const mercatorFactor =
            ((mapHeight / 2 - coords.y) * 2 * Math.PI) / mapWidth;
        const latitudeRadians =
            2 * (Math.atan(Math.exp(mercatorFactor)) - Math.PI / 4);
        const latitude = (latitudeRadians * 180) / Math.PI;
        return new GeographicCoords(latitude, longitude);
    }

    protected onClick(event: MouseEvent) {
        const screenCoords: ScreenCoords = {
            x: event.offsetX,
            y: event.offsetY,
        };
        const geographicCoords = this.toGeographicCoords(screenCoords);
        // for (const satellite of this.satellites) {
        //     console.log("closest flyby", satellite.name, satellite.closestObservation(geographicCoords))
        // }
    }
}
