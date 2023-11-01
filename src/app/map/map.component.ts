import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { Satellite } from '../model/satellite';
import {
    CentredCartesianCoords,
    MercatorCoordinates as MercatorProjection,
} from '../model/centred-cartesian-coords';

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
            const mercator = satellite
                .coordsAt(
                    new Date(animationStart.getTime() + msSinceAnimationStart),
                )
                ?.mercatorProjection();
            if (mercator) {
                const mapWidth = this.element.nativeElement.offsetWidth;
                const mapHeight = this.element.nativeElement.offsetHeight;
                element.nativeElement.style.left = mercator.x * mapWidth + 'px';
                element.nativeElement.style.top = mercator.y * mapHeight + 'px';
            }
            window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    protected onClick(event: MouseEvent) {
        const mapWidth = this.element.nativeElement.offsetWidth;
        const mapHeight = this.element.nativeElement.offsetHeight;

        const mercator: MercatorProjection = {
            x: event.offsetX / mapWidth,
            y: event.offsetY / mapHeight,
        };
        const centredCoords =
            CentredCartesianCoords.fromMercatorProjection(mercator);
        for (const satellite of this.satellites) {
            console.log(
                'closest flyby',
                satellite.name,
                satellite.closestObservation(centredCoords),
            );
        }
    }
}
