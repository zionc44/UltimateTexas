import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PalyingModeService, PlayingMode } from '../../services/playing-mode.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public PlayingMode = PlayingMode;
  constructor(public playingModeService: PalyingModeService) { }
}
