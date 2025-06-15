import { Component, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetCardesService } from '../../services/get-cards.service';
import { Card } from '../../interfaces/card.interfcae';
import { DisplayCardComponent } from '../display-card/display-card.component';
import { RectangleBtnComponent } from '../rectangle-btn/rectangle-btn.component';

@Component({
  selector: 'app-choose-cards',
  imports: [CommonModule, DisplayCardComponent, RectangleBtnComponent],
  templateUrl: './choose-cards.component.html',
  styleUrl: './choose-cards.component.scss',
})
export class ChooseCardsComponent {


  @Input() title: string = "";
  @Input() numOfCards: number = 0;
  public allCards: Card[] = [];
  public chosenCards: Card[] = []
  public isDataReady: boolean = false;

  public onCloseDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  public onCompleted: EventEmitter<Card[]> = new EventEmitter<Card[]>();

  constructor(private getCardsService: GetCardesService) { }

  onOk() {
    this.allCards = this.getCardsService.getAllCards();
    this.isDataReady = true
  }

  onCardClicked(cardNum: number) {
    if (this.allCards[cardNum].isOpen && this.chosenCards.length < this.numOfCards) {

      this.allCards[cardNum].isOpen = false;
      this.chosenCards.push(this.getCardsService.getCard(cardNum, true));
    }
  }

  onDechooseCard(cardIndex: number) {
    this.allCards[this.chosenCards[cardIndex].cardIndex].isOpen = true;
    this.chosenCards.splice(cardIndex, 1);
  }

  done() {
    this.onCloseDialog.emit(true);

    this.chosenCards.forEach(card => this.getCardsService.markCardAsUsed(card.cardIndex));
    this.onCompleted.emit(this.chosenCards);
  }
}
