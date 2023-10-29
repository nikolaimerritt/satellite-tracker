import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RootComponent } from './app/root/root.component';
import { MapComponent } from './app/map/map.component';
import { HttpClientModule } from '@angular/common/http';
import { SatelliteComponent } from './app/satellite/satellite.component';
import { FooComponent } from './app/foo/foo.component';

@NgModule({
  declarations: [
    RootComponent,
    MapComponent,
    SatelliteComponent,
    FooComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [RootComponent]
})
export class AppModule { }
