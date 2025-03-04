import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GetNumberComponent } from '../get-number/get-number.component';
import { RectangleBtnComponent } from '../rectangle-btn/rectangle-btn.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BetOption, BetStage, BlindPayout, ByTheBookStrategy, ConservativeStrategy, HighRiskStrategy, INIT_Iteration, Iteration, Payout, TripsPayout, VeryConservativeStrategy } from '../../interfaces/hand.interface';
import { GetCardesService } from '../../services/get-cards.service';
import { calculateBestHand, compareHands, Hand, HandRank, HandResult } from '../../interfaces/calc-hand.function';
import { Card } from '../../interfaces/card.interfcae';
import { ListOfLinesComponent } from '../list-of-lines/list-of-lines.component';
import { CodeDecode, ColumnType, SortOption, TableColumn } from '../../interfaces/table-column.interface';

@Component({
  selector: 'app-batch-calculation',
  imports: [CommonModule, RectangleBtnComponent, GetNumberComponent, FormsModule, ReactiveFormsModule, ListOfLinesComponent],
  templateUrl: './batch-calculation.component.html',
  styleUrl: './batch-calculation.component.scss',
})

export class BatchCalculationComponent {

  public BetOption = BetOption;
  public trips: number = 0;
  public ante: number = 0;
  public blind: number = 0;
  public play: number = 0;
  public iteration: FormControl = new FormControl<number>(0);
  public isRunning: boolean = false;
  public activeStategy: number = 0;
  public activeIteration: Iteration[] | null = null
  public maxHand: Hand | null = null;

  public readonly betStgaeCodes: CodeDecode[] = [
    { code: 1, decode: "Pre Flop" },
    { code: 2, decode: "After Flop" },
    { code: 3, decode: " After River" },
    { code: 4, decode: "Fold" },
  ]

  public readonly handResultsCodes: CodeDecode[] = [
    { code: 1, decode: "Win" },
    { code: 2, decode: "Loss" },
    { code: 3, decode: " Tie" },
  ]

  public readonly detailsTablesColumns: TableColumn[] = [

    // { columnOrder: 10, columnName: "trips", columnTitle: "Trips", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [] },
    // { columnOrder: 20, columnName: "ante", columnTitle: "Ante", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [] },
    // { columnOrder: 30, columnName: "blind", columnTitle: "Blind", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [] },
    { columnOrder: 30, columnName: "handId", columnTitle: "Hand Id", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NotSort },
    { columnOrder: 40, columnName: "play", columnTitle: "Play", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NotSort },
    { columnOrder: 50, columnName: "totalBet", columnTitle: "Bet", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NotSort },
    { columnOrder: 60, columnName: "tripsProfit", columnTitle: "Trips Profit", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.Desending },
    { columnOrder: 70, columnName: "anteProfit", columnTitle: "Ante Profit", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NotSort },
    { columnOrder: 80, columnName: "blindProfit", columnTitle: "Blind Profit", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NotSort },
    { columnOrder: 90, columnName: "playProfit", columnTitle: "Play Profit", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NotSort },
    { columnOrder: 100, columnName: "totalProfit", columnTitle: "Profit", columnWidth: 4, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NotSort },
    { columnOrder: 110, columnName: "tripsBalance", columnTitle: "Total Trips", columnWidth: 4, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NotSort },
    { columnOrder: 120, columnName: "anteBalance", columnTitle: "Total Ante", columnWidth: 4, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NotSort },
    { columnOrder: 130, columnName: "blindBalance", columnTitle: "Total Blind", columnWidth: 4, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NotSort },
    { columnOrder: 140, columnName: "totalBalance", columnTitle: "Balance", columnWidth: 4, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NotSort },
    { columnOrder: 150, columnName: "betStage", columnTitle: "Bet Stage", columnWidth: 5, coulmeType: ColumnType.CodeDecode, codeDecodeList: this.betStgaeCodes, sortOption: SortOption.NotSort },
    { columnOrder: 160, columnName: "handResult", columnTitle: "Result", columnWidth: 3, coulmeType: ColumnType.CodeDecode, codeDecodeList: this.handResultsCodes, sortOption: SortOption.NotSort },
    { columnOrder: 180, columnName: "wins", columnTitle: "Wins", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NA },
    { columnOrder: 190, columnName: "losses", columnTitle: "Losses", columnWidth: 4, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NA },
    { columnOrder: 200, columnName: "ties", columnTitle: "Ties", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NA },
    { columnOrder: 210, columnName: "totalHands", columnTitle: "Hands", columnWidth: 3, coulmeType: ColumnType.Regular, codeDecodeList: [], sortOption: SortOption.NA },
    { columnOrder: 220, columnName: "playerCards", columnTitle: "Player Cards", columnWidth: 8, coulmeType: ColumnType.Cards, codeDecodeList: [], sortOption: SortOption.NA },
    { columnOrder: 230, columnName: "communityCards", columnTitle: "Community Cards", columnWidth: 18, coulmeType: ColumnType.Cards, codeDecodeList: [], sortOption: SortOption.NA },
    { columnOrder: 240, columnName: "dealerCards", columnTitle: "Dealer Cards", columnWidth: 8, coulmeType: ColumnType.Cards, codeDecodeList: [], sortOption: SortOption.NA },
  ];


  public readonly cardsValues: string[] = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]
  public readonly tripsPayout: Payout[] = TripsPayout;
  public readonly blindPayout: Payout[] = BlindPayout;
  public readonly strategies: BetOption[][][] = [
    HighRiskStrategy, ByTheBookStrategy, ConservativeStrategy, VeryConservativeStrategy
  ]

  public strategiesIterations: Iteration[][] = [[], [], [], []]
  constructor(
    private router: Router,
    private getCardsService: GetCardesService) { }

  start() {
    this.isRunning = true;
    this.maxHand = null;
    this.strategiesIterations = [[], [], [], []]
    let previousIteration: (Iteration | null)[] = [null, null, null, null];

    for (let handId = 0; handId < this.iteration.value; handId++) {
      let basicIteration = this.initIteration();

      this.strategiesIterations.forEach((iteration, index) => {
        iteration.push(JSON.parse(JSON.stringify(basicIteration)))

        iteration[iteration.length - 1].handId = handId + 1;
        if (previousIteration[index]) {
          iteration[iteration.length - 1].totalBalance = previousIteration[index].totalBalance;
          iteration[iteration.length - 1].maxBalance = previousIteration[index].maxBalance;
          iteration[iteration.length - 1].minBalance = previousIteration[index].minBalance;
          iteration[iteration.length - 1].tripsBalance = previousIteration[index].tripsBalance;
          iteration[iteration.length - 1].noOfTrips = previousIteration[index].noOfTrips;
          iteration[iteration.length - 1].anteBalance = previousIteration[index].anteBalance;
          iteration[iteration.length - 1].blindBalance = previousIteration[index].blindBalance;
          iteration[iteration.length - 1].preFlopBalance = previousIteration[index].preFlopBalance;
          iteration[iteration.length - 1].flopBalance = previousIteration[index].flopBalance;
          iteration[iteration.length - 1].riverBalance = previousIteration[index].riverBalance;
          iteration[iteration.length - 1].wins = previousIteration[index].wins;
          iteration[iteration.length - 1].losses = previousIteration[index].losses;
          iteration[iteration.length - 1].ties = previousIteration[index].ties;
          iteration[iteration.length - 1].totalHands = previousIteration[index].totalHands;
          iteration[iteration.length - 1].tripsPayout = previousIteration[index].tripsPayout;

        }

        this.handlePreFlopBet(iteration[iteration.length - 1], index);

        if (iteration[iteration.length - 1].betStage === BetStage.NoBet) {
          this.handleFlopBet(iteration[iteration.length - 1]);

          if (iteration[iteration.length - 1].betStage === BetStage.NoBet) {
            this.handleRiverBet(iteration[iteration.length - 1]);
          }
        }

        iteration[iteration.length - 1].totalBet = iteration[iteration.length - 1].trips + iteration[iteration.length - 1].ante + iteration[iteration.length - 1].blind + iteration[iteration.length - 1].play

        this.handleHandWinners(iteration[iteration.length - 1])

        previousIteration[index] = iteration[iteration.length - 1];
      })
    }

    this.isRunning = false;

  }

  handleHandWinners(iteration: Iteration) {
    let dealerCards = [...iteration.dealerCards, ...iteration.communityCards]
    let playerCards = [...iteration.playerCards, ...iteration.communityCards]

    iteration.dealerHand = calculateBestHand(dealerCards as Card[]);
    iteration.playerHand = calculateBestHand(playerCards as Card[]);
    iteration.totalHands++;

    if (this.maxHand) {
      let res = compareHands(iteration.playerHand as Hand, this.maxHand as Hand);
      if (res === HandResult.PlayerWin) {
        this.maxHand = iteration.playerHand;
      }
    } else {
      this.maxHand = iteration.playerHand;
    }
    if (iteration.betStage === BetStage.Fold) {
      iteration.handResult = HandResult.PlayerLoss
    } else {
      iteration.handResult = compareHands(iteration.playerHand as Hand, iteration.dealerHand as Hand);
    }

    this.calcTrips(iteration);
    this.calcBlind(iteration);
    this.calcAnteAndPlay(iteration);
    iteration.totalProfit = iteration.tripsProfit + iteration.anteProfit + iteration.blindProfit + iteration.playProfit;
    this.updatesBalanace(iteration);
    // iteration.betStage = BetStage.HandOver;
  }

  updatesBalanace(iteration: Iteration) {
    iteration.totalProfit = iteration.tripsProfit + iteration.anteProfit + iteration.blindProfit + iteration.playProfit;
    iteration.tripsBalance += iteration.tripsProfit;
    iteration.anteBalance += iteration.anteProfit;
    iteration.blindBalance += iteration.blindProfit;

    switch (iteration.betStage) {
      case BetStage.PreFlop:
        iteration.preFlopBalance += iteration.playProfit;
        break;
      case BetStage.AfterFlop:
        iteration.flopBalance += iteration.playProfit;
        break;
      case BetStage.AfterRiver:
        iteration.riverBalance += iteration.playProfit;
        break;
    }
    iteration.totalBalance += iteration.totalProfit;

    if (iteration.totalBalance > iteration.maxBalance) {
      iteration.maxBalance = iteration.totalBalance
    }

    if (iteration.totalBalance < iteration.minBalance) {
      iteration.minBalance = iteration.totalBalance
    }
  }

  calcAnteAndPlay(iteration: Iteration) {
    let realAnte = iteration.dealerHand?.rank != HandRank.HighCard ? iteration.ante : (iteration.betStage === BetStage.Fold ? iteration.ante : 0)
    switch (iteration.handResult) {
      case HandResult.PlayerWin:
        iteration.anteProfit += realAnte;
        iteration.playProfit += iteration.play;
        iteration.wins++;
        break;
      case HandResult.PlayerLoss:
        iteration.anteProfit -= realAnte;
        iteration.playProfit -= iteration.play;
        iteration.losses++
        break;
      case HandResult.Tie:
        iteration.playProfit = 0;
        iteration.ties++
        break;
    }
  }

  calcBlind(iteration: Iteration) {
    switch (iteration.handResult) {
      case HandResult.PlayerWin:
        if (iteration.playerHand!.rank >= HandRank.Straight) {
          let blindFactor = this.blindPayout.find(payout => payout.handRank === iteration.playerHand!.rank)!.payoutFactor;
          iteration.blindProfit += iteration.ante * blindFactor;
        } else {
          iteration.blindProfit = 0;
        }
        break;

      case HandResult.PlayerLoss:
        iteration.blindProfit -= iteration.ante;
        break;
      case HandResult.Tie:
        iteration.blindProfit = 0;
        break;
    }
  }

  calcTrips(iteration: Iteration) {
    if (iteration.trips > 0 && iteration.playerHand!.rank >= HandRank.Trips) {
      iteration.noOfTrips++;
      let tripsIndex = iteration.tripsPayout.findIndex(payout => payout.handRank === iteration.playerHand!.rank);
      iteration.tripsPayout[tripsIndex].appearance++;
      iteration.tripsProfit = iteration.trips * iteration.tripsPayout[tripsIndex].payoutFactor;
    } else {
      iteration.tripsProfit = -iteration.trips
    }
  }

  handlePreFlopBet(iteration: Iteration, strategyIndex: number) {
    let firstIndex = iteration.playerCards[0]!.cardValue - 2;
    let secordIndex = iteration.playerCards[1]!.cardValue - 2;
    let betOption: BetOption = this.strategies[strategyIndex][firstIndex][secordIndex]
    switch (betOption) {
      case BetOption.Bet:
        iteration.play = this.ante * 4;
        iteration.betStage = BetStage.PreFlop;
        break;

      case BetOption.OnlySutd:
        if (iteration.playerCards[0]?.cardSign == iteration.playerCards[1]?.cardSign) {
          iteration.play = this.ante * 4;
          iteration.betStage = BetStage.PreFlop;
        }
        break;

      case BetOption.NotBet:
        break;
    }
  }

  handleFlopBet(iteration: Iteration) {
    let flop = iteration.communityCards.slice(0, 3);
    let playerCards = [...iteration.playerCards, ...flop]

    let flopHand = calculateBestHand(flop as Card[]);
    let playHand = calculateBestHand(playerCards as Card[]);

    if (playHand.rank > flopHand.rank) {
      iteration.play = this.ante * 2;
      iteration.betStage = BetStage.AfterFlop;
    }
  }

  handleRiverBet(iteration: Iteration) {
    let playerCards = [...iteration.playerCards, ...iteration.communityCards]

    let riverHand = calculateBestHand(iteration.communityCards as Card[]);
    iteration.playerHand = calculateBestHand(playerCards as Card[]);

    const playerValues = iteration.playerCards.map(card => card!.cardValue);

    if (iteration.playerHand.rank > riverHand.rank) {
      iteration.play = this.ante * 1;
      iteration.betStage = BetStage.AfterRiver;
    } else if (riverHand.rank === HandRank.Flush || riverHand.rank === HandRank.FullHouse ||
      riverHand.rank === HandRank.RoyalFlush || riverHand.rank === HandRank.Straight ||
      riverHand.rank === HandRank.StraightFlush
    ) {
      iteration.play = this.ante * 1;
      iteration.betStage = BetStage.AfterRiver;
    }
    else if (playerValues.includes(14) || playerValues.includes(13) || playerValues.includes(12) || playerValues.includes(11)) {
      iteration.play = this.ante * 1;
      iteration.betStage = BetStage.AfterRiver;
    }

    if (iteration.betStage == BetStage.NoBet) {
      iteration.betStage = BetStage.Fold;
    }
  }

  setValidation() {
  }

  initIteration(): Iteration {
    this.getCardsService.reShuffeleCard();
    let iteration = INIT_Iteration();
    for (let i = 0; i < 5; i++) {
      iteration.communityCards[i] = this.getCardsService.getRandomCard(true);
    }

    iteration.playerCards[0] = this.getCardsService.getRandomCard(true);
    iteration.playerCards[1] = this.getCardsService.getRandomCard(true);
    iteration.dealerCards[0] = this.getCardsService.getRandomCard(true);
    iteration.dealerCards[1] = this.getCardsService.getRandomCard(true);

    iteration.trips = this.trips
    iteration.ante = this.ante
    iteration.blind = this.ante
    return iteration;
  }

  goToDetails(index: number) {
    this.activeIteration = this.strategiesIterations[index]
    this.activeStategy = index + 1;

  }

  exit() {
    this.activeIteration = null;
  }
  back() {
    this.router.navigateByUrl("/main")
  }
}
