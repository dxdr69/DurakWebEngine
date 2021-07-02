/* eslint-disable no-unused-vars */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ejs = require('ejs');
const Dealer = require('./dealer');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

const server = http.createServer(app);
const io = new Server(server);

const theDealer = new Dealer();

let nicknames = [];
let players = [];
let spectators = [];

let currentLeader = null;
let usersRedirected = false;
let roundInProgress = false;
let redirectUserTotal = null;



app.get('/', (req, res) => {
    res.redirect('join');
});

app.get('/join', (req, res) => {
    res.render('join');
});

app.get('/lobby', (req, res) => {
    const nickname = decodeURIComponent(req.query.nickname);
    nicknames.push(nickname);
    res.render('lobby');
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.post('/join', (req, res) => {
    const nickname = encodeURIComponent(req.body.nickname);
    res.redirect(`/lobby?nickname=${nickname}`);
});



io.on('connection', (socket) => {
    const lobbyRoom = 'lobby';
    const playerRoom = 'players';
    const spectatorRoom = 'spectators';

    if (roundInProgress === false)
    {
        console.log(`New user connected: ${socket.id}`);

        if (players.length === 0)
        {
            socket.join(lobbyRoom);
            console.log(`User with ID: ${socket.id} joined room: ${lobbyRoom}`);
            socket.join(playerRoom);
            console.log(`User with ID: ${socket.id} joined room: ${playerRoom}`);

            const player = {
                id: socket.id,
                isLeader: true,
                nickname: nicknames.splice(0,1)[0]
            };

            players.push(player);

            currentLeader = {
                id: player.id,
                nickname: player.nickname
            };

            console.log(`User with ID of: ${currentLeader.id} has been set as leader`);
            console.log(`User with ID of: ${currentLeader.id} has been given nickname: ${currentLeader.nickname}`);

            io.to(currentLeader.id).emit('changeLeaderID', currentLeader.id);
            io.to(currentLeader.id).emit('setLobbyLeader', 'leader', currentLeader.nickname);
            
            if (spectators.length > 0)
            {
                io.to(spectatorRoom).emit('setLobbyLeader', null, currentLeader.nickname);

                let spectatorNicknames = [];
                spectators.forEach(spectator => spectatorNicknames.push(spectator.nickname));

                io.in(lobbyRoom).emit('joinLobby', 'leader', null, spectatorNicknames, currentLeader.id);
            }
        }
        else if (players.length >= 1 && players.length < 4)
        {
            socket.join(lobbyRoom);
            console.log(`User with ID: ${socket.id} joined room: ${lobbyRoom}`);
            socket.join(playerRoom);
            console.log(`User with ID: ${socket.id} joined room: ${playerRoom}`);
            
            const player = {
                id: socket.id,
                isLeader: false,
                nickname: nicknames.splice(0,1)[0]
            };

            players.push(player);

            console.log(`User with ID of: ${socket.id} has been given nickname: ${player.nickname}`);

            io.to(socket.id).emit('changeLeaderID', currentLeader.id);
            io.to(socket.id).emit('setLobbyLeader', 'player', currentLeader.nickname);

            let playerNicknames = [];

            for (let i = 1; i < players.length; i++)
            {
                playerNicknames.push(players[i].nickname);
            }

            io.in(lobbyRoom).emit('joinLobby', 'leader', playerNicknames, null, currentLeader.id);
            io.in(lobbyRoom).emit('joinLobby', 'normal', playerNicknames, null, currentLeader.id);

            if (spectators.length > 0)
            {
                let spectatorNicknames = [];
                spectators.forEach(spectator => spectatorNicknames.push(spectator.nickname));
                io.to(socket.id).emit('joinLobby', 'normal', null, spectatorNicknames, currentLeader.id);
            }
        }
        else
        {
            socket.join(lobbyRoom);
            console.log(`User with ID: ${socket.id} joined room: ${lobbyRoom}`);
            socket.join(spectatorRoom);
            console.log(`User with ID: ${socket.id} joined room: ${spectatorRoom}`);

            const spectator = {
                id: socket.id,
                nickname: nicknames.splice(0,1)[0]
            };

            spectators.push(spectator);

            console.log(`User with ID of: ${socket.id} has been given nickname: ${spectator.nickname}`);

            io.to(socket.id).emit('changeLeaderID', currentLeader.id);
            io.to(socket.id).emit('setLobbyLeader', 'spectator', currentLeader.nickname);

            let playerNicknames = [];

            for (let i = 1; i < players.length; i++)
            {
                playerNicknames.push(players[i].nickname);
            }

            let spectatorNicknames = [];
            spectators.forEach(spectator => spectatorNicknames.push(spectator.nickname));

            io.in(lobbyRoom).emit('joinLobby', 'leader', null, spectatorNicknames, currentLeader.id);
            io.in(lobbyRoom).emit('joinLobby', 'normal', playerNicknames, spectatorNicknames, currentLeader.id);
        }
    }
    else
    {
        console.log(`New redirected user connected: ${socket.id}`);
        io.to(socket.id).emit('setRedirectUser');
    }
    
    socket.on('changeLeaderToSpectator', () => {
        const spectator = {
            id: currentLeader.id,
            nickname: currentLeader.nickname
        };

        players.splice(0,1);
        spectators.push(spectator);

        socket.leave(playerRoom);
        console.log(`User with ID: ${socket.id} left room: ${playerRoom}`);
        socket.join(spectatorRoom);
        console.log(`User with ID: ${socket.id} joined room: ${spectatorRoom}`);

        let spectatorNicknames = [];
        spectators.forEach(spectator => spectatorNicknames.push(spectator.nickname));

        if (players.length > 0)
        {
            players[0].isLeader = true;
            currentLeader.id = players[0].id;
            currentLeader.nickname = players[0].nickname;
            console.log(`Player with ID of: ${currentLeader.id} has been set as the new leader`);

            io.in(lobbyRoom).emit('changeLeaderID', currentLeader.id);
            io.in(lobbyRoom).emit('changeLobbyLeader', currentLeader.nickname);
            io.to(socket.id).emit('leaderToSpectator');
            io.to(currentLeader.id).emit('playerToLeader');
            io.in(lobbyRoom).emit('joinLobby', 'leader', null, spectatorNicknames, currentLeader.id);
            io.in(lobbyRoom).emit('joinLobby', 'normal', null, spectatorNicknames, currentLeader.id);
        }
        else
        {
            currentLeader = null;
            console.log('Player list currently empty');

            io.in(lobbyRoom).emit('changeLeaderID', currentLeader);
            io.in(lobbyRoom).emit('changeLobbyLeader', currentLeader);
            io.to(socket.id).emit('leaderToSpectator');
            io.in(lobbyRoom).emit('joinLobby', 'normal', null, spectatorNicknames, currentLeader);
        }
    });

    socket.on('changePlayerToSpectator', () => {
        let spectator = null;

        players.forEach(player => {
            if (socket.id === player.id)
            {
                spectator = {
                    id: player.id,
                    nickname: player.nickname
                };

                players.splice(players.indexOf(player), 1);
                spectators.push(spectator);
            }
        });

        socket.leave(playerRoom);
        console.log(`User with ID: ${socket.id} left room: ${playerRoom}`);
        socket.join(spectatorRoom);
        console.log(`User with ID: ${socket.id} joined room: ${spectatorRoom}`);

        let spectatorNicknames = [];
        spectators.forEach(spectator => spectatorNicknames.push(spectator.nickname));

        io.in(lobbyRoom).emit('changeLobbyPlayer', spectator.nickname);
        io.to(socket.id).emit('playerToSpectator');
        io.in(lobbyRoom).emit('joinLobby', 'leader', null, spectatorNicknames, currentLeader.id);
        io.in(lobbyRoom).emit('joinLobby', 'normal', null, spectatorNicknames, currentLeader.id);
    });

    socket.on('changeSpectatorToPlayer', () => {
        let player = null;

        spectators.forEach(spectator => {
            if (socket.id === spectator.id)
            {
                player = {
                    id: spectator.id,
                    isLeader: false,
                    nickname: spectator.nickname,
                    hand: []
                };

                spectators.splice(spectators.indexOf(spectator), 1);
                players.push(player);
            }
        });

        socket.leave(spectatorRoom);
        console.log(`User with ID: ${socket.id} left room: ${spectatorRoom}`);
        socket.join(playerRoom);
        console.log(`User with ID: ${socket.id} joined room: ${playerRoom}`);

        if (players.length === 1)
        {
            player.isLeader = true;

            currentLeader = {
                id: player.id,
                nickname: player.nickname
            };

            console.log(`Player with ID of: ${currentLeader.id} has been set as the new leader`);

            io.in(lobbyRoom).emit('changeLeaderID', currentLeader.id);
            io.in(lobbyRoom).emit('changeLobbySpectator', currentLeader.nickname);
            io.in(lobbyRoom).emit('changeLobbyLeader', currentLeader.nickname);
            io.to(socket.id).emit('spectatorToLeader');
        }
        else
        {
            let playerNicknames = [];

            for (let i = 1; i < players.length; i++)
            {
                playerNicknames.push(players[i].nickname);
            }

            io.in(lobbyRoom).emit('changeLobbySpectator', player.nickname);
            io.to(socket.id).emit('spectatorToPlayer');
            io.in(lobbyRoom).emit('joinLobby', 'leader', playerNicknames, null, currentLeader.id);
            io.in(lobbyRoom).emit('joinLobby', 'normal', playerNicknames, null, currentLeader.id);
        }
    });

    socket.on('lobbyRedirect', async () => {
        roundInProgress = true;
        redirectUserTotal = players.length + spectators.length;

        console.log(`New session of Durak started with ${players.length} player(s) and ${spectators.length} spectator(s)`);
        console.log('Redirecting users to game...');

        io.in(lobbyRoom).emit('removeLobbyMenus');

        const destination = '/game';

        io.in(playerRoom).fetchSockets()
           .then(playerSockets => {
                  players.forEach(player => {
                      for (const socket of playerSockets) 
                      {
                          if (socket.id === player.id && player.isLeader === true)
                          {
                              io.to(currentLeader.id).emit('lobbyRedirect', destination + `?userType=leader&nickname=${currentLeader.nickname}`);
                          }
                          else if (socket.id === player.id)
                          {
                              io.to(socket.id).emit('lobbyRedirect', destination + `?userType=player&nickname=${player.nickname}`);
                          }
                      }
                  });
            })
           .then(async () => {
                  if (spectators.length > 0)
                  {
                    io.in(spectatorRoom).fetchSockets()
                       .then(spectatorSockets => {
                              spectators.forEach(spectator => {
                                  for (const socket of spectatorSockets) 
                                  {
                                      if (socket.id === spectator.id)
                                      {
                                          io.to(socket.id).emit('lobbyRedirect', destination + `?userType=spectator&nickname=${spectator.nickname}`);
                                      }
                                  }
                              });
                       })
                  }
           })
           .catch(() => {
               console.log('Error redirecting users to game');
           });
    });

    socket.on('setRedirectUser', (userType, nickname) => {
        redirectUserTotal -= 1;

        if (userType === 'leader')
        {
            socket.join(playerRoom);
            console.log(`User with ID: ${socket.id} joined room: ${playerRoom}`);

            const player = {
                id: socket.id,
                isLeader: true,
                nickname: nickname,
                hand: []
            };

            players.push(player);

            currentLeader = {
                id: player.id,
                nickname: player.nickname
            };

            console.log(`User with ID of: ${currentLeader.id} has been set as leader`);
            console.log(`User with ID of: ${currentLeader.id} has been given nickname: ${currentLeader.nickname}`);
        }
        else if (userType === 'player')
        {
            socket.join(playerRoom);
            console.log(`User with ID: ${socket.id} joined room: ${playerRoom}`);

            const player = {
                id: socket.id,
                isLeader: false,
                nickname: nickname,
                hand: []
            };

            players.push(player);

            console.log(`User with ID of: ${socket.id} has been given nickname: ${player.nickname}`);
        }
        else
        {
            socket.join(spectatorRoom);
            console.log(`User with ID: ${socket.id} joined room: ${spectatorRoom}`);

            const spectator = {
                id: socket.id,
                nickname: nickname
            };

            spectators.push(spectator);

            console.log(`User with ID of: ${socket.id} has been given nickname: ${spectator.nickname}`);
        }

        if (redirectUserTotal === 0)
        {
            usersRedirected = true;
            console.log('All users have been redirected to game');
            io.to(playerRoom).emit('setRedirectLeader', currentLeader.id);
            io.to(spectatorRoom).emit('setRedirectLeader', currentLeader.id);
            io.to(currentLeader.id).emit('newRoundPrep');
        }
    });

    socket.on('newRoundPrep', () => {
        theDealer.resetDeck();

        players.forEach(player => {
            player.hand = theDealer.setPlayerHand();
        });

        console.log('All player hands have been set');

        const trumpSuit = theDealer.setTrumpSuit();

        switch(trumpSuit) {
            case 'C':
                console.log('Trump suit for this round is: Club');
                break;
            case 'D':
                console.log('Trump suit for this round is: Diamond');
                break;
            case 'H':
                console.log('Trump suit for this round is: Heart');
                break;
            case 'S':
                console.log('Trump suit for this round is: Spade');
                break;
            default:
                break;
        }

        io.in(playerRoom).emit('firstTurnDealPrep', 'player', players.length);
        io.in(spectatorRoom).emit('firstTurnDealPrep', 'spectator', players.length);
    });

    socket.on('firstTurnDealPrep', userType => {
        let playersInfo = [];

        for (let i = 0; i < players.length; i++)
        {
            playersInfo.push( { "id": players[i].id, "nickname": players[i].nickname, "hand": players[i].hand } );
        }

        const deck = theDealer.getDeck();
        const trumpCard = theDealer.getTrumpCard();

        io.to(socket.id).emit('firstTurnDeal', userType, playersInfo, deck, trumpCard);
    });

    socket.on('playZoneDrop', (playerID, cardKey, posX, posY) => {
        socket.to(playerRoom).emit('playZoneDrop', playerID, 'player', cardKey, posX, posY)
        io.in(spectatorRoom).emit('playZoneDrop', playerID, 'spectator', cardKey, posX, posY);
    });

    socket.on('cardDiscarded', cardKey => {
        socket.to(playerRoom).emit('cardDiscarded', cardKey);
        io.in(spectatorRoom).emit('cardDiscarded', cardKey);
    });

    socket.on('cardDrawn', (playerID, drawnCardKey) => {
        socket.to(playerRoom).emit('cardDrawn', 'player', playerID, drawnCardKey);
        io.in(spectatorRoom).emit('cardDrawn', 'spectator', playerID, drawnCardKey);
    });


    socket.on('disconnect', () => {
        console.log(`A user disconnected: ${socket.id}`);
        
        let removedUser = null;
        let userType = null;

        let disconnectedUserIndex = players.findIndex(player => player.id === socket.id);

        if (disconnectedUserIndex !== -1)
        {
            removedUser = players.splice(disconnectedUserIndex, 1)[0];
            userType = 'player';
        }
        else
        {
            disconnectedUserIndex = spectators.findIndex(spectator => spectator.id === socket.id);
            removedUser = spectators.splice(disconnectedUserIndex, 1)[0];
            userType = 'spectator';
        }

        if (roundInProgress === false)
        {
            if (userType === 'player')
            {
                if (players.length > 0 && removedUser.id === currentLeader.id)
                {
                    players[0].isLeader = true;
                    currentLeader.id = players[0].id;
                    currentLeader.nickname = players[0].nickname;
                    console.log(`Player with ID of: ${currentLeader.id} has been set as the new leader`);
        
                    io.in(lobbyRoom).emit('changeLeaderID', currentLeader.id);
                    io.in(lobbyRoom).emit('changeLobbyLeader', currentLeader.nickname);
                }
                else if (players.length > 0)
                {
                    io.in(lobbyRoom).emit('changeLobbyPlayer', removedUser.nickname);
                }
                else
                {
                    console.log('All players have disconnected');
                    
                    currentLeader = null;
    
                    io.in(lobbyRoom).emit('changeLeaderID', currentLeader);
                    io.in(lobbyRoom).emit('changeLobbyLeader', currentLeader);
                }
            }
            else
            {
                io.in(lobbyRoom).emit('changeLobbySpectator', removedUser.nickname);

                if (spectators.length === 0)
                {
                    console.log('All spectators disconnected');
                }
            }

            if (players.length === 0 && spectators.length === 0)
            {
                console.log('All users disconnected');
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
});