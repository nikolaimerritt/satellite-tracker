import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RootComponent } from './app/root/root.component';
import { MapComponent } from './app/map/map.component';
import { HttpClientModule } from '@angular/common/http';
import { SatelliteSpriteComponent } from './app/satellite-sprite/satellite-sprite.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigService } from './app/config.service';

@NgModule({
    declarations: [RootComponent, MapComponent, SatelliteSpriteComponent],
    imports: [BrowserModule, HttpClientModule, BrowserAnimationsModule],
    providers: [
        ConfigService,
        {
            provide: APP_INITIALIZER,
            useFactory: (configService: ConfigService) => () =>
                configService.load(),
            multi: true,
            deps: [ConfigService],
        },
    ],
    bootstrap: [RootComponent],
})
export class AppModule {}
