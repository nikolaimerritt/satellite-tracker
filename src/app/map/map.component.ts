import { Component, Input, ElementRef } from '@angular/core';
import { Flyby, Satellite } from '../model/satellite';
import {
    EarthCentredCoords,
    MercatorProjection,
} from '../model/earth-centred-coords';

@Component({
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
})
export class MapComponent {
    constructor(private element: ElementRef) {}

    @Input() satellites!: Satellite[];

    protected selectedSatellite?: Satellite;
    protected calculatingNextFlyby = false;
    protected flyby?: Flyby = undefined;

    protected animateSatellite(element: ElementRef, satellite: Satellite) {
        const animationStart = new Date();
        const step = (timeSinceStart: number) => {
            const mercator = satellite
                .coordsAt(new Date(animationStart.getTime() + timeSinceStart))
                ?.toMercatorProjection();
            if (mercator) {
                this.moveTo(element, mercator);
            }
            window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    protected animateFlybySprite(element: ElementRef, flyby: Flyby) {
        const mercator = flyby.coords.toMercatorProjection();
        this.moveTo(element, mercator);
    }

    protected onMapClick(click: MouseEvent) {
        if (this.selectedSatellite !== undefined && this.calculatingNextFlyby) {
            const mapWidth = this.element.nativeElement.offsetWidth;
            const mapHeight = this.element.nativeElement.offsetHeight;

            const clickAsMercator: MercatorProjection = {
                x: click.offsetX / mapWidth,
                y: click.offsetY / mapHeight,
            };
            const clickAsEarthCentredCoords =
                EarthCentredCoords.fromMercatorProjection(clickAsMercator);
            const flyby = this.selectedSatellite.closestFlyby(
                clickAsEarthCentredCoords,
            );
            if (flyby) {
                this.flyby = flyby;
                this.selectedSatellite = undefined;
                this.calculatingNextFlyby = false;
            }
        } else {
            this.flyby = undefined;
        }
    }

    protected selectSatellite(satellite: Satellite) {
        this.calculatingNextFlyby = false;
        this.flyby = undefined;
        this.selectedSatellite = satellite;
    }

    protected onCalculateFlybyButtonClick(click: MouseEvent) {
        click.stopImmediatePropagation();
        if (this.selectedSatellite !== undefined) {
            this.calculatingNextFlyby = true;
        }
    }

    private moveTo(element: ElementRef, mercator: MercatorProjection) {
        const mapWidth = this.element.nativeElement.offsetWidth;
        const mapHeight = this.element.nativeElement.offsetHeight;

        element.nativeElement.style.left = mercator.x * mapWidth + 'px';
        element.nativeElement.style.top = mercator.y * mapHeight + 'px';
    }

    protected cursor(): string {
        if (this.calculatingNextFlyby) return 'crosshair';
        return 'default';
    }
}
