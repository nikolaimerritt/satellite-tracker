import {
    Component,
    Input,
    Output,
    ElementRef,
    EventEmitter,
} from '@angular/core';

@Component({
    selector: 'satellite-sprite',
    templateUrl: './satellite-sprite.component.html',
    styleUrls: ['./satellite-sprite.component.scss'],
})
export class SatelliteSpriteComponent {
    @Input() public name!: string;
    @Output() public elementChange = new EventEmitter<ElementRef>();

    public constructor(private element: ElementRef) {}

    public ngAfterViewInit() {
        this.elementChange.emit(this.element);
    }
}
