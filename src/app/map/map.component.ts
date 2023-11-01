import {
    Component,
    Input,
    ElementRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { Observation, Satellite } from '../model/satellite';
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
    @Output() nextFlybyChange = new EventEmitter<Observation>();

    protected selectedSatellite?: Satellite;
    protected calculatingNextFlyby = false;

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
                this.nextFlybyChange.emit(nextFlyby);
                this.selectedSatellite = undefined;
                this.calculatingNextFlyby = false;
            }
        }
    }

    protected onCalculateFlybyButton() {
        if (this.selectedSatellite !== undefined) {
            this.calculatingNextFlyby = true;
        }
    }

    protected cursor() {
        if (this.calculatingNextFlyby) return 'crosshair';
        return 'default';
    }
}
