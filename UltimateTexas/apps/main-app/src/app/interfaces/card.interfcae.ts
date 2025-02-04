export enum CardSign {
    CLUB = "C",
    DIAMOND = "D",
    HEART = "H",
    SPADE = "S"
}

export interface Card {
    cardSign: CardSign,
    cardValue: number,
    cardIndex: number, 
    isOpen: boolean,
}       