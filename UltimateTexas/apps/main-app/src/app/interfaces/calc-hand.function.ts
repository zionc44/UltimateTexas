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
    let threeOfAKind: Card[] | null = null;
    let pair: Card[] | null = null;
    for (const group of groups.values()) {
        if (group.length === 3 && !threeOfAKind) {
            threeOfAKind = group;
        } else if (group.length >= 2 && !pair) {
            pair = group.slice(0, 2);
        }
    }
    if (threeOfAKind && pair) {
        return {
            rank: HandRank.FullHouse,
            cards: [...threeOfAKind, ...pair],
            handDescription: `Full House, ${cardValueToString(threeOfAKind[0].cardValue)}s over ${cardValueToString(pair[0].cardValue)}s`,
        };
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
    if (threeOfAKind) {
        const kickers = sortedCards.filter(card => card.cardValue !== threeOfAKind![0].cardValue).slice(0, 2);
        return {
            rank: HandRank.Trips,
            cards: [...threeOfAKind, ...kickers],
            handDescription: `Three of a Kind, ${cardValueToString(threeOfAKind[0].cardValue)}s`,
        };
    }

    // Check for Two Pair
    const pairs: Card[][] = [];
    for (const group of groups.values()) {
        if (group.length === 2) {
            pairs.push(group);
        }
    }


    if (pairs.length >= 2) {
        pairs.sort((a, b) => b[0].cardValue - a[0].cardValue); // Sorting pairs by highest value


        if (pairs.length > 2) {
            pairs.pop()
        }

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



// Function to compare two hands
export function compareHands(hand1: Hand, hand2: Hand): number {
    if (hand1.rank > hand2.rank) {
        return 1;
    } else if (hand1.rank < hand2.rank) {
        return 2;
    } else {
        // Ranks are equal; compare the cards contributing to the rank
        const hand1Sorted = sortCardsByValue(hand1.cards);
        const hand2Sorted = sortCardsByValue(hand2.cards);

        for (let i = 0; i < Math.min(hand1Sorted.length, hand2Sorted.length); i++) {
            if (hand1Sorted[i].cardValue > hand2Sorted[i].cardValue) {
                return 1;
            } else if (hand1Sorted[i].cardValue < hand2Sorted[i].cardValue) {
                return 2;
            }
        }

        // If the contributing cards are identical, compare kickers
        const allHand1Cards = sortCardsByValue(hand1.cards);
        const allHand2Cards = sortCardsByValue(hand2.cards);

        for (let i = 0; i < Math.min(allHand1Cards.length, allHand2Cards.length); i++) {
            if (allHand1Cards[i].cardValue > allHand2Cards[i].cardValue) {
                return 1;
            } else if (allHand1Cards[i].cardValue < allHand2Cards[i].cardValue) {
                return 2;
            }
        }

        // All cards are equal, it's a tie
        return 0;
    }
}
