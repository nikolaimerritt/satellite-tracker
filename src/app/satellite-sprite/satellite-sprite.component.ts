import { Component, Input, Output, ElementRef, HostBinding, EventEmitter } from '@angular/core';
import { SatelliteObservation } from '../satellite-fetcher.service';

@Component({
    selector: 'satellite-sprite',
    templateUrl: './satellite-sprite.component.html',
    styleUrls: ['./satellite-sprite.component.scss'],
})
export class SatelliteSpriteComponent {
    @Input() public name!: string;

    @Output() public elementEv = new EventEmitter<ElementRef>();
    
    public constructor(private element: ElementRef) {}  

    public ngAfterViewInit() {
        console.log("satellite-sprite: emitting element", this.element);
        this.elementEv.emit(this.element);
    }
}
