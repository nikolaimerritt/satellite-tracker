import { Component, Input } from '@angular/core';
import { Satellite } from './satellite';
import { Location } from './satellite';

interface ScreenPos {
    x: number,
    y: number,
}

@Component({
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent {
    @Input() satellites!: Satellite[];

    protected readonly dimensions = { 
        width: 1024, 
        height: 1024,
    };

    protected ngOnInit() {
        for (const location of [{ latitude: 89, longitude: -180 }, { latitude: -89, longitude: 180 }]) {
            console.log("Location to screen pos", location, this.locationToScreenPosition(location));
        }
    }

    protected locationToScreenPosition(location: Location): ScreenPos {
        const x = (location.longitude + 180) * this.dimensions.width / 360;
        const latitudeRadians = location.latitude * Math.PI / 180;
        const mercatorFactor = Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2));
        const y = this.dimensions.height / 2 - this.dimensions.width * mercatorFactor / (2 * Math.PI);
        return { x, y };
    }
}
