import { Component, Input, ElementRef, HostBinding } from '@angular/core';
import { SatelliteObservation } from '../satellite-fetcher.service';

@Component({
    selector: 'satellite-sprite',
    templateUrl: './satellite-sprite.component.html',
    styleUrls: ['./satellite-sprite.component.scss'],
})
export class SatelliteSpriteComponent {
    @Input() public name!: string;
}
