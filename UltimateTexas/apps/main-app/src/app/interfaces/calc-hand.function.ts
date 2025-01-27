import { Card, CardSign } from "./card.interfcae";

export enum HandRank {
    HighCard = 1,
    Pair = 2,
    TwoPairs = 3,
    Trips = 4,
    Straight = 5,
    Flush = 6,
    FullHouse = 7,
    Quads = 8,
    StraightFlush = 9,
    RoyalFlush = 10,
}

export enum HandResult {
    PlayerWin = 1,
    PlayerLoss = 2,
    Tie = 3
}

export interface Hand {
    rank: HandRank;
    cards: Card[]; // Cards that contribute to the hand
    handDescription: string; // Textual description of the hand rank
}

// Helper function: Sort cards by value descending
const sortCardsByValue = (cards: Card[]): Card[] => {
    return [...cards].sort((a, b) => b.cardValue - a.cardValue);
};

// Helper function: Group cards by value
const groupByValue = (cards: Card[]): Map<number, Card[]> => {
    const groups = new Map<number, Card[]>();
    cards.forEach(card => {
        if (!groups.has(card.cardValue)) {
            groups.set(card.cardValue, []);
        }
        groups.get(card.cardValue)!.push(card);
    });
    return groups;
};

// Helper function: Check for flush
const getFlush = (cards: Card[]): Card[] | null => {
    const suits = new Map<CardSign, Card[]>();
    cards.forEach(card => {
        if (!suits.has(card.cardSign)) {
            suits.set(card.cardSign, []);
        }
        suits.get(card.cardSign)!.push(card);
    });
    for (const suitCards of suits.values()) {
        if (suitCards.length >= 5) {
            return sortCardsByValue(suitCards).slice(0, 5);
        }
    }
    return null;
};

// Helper function: Check for straight
const getStraight = (cards: Card[]): Card[] | null => {
    const sorted = sortCardsByValue(cards);
    const uniqueCards = Array.from(new Map(sorted.map(card => [card.cardValue, card])).values());

    let straight: Card[] = [];

    for (let i = 0; i < uniqueCards.length; i++) {
        if (
            straight.length === 0 ||
            uniqueCards[i].cardValue === uniqueCards[i - 1].cardValue - 1
        ) {
            straight.push(uniqueCards[i]);
        } else {
            straight = [uniqueCards[i]];
        }

        if (straight.length === 5) {
            return straight;
        }
    }

    // Special case: Ace-low straight (A, 2, 3, 4, 5)
    const lowStraightValues = [5, 4, 3, 2, 14];
    if (
        lowStraightValues.every(value =>
            uniqueCards.some(card => card.cardValue === value)
        )
    ) {
        return lowStraightValues.map(value =>
            uniqueCards.find(card => card.cardValue === value)!
        );
    }

    return null;
};

// Helper function: Convert card value to display string
const cardValueToString = (value: number): string => {
    if (value === 14) return "A";
    if (value === 13) return "K";
    if (value === 12) return "Q";
    if (value === 11) return "J";
    return value.toString();
};

export function calculateBestHand(cards: Card[]): Hand {
    if (cards.length < 2 || cards.length > 7) {
        throw new Error("The number of cards must be between 2 and 7 to calculate the best hand.");
    }

    const sortedCards = sortCardsByValue(cards);
    const groups = groupByValue(cards);

    const flush = getFlush(cards);
    const straight = getStraight(cards);

    // Check for Straight Flush
    if (flush) {
        const straightFlush = getStraight(flush);
        if (straightFlush) {
            return {
                rank: straightFlush[0].cardValue === 14 ? HandRank.RoyalFlush : HandRank.StraightFlush,
                cards: straightFlush,
                handDescription: straightFlush[0].cardValue === 14 ? "Royal Flush" : `Straight Flush to ${cardValueToString(straightFlush[0].cardValue)}`,
            };
        }
    }

    // Check for Four of a Kind
    for (const [value, group] of groups.entries()) {
        if (group.length === 4) {
            const kicker = sortedCards.find(card => card.cardValue !== value)!;
            return {
                rank: HandRank.Quads,
                cards: [...group, kicker],
                handDescription: `Four of a Kind, ${cardValueToString(value)}s`,
            };
        }
    }

    // Check for Full House
    const trips: Card[][] = [];
    const pairs: Card[][] = [];
    for (const group of groups.values()) {
        if (group.length === 3) {
            trips.push(group);
        } else if (group.length === 2) {
            pairs.push(group);
        }
    }

    if (trips.length > 0) {
        trips.sort((a, b) => b[0].cardValue - a[0].cardValue);
        if (pairs.length > 0) {
            pairs.sort((a, b) => b[0].cardValue - a[0].cardValue);
            return {
                rank: HandRank.FullHouse,
                cards: [...trips[0], ...pairs[0]],
                handDescription: `Full House, ${cardValueToString(trips[0][0].cardValue)}s over ${cardValueToString(pairs[0][0].cardValue)}s`,
            };
        } else if (trips.length > 1) {
            return {
                rank: HandRank.FullHouse,
                cards: [...trips[0], ...trips[1].slice(0, 2)],
                handDescription: `Full House, ${cardValueToString(trips[0][0].cardValue)}s over ${cardValueToString(trips[1][0].cardValue)}s`,
            };
        }
    }

    // Check for Flush
    if (flush) {
        return {
            rank: HandRank.Flush,
            cards: flush,
            handDescription: `Flush, ${flush.map(card => cardValueToString(card.cardValue)).join(", ")} high`,
        };
    }

    // Check for Straight
    if (straight) {
        return {
            rank: HandRank.Straight,
            cards: straight,
            handDescription: `Straight to ${cardValueToString(straight[0].cardValue)}`,
        };
    }

    // Check for Three of a Kind
    if (trips.length > 0) {
        const kickers = sortedCards.filter(card => card.cardValue !== trips[0][0].cardValue).slice(0, 2);
        return {
            rank: HandRank.Trips,
            cards: [...trips[0], ...kickers],
            handDescription: `Three of a Kind, ${cardValueToString(trips[0][0].cardValue)}s`,
        };
    }

    // Check for Two Pair
    if (pairs.length >= 2) {
        pairs.sort((a, b) => b[0].cardValue - a[0].cardValue);
        const kickers = sortedCards.filter(card => !pairs.flat().includes(card)).slice(0, 1);
        return {
            rank: HandRank.TwoPairs,
            cards: [...pairs[0], ...pairs[1], ...kickers],
            handDescription: `Two Pair, ${cardValueToString(pairs[0][0].cardValue)}s and ${cardValueToString(pairs[1][0].cardValue)}s`,
        };
    }

    // Check for One Pair
    if (pairs.length === 1) {
        const kickers = sortedCards.filter(card => !pairs[0].includes(card)).slice(0, 3);
        return {
            rank: HandRank.Pair,
            cards: [...pairs[0], ...kickers],
            handDescription: `Pair of ${cardValueToString(pairs[0][0].cardValue)}s`,
        };
    }

    // Default to High Card
    return {
        rank: HandRank.HighCard,
        cards: sortedCards.slice(0, 5),
        handDescription: `High Card, ${cardValueToString(sortedCards[0].cardValue)}`,
    };
}

export function compareHands(playerHand: Hand, dealerHand: Hand): HandResult {
    if (playerHand.rank > dealerHand.rank) {
        return HandResult.PlayerWin;
    } else if (playerHand.rank < dealerHand.rank) {
        return HandResult.PlayerLoss;
    } else {
        // Ranks are equal; compare cards contributing to the rank
        const compareByContribution = (cards1: Card[], cards2: Card[]): HandResult => {
            for (let i = 0; i < Math.min(cards1.length, cards2.length); i++) {
                if (cards1[i].cardValue > cards2[i].cardValue) {
                    return HandResult.PlayerWin;
                } else if (cards1[i].cardValue < cards2[i].cardValue) {
                    return HandResult.PlayerLoss;
                }
            }
            return HandResult.Tie; // Contributions are identical
        };

        // Special case for low Ace straight (A, 2, 3, 4, 5)
        const isLowAceStraight = (hand: Hand): boolean => {
            const values = hand.cards.map(card => card.cardValue);
            return values.includes(14) && values.includes(5) && values.includes(4) && values.includes(3) && values.includes(2);
        };

        if ((playerHand.rank === HandRank.Straight && dealerHand.rank === HandRank.Straight) ||
            (playerHand.rank === HandRank.StraightFlush && dealerHand.rank === HandRank.StraightFlush)) {
            const playerIsLowAceStraight = isLowAceStraight(playerHand);
            const dealerIsLowAceStraight = isLowAceStraight(dealerHand);

            if (playerIsLowAceStraight && !dealerIsLowAceStraight) {
                return HandResult.PlayerLoss;
            } else if (!playerIsLowAceStraight && dealerIsLowAceStraight) {
                return HandResult.PlayerWin;
            }
        }

        // Compare based on the rank
        switch (playerHand.rank) {
            case HandRank.Pair: {
                // Compare the pair first, then the kickers
                const playerPair = [playerHand.cards[0]];
                const dealerPair = [dealerHand.cards[0]];

                // Compare pair
                let result = compareByContribution(playerPair, dealerPair);
                if (result !== HandResult.Tie) return result;

                // Compare kickers 
                const playerKicker = playerHand.cards.slice(2); // Last 3 card in Pair are the kickers
                const dealerKicker = dealerHand.cards.slice(2);
                return compareByContribution(playerKicker, dealerKicker);
            }
            case HandRank.TwoPairs: {
                // Compare the higher pair first, then the second pair, then the kicker
                const playerPairs = [playerHand.cards[0], playerHand.cards[2]]; // First and second pairs
                const dealerPairs = [dealerHand.cards[0], dealerHand.cards[2]];

                // Compare higher pair
                let result = compareByContribution(playerPairs, dealerPairs);
                if (result !== HandResult.Tie) return result;

                // Compare kicker
                const playerKicker = playerHand.cards.slice(-1); // Last card in Two Pair is the kicker
                const dealerKicker = dealerHand.cards.slice(-1);
                return compareByContribution(playerKicker, dealerKicker);
            }

            case HandRank.Trips: {
                // Compare the higher trips, then the kickers
                const playerPairs = [playerHand.cards[0]];
                const dealerPairs = [dealerHand.cards[0]];

                // Compare higher pair
                let result = compareByContribution(playerPairs, dealerPairs);
                if (result !== HandResult.Tie) return result;

                // Compare kicker
                const playerKicker = playerHand.cards.slice(3); // Last 2 card in Trips are the kickers
                const dealerKicker = dealerHand.cards.slice(3);
                return compareByContribution(playerKicker, dealerKicker);
            }

            case HandRank.FullHouse: {
                // Compare the trips first, then the pair
                const playerTrips = playerHand.cards.slice(0, 3);
                const dealerTrips = dealerHand.cards.slice(0, 3);
                let result = compareByContribution(playerTrips, dealerTrips);
                if (result !== HandResult.Tie) return result;

                const playerFullHousePair = playerHand.cards.slice(3, 5);
                const dealerFullHousePair = dealerHand.cards.slice(3, 5);
                return compareByContribution(playerFullHousePair, dealerFullHousePair);
            }

            case HandRank.Quads: {
                // Compare the higher quads first, then the kicker
                const playerPairs = [playerHand.cards[0]];
                const dealerPairs = [dealerHand.cards[0]];

                // Compare higher pair
                let result = compareByContribution(playerPairs, dealerPairs);
                if (result !== HandResult.Tie) return result;

                // Compare kicker
                const playerKicker = playerHand.cards.slice(-1); // Last card in Quads is the kicker
                const dealerKicker = dealerHand.cards.slice(-1);
                return compareByContribution(playerKicker, dealerKicker);
            }
            default: {
                // Compare contributing cards for all other hand types
                let result = compareByContribution(
                    sortCardsByValue(playerHand.cards),
                    sortCardsByValue(dealerHand.cards)
                );
                if (result !== HandResult.Tie) return result;

                // Compare remaining cards (kickers) if needed
                const allPlayerCards = sortCardsByValue(playerHand.cards);
                const allDealerCards = sortCardsByValue(dealerHand.cards);
                return compareByContribution(allPlayerCards, allDealerCards);
            }
        }
    }
}
