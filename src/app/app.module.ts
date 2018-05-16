import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { SceneComponent } from './scene/scene.component';
import { LoadStlComponent } from './load-stl/load-stl.component';


@NgModule({
  declarations: [
    AppComponent,
    SceneComponent,
    LoadStlComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
