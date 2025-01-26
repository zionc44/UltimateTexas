import { Injectable } from '@angular/core';
import { Card, CardSign } from '../interfaces/card.interfcae';


@Injectable({
  providedIn: 'root'
})


export class GetCardesService {
  private numOfCards: number = 0;
  private cradsPack: boolean[] = Array(52).fill(false);
  constructor() { }

  public getRandomCard(isOpen: boolean): Card | null {
    if (this.numOfCards < 52) {

      let card = Math.floor(Math.random() * 52);

      while (this.cradsPack[card]) {
        card = Math.floor(Math.random() * 52);
      }
      this.cradsPack[card] = true;
      this.numOfCards++;
      return this.getCard(card, isOpen);
    }
    return null;
  }

  public reShuffeleCard() {
    this.numOfCards = 0;
    this.cradsPack = Array(52).fill(false);
  }

  private getCard(cardIndex: number, isOpen: boolean): Card {
    return {
      cardIndex: cardIndex,
      cardSign: this.getCardSign(Math.floor(cardIndex / 13)),
      cardValue: (cardIndex % 13 + 1) == 1 ? 14 : cardIndex % 13 + 1,
      isOpen: isOpen
    }
  }

  private getCardSign(sign: number): CardSign {
    switch (sign) {
      case 0:
        return CardSign.CLUB;
      case 1:
        return CardSign.DIAMOND;
      case 2:
        return CardSign.HEART;
      default:
        return CardSign.SPADE;
    }
  }
}
