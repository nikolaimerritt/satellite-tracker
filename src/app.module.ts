import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RootComponent } from './app/root/root.component';
import { MapComponent } from './app/map/map.component';
import { HttpClientModule } from '@angular/common/http';
import { SatelliteSpriteComponent } from './app/satellite-sprite/satellite-sprite.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [RootComponent, MapComponent, SatelliteSpriteComponent],
    imports: [BrowserModule, HttpClientModule, BrowserAnimationsModule],
    providers: [],
    bootstrap: [RootComponent],
})
export class AppModule {}
