import { Component, Input } from '@angular/core';
import { Satellite } from '../satellite-fetcher.service';

@Component({
    selector: 'satellite-sprite',
    templateUrl: './satellite-sprite.component.html',
    styleUrls: ['./satellite-sprite.component.scss']
})
export class SatelliteSpriteComponent {
    @Input() public satellite!: Satellite;
}  
