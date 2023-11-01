import {
    Component,
    Input,
    Output,
    ElementRef,
    EventEmitter,
    HostListener,
} from '@angular/core';

@Component({
    selector: 'satellite-sprite',
    templateUrl: './satellite-sprite.component.html',
    styleUrls: ['./satellite-sprite.component.scss'],
})
export class SatelliteSpriteComponent {
    @Input() public name!: string;
    @Output() public elementChange = new EventEmitter<ElementRef>();

    protected clicked = false;

    public constructor(private element: ElementRef) {}

    public ngAfterViewInit() {
        this.elementChange.emit(this.element);
    }

    @HostListener('click', ['$event'])
    @HostListener('document:click', ['$event'])
    onClick(click: MouseEvent) {
        this.clicked = this.element.nativeElement.contains(click.target);
    }
}
