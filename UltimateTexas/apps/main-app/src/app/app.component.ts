import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ToastsListComponent } from './components/toasts-list/toasts-list.component';

@Component({
  imports: [CommonModule, RouterModule, HeaderComponent, ToastsListComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent { }
