import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DisplayCardComponent } from '../../components/display-card/display-card.component';
import { GetNumberComponent } from '../../components/get-number/get-number.component';
import { RectangleBtnComponent } from '../../components/rectangle-btn/rectangle-btn.component';
import { SwitchComponent } from '../../components/switch/switch.component';
import { calculateBestHand, compareHands, Hand, HandRank, HandResult } from '../../interfaces/calc-hand.function';
import { Card } from '../../interfaces/card.interfcae';
import { BetStage, BlindPayout, HandState, INIT_PlayerSpot, Payout, PlayerSpot, TripsPayout } from '../../interfaces/hand.interface';
import { GetCardesService } from '../../services/get-cards.service';

@Component({
  selector: 'app-main',
  imports: [CommonModule, DisplayCardComponent, SwitchComponent, GetNumberComponent, RectangleBtnComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {

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


  constructor(
    private router: Router,
    private getCardsService: GetCardesService) {
    for (let i = 0; i < 4; i++) {
      this.playerSpots[i] = INIT_PlayerSpot();
    }

    for (let i = 0; i < 15; i++) {
      console.log(i + ") ", this.getCardsService.getRandomCard(true))
    }
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
        this.updatesBalanace(spot);
        spot.betStage = BetStage.HandOver;
      }
    })
  }

  updatesBalanace(spot: PlayerSpot) {
    spot.totalProfit = spot.tripsProfit + spot.anteProfit + spot.blindProfit + spot.playProfit;
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

  batch() {
    this.router.navigateByUrl("/batch");
  }
}


