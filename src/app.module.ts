import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RootComponent } from './app/root/root.component';
import { MapComponent } from './app/map/map.component';
import { HttpClientModule } from '@angular/common/http';
import { SatelliteSpriteComponent } from './app/satellite-sprite/satellite-sprite.component';

@NgModule({
  declarations: [
    RootComponent,
    MapComponent,
    SatelliteSpriteComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [RootComponent]
})
export class AppModule { }
