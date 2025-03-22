import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpressBonusPayout, HandState, NovoIteration, NovoPayout, Payout } from '../../interfaces/hand.interface';
import { Card, CardSign } from '../../interfaces/card.interfcae';
import { DisplayCardComponent } from '../display-card/display-card.component';
import { GetNumberComponent } from '../get-number/get-number.component';
import { RectangleBtnComponent } from '../rectangle-btn/rectangle-btn.component';
import { Router } from '@angular/router';
import { GetCardesService } from '../../services/get-cards.service';
import { PalyingModeService, PlayingMode } from '../../services/playing-mode.service';
import { calculateBestHand, calculateExpressBonus, compareHands, ExpressBonusHand, ExpressBonusRank, Hand, HandRank, HandResult, isAceKing } from '../../interfaces/calc-hand.function';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

export enum NovoHandState {
  NotStarted = 1,
  GotCards = 2,
  ReplacedCards = 3,
  Bet = 4
}

@Component({
  selector: 'app-novo-poker',
  imports: [CommonModule, DisplayCardComponent, GetNumberComponent, RectangleBtnComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './novo-poker.component.html',
  styleUrl: './novo-poker.component.scss',
})
export class NovoPokerComponent {
  public expressBonusPayout = ExpressBonusPayout;
  public novoPayout = NovoPayout;

  public dealerCards: (Card | null)[] = [null, null, null, null, null];
  public playerCards: (Card | null)[] = [null, null, null, null, null];

  public playerHand: (Hand | null) = null;
  public dealerHand: (Hand | null) = null;
  public handsHistory: NovoIteration[] = []

  public insurance: number = 0;
  public ante: number = 0;
  public expressBonus: number = 0;
  public expressBonusProfit: number = 0;
  public dealerBonusProfit: number = 0;
  public dealerBonus: number = 0;
  public bet: number = 0;
  public totalBet: number = 0;

  public expressBonusBalance: number = 0;
  public dealerBonusBalance: number = 0;
  public insuranaceBalance: number = 0;
  public totalReplacment: number = 0;
  public totalBalance: number = 0;

  public maxInsurance: number = 0;
  public expectedProfit: number = 0;
  public handProfit: number = 0;

  public handState: NovoHandState = NovoHandState.NotStarted;
  public novoHandState = NovoHandState;
  public isValidBet: boolean = false;
  public isCardsChosen: boolean = false;
  public isQualified: boolean = false;

  public isValidInsurance: boolean = true;
  public expressBonusHand: ExpressBonusHand | null = null
  public dealerBonusHand: ExpressBonusHand | null = null
  public playerHandDescription: string = "";

  public handResult: HandResult = HandResult.Tie;
  public HandResult = HandResult;
  public totalWins: number = 0;
  public totalLosses: number = 0;
  public totalTies: number = 0;
  public totalNotQualified: number = 0;
  public presentResults: boolean = false;

  public iteration: FormControl = new FormControl<number>(0);
  public isRunning: boolean = false;
  public expressBonusIteration: ExpressBonusHand[] = [];
  public expBonusPayout: Payout[] = [];
  public qualified: number = 0
  public notQualified: number = 0
  public totalBonusHands: number = 0;
  public totalBonusProfit: number = 0;

  constructor(
    private router: Router,
    private getCardsService: GetCardesService,
    public playingModeService: PalyingModeService) { }

  setValidation() {
    this.totalBet = this.ante + this.expressBonus + this.dealerBonus;

    this.isValidBet = true;
    if (this.ante == 0) {
      this.isValidBet = false;
    }

    if (this.expressBonus > 0 && this.expressBonus > this.ante) {
      this.isValidBet = false;
    }

    if (this.dealerBonus > 0 && this.dealerBonus > this.ante) {
      this.isValidBet = false;
    }
  }

  deal() {
    this.totalBet = this.ante + this.expressBonus + this.dealerBonus;
    this.isCardsChosen = false;
    this.isValidInsurance = true;
    this.presentResults = false;
    this.expressBonusProfit = 0;
    this.dealerBonusProfit = 0;
    this.expectedProfit = 0;
    this.maxInsurance = 0;
    this.bet = 0;
    this.insurance = 0
    this.handProfit = 0;
    this.dealerHand = null;
    this.playerHand = null;

    this.getCardsService.reShuffeleCard();
    this.dealerCards = [null, null, null, null, null]
    this.playerCards = [null, null, null, null, null]
    this.handState = NovoHandState.GotCards;
    console.log("playerCards===>", this.playerCards)

    for (let i = 0; i < 5; i++) {
      this.dealerCards[i] = this.getCardsService.getRandomCard(false)
      this.playerCards[i] = this.getCardsService.getRandomCard(true)
    }

    this.dealerCards[0]!.isOpen = true;

    this.expressBonusHand = calculateExpressBonus(this.playerCards as Card[]);

    this.handleExpressBonus(this.expressBonusHand, true);
    this.playerHand = calculateBestHand(this.playerCards as Card[]);
    this.playerCards = [...this.playerHand.cards];

    this.playerHandDescription = this.playerHand.handDescription;

    let handFactor = 0;
    if (this.playerHand.rank > HandRank.HighCard) {
      handFactor = this.novoPayout.find(payout => payout.handRank === this.playerHand?.rank)!.payoutFactor;
    }

    if (isAceKing(this.playerCards as Card[])) {
      if (this.playerHand.rank > HandRank.HighCard) {
        this.playerHandDescription += " / Ace - King"
        handFactor++;
      } else {
        this.playerHandDescription = "Ace - King"
      }
    }

    this.expectedProfit = this.ante * 2 * handFactor;
    if (handFactor > 1) {
      this.maxInsurance = this.expectedProfit / 2;
    }
    console.log("handFactor===>", handFactor, this.maxInsurance)
  }

  handleExpressBonus(expressBonus: ExpressBonusHand, isUserBonus: boolean) {
    if (expressBonus.rank === ExpressBonusRank.NoBonus) {
      if (isUserBonus) {
        this.expressBonusProfit = -this.expressBonus
      } else {
        this.dealerBonusProfit = -this.dealerBonus
      }
    } else {
      let bonusFactor = this.expressBonusPayout.find(payout => payout.handRank === expressBonus.rank)!.payoutFactor;
      if (isUserBonus) {
        this.expressBonusProfit = this.expressBonus * bonusFactor;
      } else {
        this.dealerBonusProfit = this.dealerBonus * bonusFactor;
      }
    }

    if (isUserBonus) {
      this.expressBonusBalance += this.expressBonusProfit;
      this.totalBalance += this.expressBonusProfit;
      this.handProfit += this.expressBonusProfit;
    } else {
      this.dealerBonusBalance += this.dealerBonusProfit;
      this.totalBalance += this.dealerBonusProfit;
      this.handProfit += this.dealerBonusProfit;
    }
  }

  setBet() {
    this.handState = NovoHandState.Bet
    this.bet = this.ante * 2;
    this.totalBet += this.bet;

    this.dealerCards.forEach(card => card!.isOpen = true);

    this.dealerBonusHand = calculateExpressBonus(this.dealerCards as Card[]);

    this.handleExpressBonus(this.dealerBonusHand, false);
    this.dealerHand = calculateBestHand(this.dealerCards as Card[]);
    this.dealerCards = [...this.dealerHand.cards];

    if (this.dealerHand.rank === HandRank.HighCard) {
      if (isAceKing(this.dealerCards as Card[])) {
        this.dealerHand.handDescription += " - Qualified"
        this.isQualified = true;
      } else {
        this.dealerHand.handDescription += " - Not Qualified"
        this.isQualified = false;
        this.presentResults = true;
      }
    } else {
      this.dealerHand.handDescription += " - Qualified"
      this.isQualified = true;
    }

    if (this.isQualified) {
      this.handleResults();
    } else {
      this.totalNotQualified++;
      this.handResult = HandResult.NotQulified;

      if (this.insurance > 0) {
        this.handProfit += this.insurance;
        this.totalBalance += this.insurance;
        this.insuranaceBalance += this.insurance;
        this.insurance = 0
      }
    }
  }

  handleResults() {
    this.handProfit -= this.insurance;
    this.totalBalance -= this.insurance;
    this.insuranaceBalance -= this.insurance;
    this.insurance = 0
    this.presentResults = true;
    this.handResult = compareHands(this.playerHand as Hand, this.dealerHand as Hand);

    switch (this.handResult) {
      case HandResult.PlayerLoss:
        this.totalLosses++;
        this.handProfit -= (this.ante + this.bet);
        this.totalBalance -= (this.ante + this.bet);
        break;
      case HandResult.PlayerWin:
        this.totalWins++;
        this.handProfit += this.expectedProfit;
        this.totalBalance += this.expectedProfit;
        break;
      case HandResult.Tie:
        this.totalTies++;
        break;
    }
    this.handState = NovoHandState.NotStarted;
  }

  drop() {
    this.handState = NovoHandState.NotStarted;

    this.dealerCards.forEach(card => card!.isOpen = true);

    this.dealerBonusHand = calculateExpressBonus(this.dealerCards as Card[]);

    this.handleExpressBonus(this.dealerBonusHand, false);
    this.dealerHand = calculateBestHand(this.dealerCards as Card[]);
    this.dealerCards = [...this.dealerHand.cards];

    this.handResult = HandResult.PlayerLoss;
    this.totalLosses++;
    this.handProfit -= this.ante;
    this.totalBalance -= this.ante;
  }

  replaceCard() {
    this.totalBet += this.ante;
    this.handProfit -= this.ante;
    this.totalBalance -= this.ante;
    this.totalReplacment -= this.ante;
    let newPlayerCards: (Card | null)[] = [];

    this.playerCards.forEach(card => {
      if (card?.isOpen) {
        newPlayerCards.push(card);
      } else {
        newPlayerCards.push(this.getCardsService.getRandomCard(true));
      }
    })

    this.playerHand = calculateBestHand(newPlayerCards as Card[]);
    this.playerCards = [...this.playerHand.cards]

    this.handState = NovoHandState.ReplacedCards;

    this.playerHandDescription = this.playerHand.handDescription;

    let handFactor = 0;
    if (this.playerHand.rank > HandRank.HighCard) {
      handFactor = this.novoPayout.find(payout => payout.handRank === this.playerHand?.rank)!.payoutFactor;
    }

    if (isAceKing(this.playerCards as Card[])) {
      if (this.playerHand.rank > HandRank.HighCard) {
        this.playerHandDescription += " / Ace - King"
        handFactor++;
      } else {
        this.playerHandDescription = "Ace - King"
      }
    }

    this.expectedProfit = this.ante * 2 * handFactor;
    if (handFactor > 1) {
      this.maxInsurance = this.expectedProfit / 2;
    }
  }

  getOneCard() {
    this.totalBet += this.ante;
    this.handProfit -= this.ante;
    this.totalBalance -= this.ante;
    this.totalReplacment -= this.ante;

    this.playerCards.push(this.getCardsService.getRandomCard(true))
    this.handState = NovoHandState.ReplacedCards;
    let hands: Hand[] = [];
    for (let i = 0; i < this.playerCards.length; i++) {
      let cards = [...this.playerCards]
      cards.splice(i, 1);

      hands.push(calculateBestHand(cards as Card[]))
    }

    const relevantHands = hands.filter(hand => hand.rank > HandRank.HighCard);
    console.log("cards====>", hands);
    const sortedHands = relevantHands.sort((a, b) => b.rank - a.rank)
    const uniqueHands = Array.from(new Map(sortedHands.map(hand => [hand.handDescription, hand])).values());

    console.log("unique====>", uniqueHands);

    const finalHands: Hand[] = []

    this.playerHand = calculateBestHand(this.playerCards as Card[]);
    finalHands.push(uniqueHands[0]);

    if (uniqueHands.length > 1) {
      switch (uniqueHands[0].rank) {
        case HandRank.HighCard:
        case HandRank.Pair:
        case HandRank.Trips:
          break;
        case HandRank.TwoPairs:
          if (uniqueHands[1].rank == HandRank.TwoPairs) {
            finalHands.push(uniqueHands[1]);
          }
          break;
        case HandRank.Straight:
        case HandRank.Flush:
          finalHands.push(uniqueHands[1]);
          break;
        case HandRank.FullHouse:
        case HandRank.Quads:
          if (uniqueHands[1].rank == HandRank.FullHouse) {
            finalHands.push(uniqueHands[1]);
          }
          break;
        case HandRank.StraightFlush:
        case HandRank.RoyalFlush:
          finalHands.push(uniqueHands[1]);
          break;
      }
    }

    let handFactor = 0;
    if (finalHands.length > 1) {
      this.playerHandDescription = finalHands[0].handDescription + " / " + finalHands[1].handDescription
      handFactor = this.novoPayout.find(payout => payout.handRank === finalHands[0].rank)!.payoutFactor;
      handFactor += this.novoPayout.find(payout => payout.handRank === finalHands[1].rank)!.payoutFactor;
      this.expectedProfit = this.ante * 2 * handFactor;

    } else {
      this.playerHandDescription = finalHands[0].handDescription
      handFactor = 0;
      if (finalHands[0].rank > HandRank.HighCard) {
        handFactor = this.novoPayout.find(payout => payout.handRank === finalHands[0].rank)!.payoutFactor;
      }

      if (isAceKing(this.playerCards as Card[])) {
        if (finalHands[0].rank > HandRank.HighCard) {
          this.playerHandDescription += " / Ace - King"
          handFactor++;
        } else {
          this.playerHandDescription = "Ace - King"
        }
      }
      this.expectedProfit = this.ante * 2 * handFactor;
    }

    console.log("final====>", finalHands, handFactor);
    if (handFactor > 1) {
      this.maxInsurance = this.expectedProfit / 2;
    }
  }

  chooseCard(card: Card | null) {
    console.log("chooseCard===>", card);
    if (card) {
      card.isOpen = !card.isOpen
    }

    this.isCardsChosen = false;
    let noOfChosenCards = 0;
    this.playerCards.forEach(card => {
      if (!card?.isOpen) {
        noOfChosenCards++;
      }
    })

    if (noOfChosenCards > 1) {
      this.isCardsChosen = true;
    }
  }

  checkInsurance() {
    if (this.maxInsurance && this.insurance) {
      if (this.insurance >= this.ante * 2 && this.insurance <= this.maxInsurance) {
        this.isValidInsurance = true;
      } else {
        this.isValidInsurance = false;
      }
    } else {
      this.isValidInsurance = true;
    }
  }

  dealerCard() {
    this.totalBet += this.ante;
    this.handProfit -= this.ante;
    this.totalBalance -= this.ante;
    this.dealerCards[0] = this.getCardsService.getRandomCard(true)

    this.dealerHand = calculateBestHand(this.dealerCards as Card[]);
    this.dealerCards = [...this.dealerHand.cards];

    if (this.dealerHand.rank === HandRank.HighCard) {
      if (isAceKing(this.dealerCards as Card[])) {
        this.dealerHand.handDescription += " - Qualified"
        this.isQualified = true;
      } else {
        this.dealerHand.handDescription += " - Not Qualified"
        this.isQualified = false;
        this.presentResults = true;
      }
    } else {
      this.dealerHand.handDescription += " - Qualified"
      this.isQualified = true;
    }

    if (this.isQualified) {
      this.handleResults();
    }
    this.handState = NovoHandState.NotStarted;
  }

  getAnte() {
    this.handProfit += this.ante;
    this.totalBalance += this.ante;
    this.handState = NovoHandState.NotStarted;

  }

  start() {
    this.isRunning = true;
    this.qualified = 0;
    this.notQualified = 0;
    this.expressBonusIteration = [];
    this.totalBonusHands = 0;
    this.totalBonusProfit = 0;
    this.expBonusPayout = JSON.parse(JSON.stringify(ExpressBonusPayout));

    console.log("qualified====>", this.qualified);
    console.log("not qualified====>", this.notQualified);
    for (let i = 0; i < this.iteration.value; i++) {
      this.getCardsService.reShuffeleCard();
      let cards: (Card | null)[] = [null, null, null, null, null];;

      for (let j = 0; j < 5; j++) {
        cards[j] = this.getCardsService.getRandomCard(true)
      }
      let expressBonusHand = calculateExpressBonus(cards as Card[]);
      this.expressBonusIteration.push(expressBonusHand);

      let payoutIndex = this.expBonusPayout.findIndex(payout => payout.handRank == expressBonusHand.rank)
      if (payoutIndex >= 0) {
        this.expBonusPayout[payoutIndex].appearance++
        this.totalBonusHands++;
        this.totalBonusProfit += this.expBonusPayout[payoutIndex].payoutFactor;
      }

      let hand = calculateBestHand(cards as Card[]);
      if (hand.rank === HandRank.HighCard) {
        if (isAceKing(cards as Card[])) {
          this.qualified++;
        } else {
          this.notQualified++;
        }
      } else {
        this.qualified++;
      }
    }
    console.log("qualified====>", this.qualified);
    console.log("not qualified====>", this.notQualified);

    this.isRunning = false;
  }

  ultimate() {
    this.playingModeService.currectMode = PlayingMode.Ultimate;
    this.router.navigateByUrl("/main");
  }
}
