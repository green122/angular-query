import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { SecondComponent } from './second/second.component';
import { RouterModule } from '@angular/router';
import { FirstComponent } from './first/first.component';

@NgModule({
  declarations: [AppComponent, SecondComponent, FirstComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', component: FirstComponent },
      { path: 'person/:id', component: SecondComponent },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
