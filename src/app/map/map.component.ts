import { Component, Input, ElementRef } from '@angular/core';
import {
    Satellite,
    GeographicCoords as GeographicCoords,
} from '../satellite-fetcher.service';
import {
    trigger,
    state,
    style,
    animate,
    transition,
    animation,
} from '@angular/animations';

interface ScreenCoords {
    x: number;
    y: number;
}

@Component({
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    // animations: [
    //     trigger("moveAnimation", [
    //         state("default",  style({})),
    //         state("moved", style({
    //             left: "{{x}}",
    //             top: "{{y}}",
    //         }), { params: { x: 0, y: 0 } }),
    //         transition("default => moved", [animate("3s")]),
    //         transition("moved=>default", [animate("0.1s")])
    //     ])
    // ]
})
export class MapComponent {
    constructor(private element: ElementRef) {}

    @Input() satellites!: Satellite[];

    // protected readonly dimensions = {
    //     width: 2058,
    //     height: 2058,
    // };

    protected toScreenCoords(coords: GeographicCoords): ScreenCoords {
        const mapWidth = this.element.nativeElement.offsetWidth;
        const mapHeight = this.element.nativeElement.offsetHeight;

        const x = ((coords.longitude + 180) * mapWidth) / 360;
        const latitudeRadians = (coords.latitude * Math.PI) / 180;
        const mercatorFactor = Math.log(
            Math.tan(Math.PI / 4 + latitudeRadians / 2),
        );
        const y = mapHeight / 2 - (mapWidth * mercatorFactor) / (2 * Math.PI);
        // return { x, y };
        return { x: 0.5 * mapWidth, y: 0.5 * mapHeight };
    }
}
