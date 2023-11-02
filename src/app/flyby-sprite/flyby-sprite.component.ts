import {
    Component,
    Input,
    Output,
    ElementRef,
    EventEmitter,
} from '@angular/core';
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

    private readonly angleDecimalPlaces = 2;
    private readonly timeFormat: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    };

    private ngAfterViewInit() {
        this.elementChange.emit(this.element);
    }

    protected location(): string {
        const spherical = this.flyby.coords.toSpherical();
        return `${spherical.latitude.toFixed(
            this.angleDecimalPlaces,
        )}° N ${spherical.longitude.toFixed(this.angleDecimalPlaces)}° E`;
    }

    protected time(): string {
        return this.flyby.time.toLocaleDateString('en-us', this.timeFormat);
    }
}
