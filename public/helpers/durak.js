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
        this.playZoneCards = [];
        
        this.player1Info = null;
        this.player2Info = null;
        this.player3Info = null;
        this.player4Info = null;

        this.add.image(960, 540, 'background');

        this.zone = new Zone(this);
        this.playZone = this.zone.renderZone(960, 540, 930, 300);
        this.outline = this.zone.renderOutline(this.playZone, 0xff69b4);

        this.zone = new Zone(this);
        this.deckZone = this.zone.renderZone(180, 160, 280, 250);
        this.outline = this.zone.renderOutline(this.deckZone, 0xfc7703);
        
        this.zone = new Zone(this);
        this.discardZone = this.zone.renderZone(1720, 160, 250, 250);
        this.outline = this.zone.renderOutline(this.discardZone, 0xff1717);
        
        this.zone = new Zone(this);
        this.player1Zone = this.zone.renderZone(960, 920, 815, 250);
        this.outline = this.zone.renderOutline(this.player1Zone, 0x17da00);

        this.zone = new Zone(this);
        this.player2Zone = this.zone.renderZone(960, 160, 815, 250);
        this.outline = this.zone.renderOutline(this.player2Zone, 0x2436ff);

        this.player3Zone = null;
        this.player4Zone = null;

        this.player1NameText = null;
        this.player1CardText = null;

        this.player2NameText = null;
        this.player2CardText = null;

        this.player3NameText = null;
        this.player3CardText = null;

        this.player4NameText = null;
        this.player4CardText = null;

        this.leaderEndGameText = null;
        this.leaderAnotherRoundText = null;



        this.input.on('dragstart', (pointer, gameObject) => {
            self.children.bringToTop(gameObject);
        });

        this.input.on('dragend', (pointer, gameObject, dropped) => {
            if (!dropped)
            {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('drop', (pointer, gameObject, dropZone) => {
            if (dropZone === this.playZone)
            {
                if (this.playZoneCards.includes(gameObject) || gameObject.texture.key === 'cardBack')
                {
                    return;
                }
                else
                {
                    this.playZoneCards.push(gameObject);
                    this.player1Info.hand.splice(this.player1Info.hand.indexOf(gameObject), 1);
                    this.player1CardText.setText([`Cards: ${this.player1Info.hand.length}`]);
                    const posX = gameObject.x;
                    const posY = gameObject.y;
                    const cardKey = gameObject.texture.key;
                    this.socket.emit('playZoneDrop', self.socket.id, cardKey, posX, posY);
                }
            }
            else if (dropZone === this.discardZone)
            {
                if (gameObject.texture.key === 'cardBack')
                {
                    return;
                }
                else
                {
                    this.playZoneCards.splice(this.playZoneCards.indexOf(gameObject), 1);
                    const cardKey = gameObject.texture.key;
                    gameObject.destroy();
                    this.socket.emit('cardDiscarded', cardKey);
                }
            }
            else if (dropZone === this.player1Zone)
            {
                if (gameObject.texture.key === 'cardBack')
                {
                    const drawnCardKey = self.deck.shift().name;
                    gameObject.setTexture(drawnCardKey);
                    this.player1Info.hand.push(gameObject);
                    this.player1CardText.setText([`Cards: ${this.player1Info.hand.length}`]);
                    this.socket.emit('cardDrawn', self.socket.id, null);
                }
                else if (self.deck.length === 1)
                {
                    self.deck.shift();
                    gameObject.setAngle(0);
                    this.player1Info.hand.push(gameObject);
                    this.player1CardText.setText([`Cards: ${this.player1Info.hand.length}`]);
                    this.socket.emit('cardDrawn', self.socket.id, null);
                }
                else
                {
                    if (this.player1Info.hand.includes(gameObject))
                    {
                        return;
                    }
                    else
                    {
                        this.player1Info.hand.push(gameObject);
                        this.player1CardText.setText([`Cards: ${this.player1Info.hand.length}`]);
                        const drawnCardKey = gameObject.texture.key;
                        this.socket.emit('cardDrawn', self.socket.id, drawnCardKey);
                    }
                }
            }
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

            if (self.numPlayers === 4)
            {
                this.zone = new Zone(this);
                this.player3Zone = this.zone.renderZone(180, 710, 250, 730);
                this.outline = this.zone.renderOutline(this.player3Zone, 0x2436ff);

                this.zone = new Zone(this);
                this.player4Zone = this.zone.renderZone(1720, 710, 250, 730);
                this.outline = this.zone.renderOutline(this.player4Zone, 0x2436ff);
            }
            else if (self.numPlayers === 3)
            {
                this.zone = new Zone(this);
                this.player3Zone = this.zone.renderZone(180, 710, 250, 730);
                this.outline = this.zone.renderOutline(this.player3Zone, 0x2436ff);
            }
    
            this.socket.emit('firstTurnDealPrep', userType);
        });

        this.socket.on('firstTurnDeal', (userType, playersInfo, currentDeck, trumpCard) => {
            let playersInfoCopy = Array.from(playersInfo);

            if (userType === 'player')
            {
                for (let i = 0; i < playersInfoCopy.length; i++)
                {
                    if (playersInfoCopy[i].id === self.socket.id)
                    {
                        self.player1Info = {
                            id: playersInfoCopy[i].id,
                            nickname: playersInfoCopy[i].nickname,
                            hand: []
                        };
    
                        playersInfoCopy.splice(i,1);
                        break;
                    }
                }
            }
            else
            {
                self.player1Info = {
                    id: playersInfoCopy[0].id,
                    nickname: playersInfoCopy[0].nickname,
                    hand: []
                };

                playersInfoCopy.splice(0,1);
            }

            self.player2Info = {
                id: playersInfoCopy[0].id,
                nickname: playersInfoCopy[0].nickname,
                hand: []
            };

            playersInfoCopy.splice(0,1);

            if (self.numPlayers === 4)
            {
                self.player3Info = {
                    id: playersInfoCopy[0].id,
                    nickname: playersInfoCopy[0].nickname,
                    hand: []
                };

                playersInfoCopy.splice(0,1);

                self.player4Info = {
                    id: playersInfoCopy[0].id,
                    nickname: playersInfoCopy[0].nickname,
                    hand: []
                };

                playersInfoCopy.splice(0,1);
            }
            else if (self.numPlayers === 3)
            {
                self.player3Info = {
                    id: playersInfoCopy[0].id,
                    nickname: playersInfoCopy[0].nickname,
                    hand: []
                };

                playersInfoCopy.splice(0,1);
            }

            const opponentSprite = 'cardBack';

            if (userType === 'player')
            {
                playersInfo.forEach(player => {
                    if (player.id === self.socket.id)
                    {
                        for (let i = 0; i < 6; i++)
                        {
                            let player1Card = new Card(self);
                            self.player1Info.hand.push(player1Card.render(700 + (i * 100), 920, 'player', player.hand[i]));
        
                            let player2Card = new Card(self);
                            self.player2Info.hand.push(player2Card.render(700 + (i * 100), 160, 'opponent', opponentSprite));

                            if (self.numPlayers === 4)
                            {
                                let player3Card = new Card(self);
                                self.player3Info.hand.push(player3Card.render(180, 480 + (i * 100), 'opponent', opponentSprite));
                                
                                let player4Card = new Card(self);
                                self.player4Info.hand.push(player4Card.render(1720, 480 + (i * 100), 'opponent', opponentSprite));

                                if (i === 5)
                                {
                                    self.player3Info.hand.forEach(card => {
                                        card.angle = -90;
                                    });

                                    self.player4Info.hand.forEach(card => {
                                        card.angle = -90;
                                    });
                                }
                            }
                            else if (self.numPlayers === 3)
                            {
                                let player3Card = new Card(self);
                                self.player3Info.hand.push(player3Card.render(180, 480 + (i * 100), 'opponent', opponentSprite));

                                if (i === 5)
                                {
                                    self.player3Info.hand.forEach(card => {
                                        card.angle = -90;
                                    });
                                }
                            }
                        }
                    }
                });
            }
            else
            {
                for (let i = 0; i < 6; i++)
                {
                    let player1Card = new Card(self);
                    self.player1Info.hand.push(player1Card.render(700 + (i * 100), 920, 'opponent', opponentSprite));

                    let player2Card = new Card(self);
                    self.player2Info.hand.push(player2Card.render(700 + (i * 100), 160, 'opponent', opponentSprite));

                    if (self.numPlayers === 4)
                    {
                        let player3Card = new Card(self);
                        self.player3Info.hand.push(player3Card.render(180, 480 + (i * 100), 'opponent', opponentSprite));
                        
                        let player4Card = new Card(self);
                        self.player4Info.hand.push(player4Card.render(1720, 480 + (i * 100), 'opponent', opponentSprite));

                        if (i === 5)
                        {
                            self.player3Info.hand.forEach(card => {
                                card.angle = -90;
                            });

                            self.player4Info.hand.forEach(card => {
                                card.angle = -90;
                            });
                        }
                    }
                    else if (self.numPlayers === 3)
                    {
                        let player3Card = new Card(self);
                        self.player3Info.hand.push(player3Card.render(180, 480 + (i * 100), 'opponent', opponentSprite));

                        if (i === 5)
                        {
                            self.player3Info.hand.forEach(card => {
                                card.angle = -90;
                            });
                        }
                    }
                }
            }

            if (userType === 'player')
            {
                let bottomCard = new Card(self);
                self.deck.push(bottomCard.render(160, 160, 'player', trumpCard).setAngle(-90).setName(trumpCard));
    
                for (let i = currentDeck.length-2; i >= 0; i--)
                {
                    let deckCard = new Card (self);
                    self.deck.push(deckCard.render(180, 160, 'player', opponentSprite).setName(currentDeck[i]));
                }
    
                let unreverseDeck = [];
    
                for (let i = self.deck.length-1; i >= 0; i--)
                {
                    unreverseDeck.push(self.deck[i]);
                }
    
                self.deck = Array.from(unreverseDeck);
            }
            else
            {
                let bottomCard = new Card(self);
                self.deck.push(bottomCard.render(160, 160, 'opponent', trumpCard).setAngle(-90).setName(trumpCard));
    
                for (let i = currentDeck.length-2; i >= 0; i--)
                {
                    let deckCard = new Card (self);
                    self.deck.push(deckCard.render(180, 160, 'opponent', opponentSprite).setName(currentDeck[i]));
                }
    
                let unreverseDeck = [];
    
                for (let i = self.deck.length-1; i >= 0; i--)
                {
                    unreverseDeck.push(self.deck[i]);
                }
    
                self.deck = Array.from(unreverseDeck);
            }

            let text = new Text(self);
            self.player1NameText = text.renderText(710, 770, [`${self.player1Info.nickname}`], false);
            self.player1CardText = text.renderText(1100, 770, [`Cards: ${self.player1Info.hand.length}`], false);

            self.player2NameText = text.renderText(710, 300, [`${self.player2Info.nickname}`], false);
            self.player2CardText = text.renderText(1100, 300, [`Cards: ${self.player2Info.hand.length}`], false);

            if (self.numPlayers === 3)
            {
                self.player3NameText = text.renderText(310, 435, [`${self.player3Info.nickname}`], false);
                self.player3CardText = text.renderText(310, 450, [`Cards: ${self.player3Info.hand.length}`], false);
            }
            else if (self.numPlayers === 4)
            {
                self.player3NameText = text.renderText(310, 435, [`${self.player3Info.nickname}`], false);
                self.player3CardText = text.renderText(310, 450, [`Cards: ${self.player3Info.hand.length}`], false);

                self.player4NameText = text.renderText(1530, 445, [`${self.player4Info.nickname}`], false);
                self.player4CardText = text.renderText(1530, 460, [`Cards: ${self.player4Info.hand.length}`], false);
            }

            if (self.socket.id === self.currentLeaderID)
            {
                self.leaderAnotherRoundText = text.renderText(325, 250, ['Start another round'], true);
                self.leaderEndGameText = text.renderText(325, 265, ['End session'], true);
            }
        });

        this.socket.on('playZoneDrop', (playerID, userType, cardKey, posX, posY) => { 
            if (userType === 'player')
            {
                if (self.player2Info.id === playerID)
                {
                    const card = self.player2Info.hand.splice(0,1)[0].setX(posX).setY(posY).
                                                       setAngle(0).setTexture(cardKey).setInteractive();
                    self.playZoneCards.push(card);                                   
                    self.children.bringToTop(card);
                    self.input.setDraggable(card);
                    self.player2CardText.setText([`Cards: ${self.player2Info.hand.length}`]);
                }
                else
                {
                    if (self.numPlayers === 4)
                    {
                        if (self.player3Info.id === playerID)
                        {
                            
                            const card = self.player3Info.hand.splice(0,1)[0].setX(posX).setY(posY).
                                                               setAngle(0).setTexture(cardKey).setInteractive();
                            self.playZoneCards.push(card);                                   
                            self.children.bringToTop(card);
                            self.input.setDraggable(card);
                            self.player3CardText.setText([`Cards: ${self.player3Info.hand.length}`]);                     
                        }
                        else
                        {
                            const card = self.player4Info.hand.splice(0,1)[0].setX(posX).setY(posY).
                                                               setAngle(0).setTexture(cardKey).setInteractive();
                            self.playZoneCards.push(card);                                   
                            self.children.bringToTop(card);
                            self.input.setDraggable(card);
                            self.player4CardText.setText([`Cards: ${self.player4Info.hand.length}`]);                       
                        }
                    }
                    else
                    {
                        const card = self.player3Info.hand.splice(0,1)[0].setX(posX).setY(posY).
                                                           setAngle(0).setTexture(cardKey).setInteractive();
                        self.playZoneCards.push(card);                                   
                        self.children.bringToTop(card);
                        self.input.setDraggable(card);
                        self.player3CardText.setText([`Cards: ${self.player3Info.hand.length}`]);      
                    }
                }
            }
            else
            {
                if (self.player1Info.id === playerID)
                {
                    const card = self.player1Info.hand.splice(0,1)[0].setX(posX).setY(posY).setAngle(0).setTexture(cardKey);                                  
                    self.children.bringToTop(card);
                    self.player1CardText.setText([`Cards: ${self.player1Info.hand.length}`]);      
                }
                else if (self.player2Info.id === playerID)
                {
                    const card = self.player2Info.hand.splice(0,1)[0].setX(posX).setY(posY).setAngle(0).setTexture(cardKey);                                  
                    self.children.bringToTop(card);
                    self.player2CardText.setText([`Cards: ${self.player2Info.hand.length}`]);
                }
                else
                {
                    if (self.numPlayers === 4)
                    {
                        if (self.player3Info.id === playerID)
                        {
                            const card = self.player3Info.hand.splice(0,1)[0].setX(posX).setY(posY).setAngle(0).setTexture(cardKey);                                  
                            self.children.bringToTop(card);
                            self.player3CardText.setText([`Cards: ${self.player3Info.hand.length}`]);
                        }
                        else
                        {
                            const card = self.player4Info.hand.splice(0,1)[0].setX(posX).setY(posY).setAngle(0).setTexture(cardKey);                                  
                            self.children.bringToTop(card);
                            self.player4CardText.setText([`Cards: ${self.player4Info.hand.length}`]);
                        }
                    }
                    else
                    {
                        const card = self.player3Info.hand.splice(0,1)[0].setX(posX).setY(posY).setAngle(0).setTexture(cardKey);                                  
                        self.children.bringToTop(card);
                        self.player3CardText.setText([`Cards: ${self.player3Info.hand.length}`]);
                    }
                }
            }
        });

        this.socket.on('cardDiscarded', cardKey => {
            for (let i = 0; i < self.playZoneCards.length; i++)
            {
                if (self.playZoneCards[i].texture.key === cardKey)
                {
                    self.playZoneCards[i].destroy();
                }
            }
        });

        this.socket.on('cardDrawn', (userType, playerID, drawnCardKey) => {
            if (drawnCardKey === null)
            {
                if (userType === 'player')
                {
                    const drawnCard = self.deck.shift();
    
                    if (self.player2Info.id === playerID)
                    {
                        drawnCard.setX(700).setY(160).disableInteractive();
                        self.player2Info.hand.push(drawnCard);
                        self.player2CardText.setText([`Cards: ${self.player2Info.hand.length}`]);
                    }
                    else
                    {
                        if (self.numPlayers === 4)
                        {
                            if (self.player3Info.id === playerID)
                            {
                                drawnCard.setX(180).setY(480).setAngle(-90).disableInteractive();
                                self.player3Info.hand.push(drawnCard);
                                self.player3CardText.setText([`Cards: ${self.player3Info.hand.length}`]);
                            }
                            else
                            {
                                drawnCard.setX(1720).setY(480).setAngle(-90).disableInteractive();
                                self.player4Info.hand.push(drawnCard);
                                self.player4CardText.setText([`Cards: ${self.player4Info.hand.length}`]);
                            }
                        }
                        else
                        {
                            drawnCard.setX(180).setY(480).setAngle(-90).disableInteractive();
                            self.player3Info.hand.push(drawnCard);
                            self.player3CardText.setText([`Cards: ${self.player3Info.hand.length}`]);
                        }
                    }
                }
                else
                {
                    const drawnCard = self.deck.shift();
    
                    if (self.player1Info.id === playerID)
                    {
                        drawnCard.setX(700).setY(920).disableInteractive();
                        self.player1Info.hand.push(drawnCard);
                        self.player1CardText.setText([`Cards: ${self.player1Info.hand.length}`]);
                    }
                    else if (self.player2Info.id === playerID)
                    {
                        drawnCard.setX(700).setY(160).disableInteractive();
                        self.player2Info.hand.push(drawnCard);
                        self.player2CardText.setText([`Cards: ${self.player2Info.hand.length}`]);
                    }
                    else
                    {
                        if (self.numPlayers === 4)
                        {
                            if (self.player3Info.id === playerID)
                            {
                                drawnCard.setX(180).setY(480).setAngle(-90).disableInteractive();
                                self.player3Info.hand.push(drawnCard);
                                self.player3CardText.setText([`Cards: ${self.player3Info.hand.length}`]);
                            }
                            else
                            {
                                drawnCard.setX(1720).setY(480).setAngle(-90).disableInteractive();
                                self.player4Info.hand.push(drawnCard);
                                self.player4CardText.setText([`Cards: ${self.player4Info.hand.length}`]);
                            }
                        }
                        else
                        {
                            drawnCard.setX(180).setY(480).setAngle(-90).disableInteractive();
                            self.player3Info.hand.push(drawnCard);
                            self.player3CardText.setText([`Cards: ${self.player3Info.hand.length}`]);
                        }
                    }
                }
            }
            else
            {
                let drawnCard = null;

                for (let i = 0; i < self.playZoneCards.length; i++)
                {
                    if (self.playZoneCards[i].texture.key === drawnCardKey)
                    {
                        drawnCard = self.playZoneCards[i];
                        break;
                    }
                }

                if (userType === 'player')
                {
                    if (self.player2Info.id === playerID)
                    {
                        drawnCard.setX(700).setY(160).setTexture('cardBack').disableInteractive();
                        self.player2Info.hand.push(drawnCard);
                        self.player2CardText.setText([`Cards: ${self.player2Info.hand.length}`]);
                    }
                    else
                    {
                        if (self.numPlayers === 4)
                        {
                            if (self.player3Info.id === playerID)
                            {
                                drawnCard.setX(180).setY(480).setAngle(-90).setTexture('cardBack').disableInteractive();
                                self.player3Info.hand.push(drawnCard);
                                self.player3CardText.setText([`Cards: ${self.player3Info.hand.length}`]);
                            }
                            else
                            {
                                drawnCard.setX(1720).setY(480).setAngle(-90).setTexture('cardBack').disableInteractive();
                                self.player4Info.hand.push(drawnCard);
                                self.player4CardText.setText([`Cards: ${self.player4Info.hand.length}`]);
                            }
                        }
                        else
                        {
                            drawnCard.setX(180).setY(480).setAngle(-90).setTexture('cardBack').disableInteractive();
                            self.player3Info.hand.push(drawnCard);
                            self.player3CardText.setText([`Cards: ${self.player3Info.hand.length}`]);
                        }
                    }
                }
                else
                {
                    if (self.player1Info.id === playerID)
                    {
                        drawnCard.setX(700).setY(920).setTexture('cardBack').disableInteractive();
                        self.player1Info.hand.push(drawnCard);
                        self.player1CardText.setText([`Cards: ${self.player1Info.hand.length}`]);
                    }
                    else if (self.player2Info.id === playerID)
                    {
                        drawnCard.setX(700).setY(160).setTexture('cardBack').disableInteractive();
                        self.player2Info.hand.push(drawnCard);
                        self.player2CardText.setText([`Cards: ${self.player2Info.hand.length}`]);
                    }
                    else
                    {
                        if (self.numPlayers === 4)
                        {
                            if (self.player3Info.id === playerID)
                            {
                                drawnCard.setX(180).setY(480).setAngle(-90).setTexture('cardBack').disableInteractive();
                                self.player3Info.hand.push(drawnCard);
                                self.player3CardText.setText([`Cards: ${self.player3Info.hand.length}`]);
                            }
                            else
                            {
                                drawnCard.setX(1720).setY(480).setAngle(-90).setTexture('cardBack').disableInteractive();
                                self.player4Info.hand.push(drawnCard);
                                self.player4CardText.setText([`Cards: ${self.player4Info.hand.length}`]);
                            }
                        }
                        else
                        {
                            drawnCard.setX(180).setY(480).setAngle(-90).setTexture('cardBack').disableInteractive();
                            self.player3Info.hand.push(drawnCard);
                            self.player3CardText.setText([`Cards: ${self.player3Info.hand.length}`]);
                        }
                    }
                }
            }
        });
    }

    update()
    {

    }
}