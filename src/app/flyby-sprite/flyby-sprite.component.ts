import {
    Component,
    Input,
    Output,
    ElementRef,
    EventEmitter,
} from '@angular/core';
import { SphericalCoords } from '../model/earth-centred-coords';
import { Flyby } from '../model/satellite';

@Component({
    selector: 'flyby-sprite',
    templateUrl: './flyby-sprite.component.html',
    styleUrls: ['./flyby-sprite.component.scss'],
})
export class FlybySpriteComponent {
    @Input() public flyby!: Flyby;
    @Output() public elementChange = new EventEmitter<ElementRef>();

    public constructor(private element: ElementRef) {}

    private readonly decimalPlaces = 2;

    private ngAfterViewInit() {
        this.elementChange.emit(this.element);
    }

    protected location(): string {
        const spherical = this.flyby.coords.toSpherical();
        return `${spherical.latitude.toFixed(
            this.decimalPlaces,
        )} ${spherical.longitude.toFixed(this.decimalPlaces)}`;
    }

    protected time(): string {
        return `${this.flyby.time}`;
    }
}
