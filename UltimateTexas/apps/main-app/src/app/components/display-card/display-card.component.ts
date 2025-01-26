import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../interfaces/card.interfcae';

@Component({
  selector: 'app-display-card',
  imports: [CommonModule],
  templateUrl: './display-card.component.html',
  styleUrl: './display-card.component.scss',
})
export class DisplayCardComponent {
  @Input() card: Card | null = null

  getImgName() {
    if (this.card) {
      if (this.card.isOpen) {
        let value: string = this.card.cardValue < 10 ? "0" + this.card.cardValue : "" + this.card.cardValue
        return "/cards/" + this.card.cardSign + "-" + value + ".svg";
      } else {
        return "/cards/2B.svg"
      }
    }

    return "";
  }

}
