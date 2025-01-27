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
import { calculateBestHand, compareHands, Hand, HandRank, HandResult } from './interfaces/calc-hand.function';

@Component({
  imports: [CommonModule, DisplayCardComponent, HeaderComponent, SwitchComponent, GetNumberComponent, RectangleBtnComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {

  public tripsPayout: Payout[] = TripsPayout;
  public blindPayout: Payout[] = BlindPayout;
  public cards: Card[] = [];
  public dealerCards: (Card | null)[] = [null, null];
  public communityCards: (Card | null)[] = [null, null, null, null, null];
  public playerSpots: PlayerSpot[] = Array(4).fill(INIT_PlayerSpot());
  public handStage: HandState = HandState.NotStarted;
  public HandState = HandState;
  public BetStage = BetStage;
  public HandResult = HandResult;
  public isInvalid: boolean = true;
  public isAllDecided: boolean = false;
  public dealerHand: Hand | null = null;

  c1 = [
    {
      "cardIndex": 48,
      "cardSign": "S",
      "cardValue": 10,
      "isOpen": true
    },
    {
      "cardIndex": 19,
      "cardSign": "D",
      "cardValue": 7,
      "isOpen": true
    },
    {
      "cardIndex": 29,
      "cardSign": "H",
      "cardValue": 4,
      "isOpen": true
    },
    {
      "cardIndex": 16,
      "cardSign": "D",
      "cardValue": 4,
      "isOpen": true
    },
    {
      "cardIndex": 24,
      "cardSign": "D",
      "cardValue": 12,
      "isOpen": true
    },
    {
      "cardIndex": 49,
      "cardSign": "S",
      "cardValue": 11,
      "isOpen": true
    },
    {
      "cardIndex": 35,
      "cardSign": "H",
      "cardValue": 10,
      "isOpen": true
    }
  ]
  c2 = [
    {
      "cardIndex": 0,
      "cardSign": "C",
      "cardValue": 14,
      "isOpen": true
    },
    {
      "cardIndex": 1,
      "cardSign": "C",
      "cardValue": 2,
      "isOpen": true
    },
    {
      "cardIndex": 29,
      "cardSign": "H",
      "cardValue": 4,
      "isOpen": true
    },
    {
      "cardIndex": 16,
      "cardSign": "D",
      "cardValue": 4,
      "isOpen": true
    },
    {
      "cardIndex": 24,
      "cardSign": "D",
      "cardValue": 12,
      "isOpen": true
    },
    {
      "cardIndex": 49,
      "cardSign": "S",
      "cardValue": 11,
      "isOpen": true
    },
    {
      "cardIndex": 35,
      "cardSign": "H",
      "cardValue": 10,
      "isOpen": true
    }
  ]

  constructor(private getCardsService: GetCardesService) {
    for (let i = 0; i < 4; i++) {
      this.playerSpots[i] = INIT_PlayerSpot();
    }

    let h1 = calculateBestHand(this.c1 as Card[])
    let h2 = calculateBestHand(this.c2 as Card[])

    console.log("h1=====>", h1);
    console.log("h2=====>", h2);

    let res = compareHands(h1, h2);

    console.log("res=====>", res);

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
    this.calculatePlayerSpotsResults();
  }

  calculatePlayerSpotsResults() {
    this.playerSpots.forEach(spot => {
      if (spot.isActive) {
        spot.totalHands++;
        if (spot.betStage === BetStage.Fold) {
          spot.currentHandResult = HandResult.PlayerLoss
        } else {
          spot.currentHandResult = compareHands(spot.currentHand as Hand, this.dealerHand as Hand);
        }
        this.calcTrips(spot);
        this.calcBlind(spot);
        this.calcAnteAndPlay(spot);
        spot.totalProfit = spot.tripsProfit + spot.anteProfit + spot.blindProfit + spot.playProfit;
        this.updatesBalanace(spot);
        spot.betStage = BetStage.HandOver;
      }
    })
  }
  updatesBalanace(spot: PlayerSpot) {
    spot.tripsBalance += spot.tripsProfit;
    spot.anteBalance += spot.anteProfit;
    spot.blindBalance += spot.blindProfit;

    switch (spot.betStage) {
      case BetStage.PreFlop:
        spot.preFlopBalance += spot.playProfit;
        break;
      case BetStage.AfterFlop:
        spot.flopBalance += spot.playProfit;
        break;
      case BetStage.AfterRiver:
        spot.riverBalance += spot.playProfit;
        break;
    }

    spot.totalBalance += spot.totalProfit;
  }

  calcBlind(spot: PlayerSpot) {
    switch (spot.currentHandResult) {
      case HandResult.PlayerWin:
        if (spot.currentHand!.rank >= HandRank.Straight) {
          let blindFactor = this.blindPayout.find(payout => payout.handRank === spot.currentHand!.rank)!.payoutFactor;
          spot.blindProfit += spot.ante * blindFactor;
        } else {
          spot.blindProfit = 0;
        }

        break;
      case HandResult.PlayerLoss:
        spot.blindProfit -= spot.ante;
        break;
      case HandResult.Tie:
        spot.blindProfit = 0;
        break;
    }
  }

  calcAnteAndPlay(spot: PlayerSpot) {
    let realAnte = this.dealerHand?.rank != HandRank.HighCard ? spot.ante : (spot.betStage === BetStage.Fold ? spot.ante : 0)
    switch (spot.currentHandResult) {
      case HandResult.PlayerWin:
        spot.anteProfit += realAnte;
        spot.playProfit += spot.play;
        spot.wins++;
        break;
      case HandResult.PlayerLoss:
        spot.anteProfit -= realAnte;
        spot.playProfit -= spot.play;
        spot.losses++
        break;
      case HandResult.Tie:
        spot.playProfit = 0;
        spot.ties++
        break;
    }
  }



  calcTrips(spot: PlayerSpot) {
    if (spot.trips > 0 && spot.currentHand!.rank >= HandRank.Trips) {
      let tripsFactor = this.tripsPayout.find(payout => payout.handRank === spot.currentHand!.rank)!.payoutFactor;
      spot.tripsProfit = spot.trips * tripsFactor;
    } else {
      spot.tripsProfit = -spot.trips
    }
  }

  nextHand() {
    this.handStage = HandState.NotStarted
    this.dealerCards = [null, null];
    this.dealerHand = null;
    this.communityCards = [null, null, null, null, null];

    this.playerSpots.forEach(spot => {
      spot.cards = [null, null];
      spot.play = 0;
      spot.blindProfit = 0;
      spot.anteProfit = 0;
      spot.blindProfit = 0;
      spot.playProfit = 0;
      spot.totalProfit = 0;

      spot.totalBet = spot.trips + (spot.ante * 2) + spot.play
      spot.betStage = BetStage.NoBet
      spot.currentHand = null;
      spot.currentHandResult = HandResult.Tie;
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
    this.isInvalid = !isOneSpotActive && !isMissingAnte;
    console.log("isInvalid====>", this.isInvalid);
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


