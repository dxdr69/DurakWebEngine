/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
class Durak extends Phaser.Scene {
    constructor()
    {
        super({
            key: 'Durak'
        });
    }

    preload()
    {
        this.load.image('background', 'assets/background.jpg');

        this.load.image('cardBack', 'assets/back.png')

        /*
        this.load.image('2C', 'assets/2C.png');
        this.load.image('2D', 'assets/2D.png');
        this.load.image('2H', 'assets/2H.png');
        this.load.image('2S', 'assets/2S.png');

        this.load.image('3C', 'assets/3C.png');
        this.load.image('3D', 'assets/3D.png');
        this.load.image('3H', 'assets/3H.png');
        this.load.image('3S', 'assets/3S.png');

        this.load.image('4C', 'assets/4C.png');
        this.load.image('4D', 'assets/4D.png');
        this.load.image('4H', 'assets/4H.png');
        this.load.image('4S', 'assets/4S.png');

        this.load.image('5C', 'assets/5C.png');
        this.load.image('5D', 'assets/5D.png');
        this.load.image('5H', 'assets/5H.png');
        this.load.image('5S', 'assets/5S.png');
        */

        this.load.image('6C', 'assets/6C.png');
        this.load.image('6D', 'assets/6D.png');
        this.load.image('6H', 'assets/6H.png');
        this.load.image('6S', 'assets/6S.png');

        this.load.image('7C', 'assets/7C.png');
        this.load.image('7D', 'assets/7D.png');
        this.load.image('7H', 'assets/7H.png');
        this.load.image('7S', 'assets/7S.png');

        this.load.image('8C', 'assets/8C.png');
        this.load.image('8D', 'assets/8D.png');
        this.load.image('8H', 'assets/8H.png');
        this.load.image('8S', 'assets/8S.png');

        this.load.image('9C', 'assets/9C.png');
        this.load.image('9D', 'assets/9D.png');
        this.load.image('9H', 'assets/9H.png');
        this.load.image('9S', 'assets/9S.png');

        this.load.image('10C', 'assets/10C.png');
        this.load.image('10D', 'assets/10D.png');
        this.load.image('10H', 'assets/10H.png');
        this.load.image('10S', 'assets/10S.png');

        this.load.image('JC', 'assets/JC.png');
        this.load.image('JD', 'assets/JD.png');
        this.load.image('JH', 'assets/JH.png');
        this.load.image('JS', 'assets/JS.png');

        this.load.image('QC', 'assets/QC.png');
        this.load.image('QD', 'assets/QD.png');
        this.load.image('QH', 'assets/QH.png');
        this.load.image('QS', 'assets/QS.png');

        this.load.image('KC', 'assets/KC.png');
        this.load.image('KD', 'assets/KD.png');
        this.load.image('KH', 'assets/KH.png');
        this.load.image('KS', 'assets/KS.png');

        this.load.image('AC', 'assets/AC.png');
        this.load.image('AD', 'assets/AD.png');
        this.load.image('AH', 'assets/AH.png');
        this.load.image('AS', 'assets/AS.png');
    }

    create()
    {
        const self = this;

        this.numPlayers = null;
        this.currentLeaderID = null;

        this.deck = [];
        this.player1Hand = [];
        this.player2Hand = [];
        this.player3Hand = [];
        this.player4Hand = [];


        this.add.image(960, 540, 'background');

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });


        this.socket = io();

        this.socket.on('connect', () => {
            console.log('Client connected');
            console.log(`Your ID is: ${self.socket.id}`);
        });

        this.socket.on('setRedirectUser', () => {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const userType = urlParams.get('userType');
            const nickname = urlParams.get('nickname');
            this.socket.emit('setRedirectUser', userType, nickname);
        });

        this.socket.on('setRedirectLeader', currentLeaderID => {
            self.currentLeaderID = currentLeaderID;
            console.log(`The ID of the leader is: ${self.currentLeaderID}`);
        });

        this.socket.on('newRoundPrep', () => {
            this.socket.emit('newRoundPrep');
        });

        this.socket.on('firstTurnDealPrep', (userType, numPlayers) => {
            self.numPlayers = numPlayers;
            this.socket.emit('firstTurnDealPrep', userType);
        });

        this.socket.on('firstTurnDeal', (userType, playersInfo, currentDeck, trumpCard) => {
            const opponentSprite = 'cardBack';

            if (userType === 'player')
            {
                playersInfo.forEach(player => {
                    if (player.id === self.socket.id)
                    {
                        for (let i = 0; i < 6; i++)
                        {
                            if (self.numPlayers === 4)
                            {
                                let player1Card = new Card(self);
                                self.player1Hand.push(player1Card.render(650 + (i * 100), 920, 'player', player.hand[i]));
            
                                let player2Card = new Card(self);
                                self.player2Hand.push(player2Card.render(650 + (i * 100), 160, 'opponent', opponentSprite));

                                let player3Card = new Card(self);
                                self.player3Hand.push(player3Card.render(180, 280 + (i * 100), 'opponent', opponentSprite));

                                self.player3Hand.forEach(card => {
                                    card.angle = -90;
                                });
                                
                                let player4Card = new Card(self);
                                self.player4Hand.push(player4Card.render(1600, 280 + (i * 100), 'opponent', opponentSprite));

                                self.player4Hand.forEach(card => {
                                    card.angle = -90;
                                });
                            }
                            else if (self.numPlayers === 3)
                            {
                                let player1Card = new Card(self);
                                self.player1Hand.push(player1Card.render(650 + (i * 100), 920, 'player', player.hand[i]));
            
                                let player2Card = new Card(self);
                                self.player2Hand.push(player2Card.render(650 + (i * 100), 160, 'opponent', opponentSprite));

                                let player3Card = new Card(self);
                                self.player3Hand.push(player3Card.render(180, 280 + (i * 100), 'opponent', opponentSprite));

                                self.player3Hand.forEach(card => {
                                    card.angle = -90;
                                });
                            }
                            else
                            {
                                let player1Card = new Card(self);
                                self.player1Hand.push(player1Card.render(650 + (i * 100), 920, 'player', player.hand[i]));
            
                                let player2Card = new Card(self);
                                self.player2Hand.push(player2Card.render(650 + (i * 100), 160, 'opponent', opponentSprite));
                            }
                        }
                    }
                });
            }
            else
            {
                for (let i = 0; i < 6; i++)
                {
                    if (self.numPlayers === 4)
                    {
                        let player1Card = new Card(self);
                        self.player1Hand.push(player1Card.render(650 + (i * 100), 920, 'player', opponentSprite));
    
                        let player2Card = new Card(self);
                        self.player2Hand.push(player2Card.render(650 + (i * 100), 160, 'opponent', opponentSprite));

                        let player3Card = new Card(self);
                        self.player3Hand.push(player3Card.render(180, 280 + (i * 100), 'opponent', opponentSprite));

                        self.player3Hand.forEach(card => {
                            card.angle = -90;
                        });
                        
                        let player4Card = new Card(self);
                        self.player4Hand.push(player4Card.render(1600, 280 + (i * 100), 'opponent', opponentSprite));

                        self.player4Hand.forEach(card => {
                            card.angle = -90;
                        });
                    }
                    else if (self.numPlayers === 3)
                    {
                        let player1Card = new Card(self);
                        self.player1Hand.push(player1Card.render(650 + (i * 100), 920, 'player', opponentSprite));
    
                        let player2Card = new Card(self);
                        self.player2Hand.push(player2Card.render(650 + (i * 100), 160, 'opponent', opponentSprite));

                        let player3Card = new Card(self);
                        self.player3Hand.push(player3Card.render(180, 280 + (i * 100), 'opponent', opponentSprite));

                        self.player3Hand.forEach(card => {
                            card.angle = -90;
                        });
                    }
                    else
                    {
                        let player1Card = new Card(self);
                        self.player1Hand.push(player1Card.render(650 + (i * 100), 920, 'player', opponentSprite));
    
                        let player2Card = new Card(self);
                        self.player2Hand.push(player2Card.render(650 + (i * 100), 160, 'opponent', opponentSprite));
                    }
                }
            }

            let bottomCard = new Card(self);
            self.deck.push(bottomCard.render(990, 540, 'player', trumpCard));
            self.deck[0].angle = -90;

            for (let i = currentDeck.length-2; i >= 0; i--)
            {
                let deckCard = new Card (self);
                self.deck.push(deckCard.render(960, 540, 'player', opponentSprite));
            }

            let unreverseDeck = [];

            for (let i = currentDeck.length-1; i >= 0; i--)
            {
                unreverseDeck.push(self.deck[i]);
            }

            self.deck = unreverseDeck;
        });
    }

    update()
    {

    }
}