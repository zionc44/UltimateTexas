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
}

export const TripsPayout: Payout[] = [
    { handRank: HandRank.RoyalFlush, handName: getHandName(HandRank.RoyalFlush), payoutFactor: 50, payoutString: "50 to 1" },
    { handRank: HandRank.StraightFlush, handName: getHandName(HandRank.StraightFlush), payoutFactor: 40, payoutString: "40 to 1" },
    { handRank: HandRank.Quads, handName: getHandName(HandRank.Quads), payoutFactor: 30, payoutString: "30 to 1" },
    { handRank: HandRank.FullHouse, handName: getHandName(HandRank.FullHouse), payoutFactor: 8, payoutString: "8 to 1" },
    { handRank: HandRank.Flush, handName: getHandName(HandRank.Flush), payoutFactor: 6, payoutString: "6 to 1" },
    { handRank: HandRank.Straight, handName: getHandName(HandRank.Straight), payoutFactor: 5, payoutString: "5 to 1" },
    { handRank: HandRank.Trips, handName: getHandName(HandRank.Trips), payoutFactor: 3, payoutString: "3 to 1" },
]

export const BlindPayout: Payout[] = [
    { handRank: HandRank.RoyalFlush, handName: getHandName(HandRank.RoyalFlush), payoutFactor: 500, payoutString: "500 to 1" },
    { handRank: HandRank.StraightFlush, handName: getHandName(HandRank.StraightFlush), payoutFactor: 50, payoutString: "50 to 1" },
    { handRank: HandRank.Quads, handName: getHandName(HandRank.Quads), payoutFactor: 10, payoutString: "10 to 1" },
    { handRank: HandRank.FullHouse, handName: getHandName(HandRank.FullHouse), payoutFactor: 3, payoutString: "3 to 1" },
    { handRank: HandRank.Flush, handName: getHandName(HandRank.Flush), payoutFactor: 1.5, payoutString: "3 to 2" },
    { handRank: HandRank.Straight, handName: getHandName(HandRank.Straight), payoutFactor: 1, payoutString: "1 to 1" },
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
