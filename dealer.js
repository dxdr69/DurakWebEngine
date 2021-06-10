module.exports = class Dealer {
    constructor() 
    {
        this.deck = [];

        this.deck.push('2C');
        this.deck.push('2D');
        this.deck.push('2H');
        this.deck.push('2S');

        this.deck.push('3C');
        this.deck.push('3D');
        this.deck.push('3H');
        this.deck.push('3S');

        this.deck.push('4C');
        this.deck.push('4D');
        this.deck.push('4H');
        this.deck.push('4S');

        this.deck.push('5C');
        this.deck.push('5D');
        this.deck.push('5H');
        this.deck.push('5S');

        this.deck.push('6C');
        this.deck.push('6D');
        this.deck.push('6H');
        this.deck.push('6S');

        this.deck.push('7C');
        this.deck.push('7D');
        this.deck.push('7H');
        this.deck.push('7S');

        this.deck.push('8C');
        this.deck.push('8D');
        this.deck.push('8H');
        this.deck.push('8S');

        this.deck.push('9C');
        this.deck.push('9D');
        this.deck.push('9H');
        this.deck.push('9S');

        this.deck.push('10C');
        this.deck.push('10D');
        this.deck.push('10H');
        this.deck.push('10S');

        this.deck.push('JC');
        this.deck.push('JD');
        this.deck.push('JH');
        this.deck.push('JS');

        this.deck.push('QC');
        this.deck.push('QD');
        this.deck.push('QH');
        this.deck.push('QS');

        this.deck.push('KC');
        this.deck.push('KD');
        this.deck.push('KH');
        this.deck.push('KS');

        this.deck.push('AC');
        this.deck.push('AD');
        this.deck.push('AH');
        this.deck.push('AS');


        this.deckInUse = this.deck;
        this.trumpSuit = null;
    }

    getDeckInUse()
    {
        return this.deckInUse;
    }

    resetDeck()
    {
        if (this.deckInUse.length !== this.deck.length)
        {
            this.deckInUse = this.deck;
        }
    }

    serverDealCardsNewRound()
    {
        let playerHand = [];

        for (let card = 0; card < 6; card++)
        {
            let randomCard = this.deckInUse[Math.floor(Math.random() * this.deckInUse.length)];
            this.deckInUse.splice(this.deckInUse.indexOf(randomCard), 1);
            playerHand.push(randomCard);
        }

        return playerHand;
    }

    serverSetTrumpSuit()
    {
        let randomCard = this.deckInUse[Math.floor(Math.random() * this.deckInUse.length)];
        let suite = randomCard.substring(1);

        if (suite === "A")
        {
            while (suite === "A")
            {
                randomCard = this.deckInUse[Math.floor(Math.random() * this.deckInUse.length)];

                if (randomCard.length === 3)
                {
                    suite = randomCard.substr(2, 1);
                }
                else
                {
                    suite = randomCard.substring(1)
                }
            }
        }

        this.trumpSuit = suite;
        return this.trumpSuit;
    }
}