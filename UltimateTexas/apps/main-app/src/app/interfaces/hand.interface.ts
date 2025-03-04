import { Hand, HandRank, HandResult } from "./calc-hand.function";
import { Card } from "./card.interfcae";


export enum HandState {
    NotStarted = 0,
    PreFlop = 1,
    AfterFlop = 2,
    AfterRiver = 3,
    DealerHand = 4
}

export enum BetStage {
    NoBet = 0,
    PreFlop = 1,
    AfterFlop = 2,
    AfterRiver = 3,
    Fold = 4,
    HandOver = 5,
}

export function getHandName(handRank: HandRank): string {
    switch (handRank) {
        case HandRank.HighCard:
            return "High Card";
        case HandRank.Pair:
            return "Pair";
        case HandRank.TwoPairs:
            return "Two Pair";
        case HandRank.Trips:
            return "Trips";
        case HandRank.Straight:
            return "Straight";
        case HandRank.Flush:
            return "Flush";
        case HandRank.FullHouse:
            return "Full House";
        case HandRank.Quads:
            return "Quads";
        case HandRank.StraightFlush:
            return "Straight Flush";
        case HandRank.RoyalFlush:
            return "Royal Flush";
    }
    return ""
}

export interface Payout {
    handRank: HandRank;
    handName: string;
    payoutFactor: number;
    payoutString: string;
    appearance: number;
}

export const TripsPayout: Payout[] = [
    { handRank: HandRank.RoyalFlush, handName: getHandName(HandRank.RoyalFlush), payoutFactor: 50, payoutString: "50 to 1", appearance: 0 },
    { handRank: HandRank.StraightFlush, handName: getHandName(HandRank.StraightFlush), payoutFactor: 40, payoutString: "40 to 1", appearance: 0 },
    { handRank: HandRank.Quads, handName: getHandName(HandRank.Quads), payoutFactor: 30, payoutString: "30 to 1", appearance: 0 },
    { handRank: HandRank.FullHouse, handName: getHandName(HandRank.FullHouse), payoutFactor: 8, payoutString: "8 to 1", appearance: 0 },
    { handRank: HandRank.Flush, handName: getHandName(HandRank.Flush), payoutFactor: 7, payoutString: "7 to 1", appearance: 0 },
    { handRank: HandRank.Straight, handName: getHandName(HandRank.Straight), payoutFactor: 4, payoutString: "4 to 1", appearance: 0 },
    { handRank: HandRank.Trips, handName: getHandName(HandRank.Trips), payoutFactor: 3, payoutString: "3 to 1", appearance: 0 },
]

export const BlindPayout: Payout[] = [
    { handRank: HandRank.RoyalFlush, handName: getHandName(HandRank.RoyalFlush), payoutFactor: 500, payoutString: "500 to 1", appearance: 0 },
    { handRank: HandRank.StraightFlush, handName: getHandName(HandRank.StraightFlush), payoutFactor: 50, payoutString: "50 to 1", appearance: 0 },
    { handRank: HandRank.Quads, handName: getHandName(HandRank.Quads), payoutFactor: 10, payoutString: "10 to 1", appearance: 0 },
    { handRank: HandRank.FullHouse, handName: getHandName(HandRank.FullHouse), payoutFactor: 3, payoutString: "3 to 1", appearance: 0 },
    { handRank: HandRank.Flush, handName: getHandName(HandRank.Flush), payoutFactor: 1.5, payoutString: "3 to 2", appearance: 0 },
    { handRank: HandRank.Straight, handName: getHandName(HandRank.Straight), payoutFactor: 1, payoutString: "1 to 1", appearance: 0 },
]

export interface PlayerSpot {
    isActive: boolean,
    trips: number,
    ante: number,
    play: number,
    betStage: BetStage,
    totalBet: number,
    cards: (Card | null)[],
    currentHand: Hand | null,
    currentHandResult: HandResult,

    tripsProfit: number,
    anteProfit: number,
    blindProfit: number,
    playProfit: number,
    totalProfit: number,

    totalBalance: number,
    tripsBalance: number,
    anteBalance: number,
    blindBalance: number,
    preFlopBalance: number,
    flopBalance: number,
    riverBalance: number,

    wins: number,
    losses: number,
    ties: number,
    totalHands: number,

    handsHistory: DealerVsPlayer[],
}

export interface Iteration {
    handId: number,
    totalBet: number,
    trips: number,
    ante: number,
    blind: number,
    play: number,
    playerCards: (Card | null)[],
    dealerCards: (Card | null)[],
    communityCards: (Card | null)[],
    playerHand: Hand | null,
    dealerHand: Hand | null,
    handResult: HandResult,
    betStage: BetStage,
    noOfTrips: number,

    tripsProfit: number,
    anteProfit: number,
    blindProfit: number,
    playProfit: number,
    totalProfit: number,
    totalBalance: number,
    maxBalance: number,
    minBalance: number,
    tripsBalance: number,
    anteBalance: number,
    blindBalance: number,
    preFlopBalance: number,
    flopBalance: number,
    riverBalance: number,

    wins: number,
    losses: number,
    ties: number,
    totalHands: number,
    tripsPayout: Payout[]
}

export interface DealerVsPlayer {
    dealerCards: (Card | null)[],
    playerCards: (Card | null)[],
    communityCards: Card[],
    dealerHand: Hand,
    playerHand: Hand,
}

export function INIT_PlayerSpot(): PlayerSpot {
    return {
        isActive: false,
        trips: 0,
        ante: 1,
        play: 0,
        betStage: BetStage.NoBet,
        totalBet: 2,
        cards: [null, null],
        currentHand: null,
        currentHandResult: HandResult.Tie,
        tripsProfit: 0,
        anteProfit: 0,
        blindProfit: 0,
        playProfit: 0,
        totalProfit: 0,
        totalBalance: 0,
        tripsBalance: 0,
        anteBalance: 0,
        blindBalance: 0,
        preFlopBalance: 0,
        flopBalance: 0,
        riverBalance: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        totalHands: 0,
        handsHistory: []
    }
}

export function INIT_Iteration(): Iteration {
    return {
        handId: 0,
        betStage: BetStage.NoBet,
        trips: 0,
        noOfTrips: 0,
        ante: 0,
        blind: 0,
        play: 0,
        totalBet: 2,
        playerCards: [null, null],
        dealerCards: [null, null],
        communityCards: [null, null],
        playerHand: null,
        dealerHand: null,
        handResult: HandResult.Tie,
        tripsProfit: 0,
        anteProfit: 0,
        blindProfit: 0,
        playProfit: 0,
        totalProfit: 0,
        totalBalance: 0,
        maxBalance: 0,
        minBalance: 0,
        tripsBalance: 0,
        anteBalance: 0,
        blindBalance: 0,
        preFlopBalance: 0,
        flopBalance: 0,
        riverBalance: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        totalHands: 0,
        tripsPayout: [...TripsPayout]
    }
}

export enum BetOption {
    Bet = 1,
    OnlySutd = 2,
    NotBet = 3,
}

export const HighRiskStrategy: BetOption[][] = [
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1], //2
    [3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1], //3
    [3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1], //4
    [3, 3, 3, 1, 3, 3, 3, 3, 3, 2, 2, 1, 1], //5
    [3, 3, 3, 3, 1, 3, 3, 3, 3, 2, 2, 1, 1], //6
    [3, 3, 3, 3, 3, 1, 3, 3, 2, 2, 1, 1, 1], //7
    [3, 3, 3, 3, 3, 3, 1, 3, 2, 1, 1, 1, 1], //8
    [3, 3, 3, 3, 3, 3, 3, 1, 2, 1, 1, 1, 1], //9
    [3, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1], //10
    [3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1], //11
    [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], //12 
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], //13
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], //14
]

export const ByTheBookStrategy: BetOption[][] = [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1], //2
    [3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1], //3
    [3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1], //4
    [3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1], //5
    [3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 2, 1, 1], //6
    [3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 2, 1, 1], //7
    [3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 1, 1, 1], //8
    [3, 3, 3, 3, 3, 3, 3, 1, 3, 2, 1, 1, 1], //9
    [3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1], //10
    [3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1], //11
    [3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1], //12 
    [2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], //13
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], //14
]

export const ConservativeStrategy: BetOption[][] = [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2], //2
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2], //3
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2], //4
    [3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2], //5
    [3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 2, 2], //6
    [3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 2, 1], //7
    [3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 2, 2, 1], //8
    [3, 3, 3, 3, 3, 3, 3, 1, 3, 2, 2, 1, 1], //9
    [3, 3, 3, 3, 3, 3, 3, 3, 1, 2, 2, 1, 1], //10
    [3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1], //11
    [3, 3, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1], //12 
    [3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1], //13
    [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], //14
]

export const VeryConservativeStrategy: BetOption[][] = [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], //2
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], //3
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], //4
    [3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2], //5
    [3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 2], //6
    [3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 2], //7
    [3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 2, 2], //8
    [3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 2, 2], //9
    [3, 3, 3, 3, 3, 3, 3, 3, 1, 2, 2, 1, 1], //10
    [3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 2, 1, 1], //11
    [3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1], //12 
    [3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1], //13
    [3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1], //14
]

