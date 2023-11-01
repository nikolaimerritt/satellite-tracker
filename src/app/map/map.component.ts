import {
    Component,
    Input,
    ElementRef,
    Output,
    EventEmitter,
    ViewChild,
} from '@angular/core';
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
    @Output() nextFlybyChange = new EventEmitter<Flyby>();

    protected selectedSatellite?: Satellite;
    protected calculatingNextFlyby = false;
    protected flyby?: Flyby = undefined;

    public animateSatellite(satellite: Satellite, element: ElementRef) {
        const animationStart = new Date();
        const step = (msSinceAnimationStart: number) => {
            const mercator = satellite
                .coordsAt(
                    new Date(animationStart.getTime() + msSinceAnimationStart),
                )
                ?.mercatorProjection();
            if (mercator) {
                // this.moveTo(element, mercator);
            }
            window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    protected onMapClick(event: MouseEvent) {
        if (this.selectedSatellite !== undefined && this.calculatingNextFlyby) {
            const mapWidth = this.element.nativeElement.offsetWidth;
            const mapHeight = this.element.nativeElement.offsetHeight;

            const mercator: MercatorProjection = {
                x: event.offsetX / mapWidth,
                y: event.offsetY / mapHeight,
            };
            const centredCoords =
                EarthCentredCoords.fromMercatorProjection(mercator);
            const nextFlyby =
                this.selectedSatellite.closestObservation(centredCoords);
            if (nextFlyby) {
                this.flyby = nextFlyby;
                this.nextFlybyChange.emit(nextFlyby);
                this.selectedSatellite = undefined;
                this.calculatingNextFlyby = false;
            }
        }
    }

    protected onCalculateFlybyButtonClick() {
        if (this.selectedSatellite !== undefined) {
            this.calculatingNextFlyby = true;
        }
    }

    private moveTo(element: ElementRef, mercator: MercatorProjection) {
        console.log('moving to', element, mercator);
        const mapWidth = this.element.nativeElement.offsetWidth;
        const mapHeight = this.element.nativeElement.offsetHeight;

        element.nativeElement.style.left = mercator.x * mapWidth + 'px';
        element.nativeElement.style.top = mercator.y * mapHeight + 'px';
    }

    protected moveFlyby(element: ElementRef, flyby: Flyby) {
        const mercator = flyby.coords.mercatorProjection();
        this.moveTo(element, mercator);
    }

    protected cursor() {
        if (this.calculatingNextFlyby) return 'crosshair';
        return 'default';
    }
}
