import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DisplayCardComponent } from './components/display-card/display-card.component';
import { HeaderComponent } from './components/header/header.component';
import { SwitchComponent } from './components/switch/switch.component';
import { Card } from './interfaces/card.interfcae';
import { BetStage, BlindPayout, HandState, INIT_PlayerSpot, Payout, PlayerSpot, TripsPayout } from './interfaces/hand.interface';
import { GetCardesService } from './services/get-cards.service';
import { GetNumberComponent } from './components/get-number/get-number.component';
import { RectangleBtnComponent } from './components/rectangle-btn/rectangle-btn.component';
import { calculateBestHand, Hand } from './interfaces/calc-hand.function';

@Component({
  imports: [CommonModule, DisplayCardComponent, HeaderComponent, SwitchComponent, GetNumberComponent, RectangleBtnComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {

  public tripsPatout: Payout[] = TripsPayout;
  public blindPatout: Payout[] = BlindPayout;
  public cards: Card[] = [];
  public dealerCards: (Card | null)[] = [null, null];
  public communityCards: (Card | null)[] = [null, null, null, null, null];
  public playerSpots: PlayerSpot[] = Array(4).fill(INIT_PlayerSpot());
  public handStage: HandState = HandState.NotStarted;
  public HandState = HandState;
  public BetStage = BetStage;
  public isInvalid: boolean = true;
  public isAllDecided: boolean = false;
  public dealerHand: Hand | null = null;

  public x = [
    {
      "cardIndex": 41,
      "cardSign": "S",
      "cardValue": 3,
      "isOpen": true
    },
    {
      "cardIndex": 14,
      "cardSign": "D",
      "cardValue": 9,
      "isOpen": true
    },
    {
      "cardIndex": 39,
      "cardSign": "S",
      "cardValue": 14,
      "isOpen": true
    },
    {
      "cardIndex": 20,
      "cardSign": "D",
      "cardValue": 8,
      "isOpen": true
    },
    {
      "cardIndex": 13,
      "cardSign": "D",
      "cardValue": 14,
      "isOpen": true
    },
    {
      "cardIndex": 15,
      "cardSign": "D",
      "cardValue": 3,
      "isOpen": true
    },
    {
      "cardIndex": 7,
      "cardSign": "C",
      "cardValue": 8,
      "isOpen": true
    }
  ]

  constructor(private getCardsService: GetCardesService) {
    for (let i = 0; i < 4; i++) {
      this.playerSpots[i] = INIT_PlayerSpot();
    }

    console.log("x====>", this.x)
    console.log("constructor====>", calculateBestHand(this.x as Card[]))
  }

  getRandomCard() {
    let card = this.getCardsService.getRandomCard(true)
    if (card) {
      console.log("card====>", card)
      this.cards.push(card);
      let newCard = JSON.parse(JSON.stringify(card)) as Card;
      newCard.isOpen = false;
      this.dealerCards[0] = newCard;
    }
  }

  reShuffeleCard() {
    this.getCardsService.reShuffeleCard();

    if (this.dealerCards[0]) {
      this.dealerCards[0].isOpen = true;
    }

    this.cards = [];
  }

  deal() {
    this.handStage = HandState.PreFlop
    for (let i = 0; i < 5; i++) {
      this.communityCards[i] = this.getCardsService.getRandomCard(false)
    }

    this.playerSpots.forEach(spot => {
      if (spot.isActive) {
        spot.cards[0] = this.getCardsService.getRandomCard(true)
        spot.cards[1] = this.getCardsService.getRandomCard(true)

        spot.currentHand = calculateBestHand(spot.cards as Card[]);
      }
    })

    this.dealerCards[0] = this.getCardsService.getRandomCard(false)
    this.dealerCards[1] = this.getCardsService.getRandomCard(false)
  }


  flop() {
    this.handStage = HandState.AfterFlop
    for (let i = 0; i < 3; i++) {
      this.communityCards[i]!.isOpen = true
    }

    this.playerSpots.forEach(spot => {
      if (spot.isActive) {
        let cardsList: (Card | null)[] = [...spot.cards, ...this.communityCards.filter(card => card?.isOpen)];
        spot.currentHand = calculateBestHand(cardsList as Card[]);
      }
    })
  }

  river() {
    this.handStage = HandState.AfterRiver
    for (let i = 2; i < 5; i++) {
      this.communityCards[i]!.isOpen = true
    }

    this.playerSpots.forEach((spot, index) => {
      if (spot.isActive) {
        let cardsList: (Card | null)[] = [...spot.cards, ...this.communityCards.filter(card => card?.isOpen)];
        spot.currentHand = calculateBestHand(cardsList as Card[]);
        console.log("hand " + index + "===>", spot.currentHand, cardsList);
      }
    })
  }

  openDealerHand() {
    this.handStage = HandState.DealerHand
    this.dealerCards[0]!.isOpen = true;
    this.dealerCards[1]!.isOpen = true;

    let cardsList: (Card | null)[] = [...this.dealerCards, ...this.communityCards.filter(card => card?.isOpen)];
    this.dealerHand = calculateBestHand(cardsList as Card[]);
    console.log("dealer hands====>", this.dealerHand, cardsList);
  }

  nextHand() {
    this.handStage = HandState.NotStarted
    this.dealerCards = [null, null];
    this.dealerHand = null;
    this.communityCards = [null, null, null, null, null];

    this.playerSpots.forEach(spot => {
      spot.cards = [null, null];
      spot.play = 0;
      spot.totalBet = spot.trips + (spot.ante * 2) + spot.play
      spot.betStage = BetStage.NoBet
    })
    this.getCardsService.reShuffeleCard();
    this.isAllDecided = false;
  }

  setValidation(spot: PlayerSpot) {

    spot.totalBet = spot.trips + (spot.ante * 2) + spot.play
    let isOneSpotActive: boolean = false;
    let isMissingAnte: boolean = false;
    this.playerSpots.forEach(spot => {
      if (spot.isActive) {
        isOneSpotActive = true;

        if (spot.ante === 0) {
          isMissingAnte = true;
        }

      }
    })

    this.isInvalid = isOneSpotActive && isMissingAnte;

  }

  setAllDecided() {
    let isMissingDecition = false;
    this.playerSpots.forEach(spot => {
      if (spot.isActive) {

        if (spot.betStage === BetStage.NoBet) {
          isMissingDecition = true;
        }
      }
    })

    this.isAllDecided = !isMissingDecition;
  }

  cancel(spot: PlayerSpot) {
    spot.betStage = BetStage.NoBet;
    spot.play = 0;
    spot.totalBet = spot.trips + (spot.ante * 2) + spot.play
    this.setAllDecided();
  }

  fold(spot: PlayerSpot) {
    spot.betStage = BetStage.Fold;
    spot.play = 0;
    spot.totalBet = spot.trips + (spot.ante * 2) + spot.play
    this.setAllDecided();
  }

  betX1(spot: PlayerSpot) {
    spot.betStage = BetStage.AfterRiver;
    spot.play = spot.ante
    spot.totalBet = spot.trips + (spot.ante * 2) + spot.play
    this.setAllDecided();
  }

  betX2(spot: PlayerSpot) {
    spot.betStage = BetStage.AfterFlop;
    spot.play = spot.ante * 2
    spot.totalBet = spot.trips + (spot.ante * 2) + spot.play
    this.setAllDecided();
  }

  betX3(spot: PlayerSpot) {
    spot.betStage = BetStage.PreFlop;
    spot.play = spot.ante * 3
    spot.totalBet = spot.trips + (spot.ante * 2) + spot.play
    this.setAllDecided();
  }

  betX4(spot: PlayerSpot) {
    spot.betStage = BetStage.PreFlop;
    spot.play = spot.ante * 4
    spot.totalBet = spot.trips + (spot.ante * 2) + spot.play
    this.setAllDecided();
  }

}
