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

let redirectNicknames = [[], []];
let redirectPlayerTotal = null;
let redirectPlayerCount = null;
let redirectSpectatorTotal = null;

let roundInProgress = false;
let currentLeader = null;



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
})

app.post('/join', (req, res) => {
    const nickname = encodeURIComponent(req.body.nickname);
    res.redirect(`/lobby?nickname=${nickname}`);
});



io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    const lobbyRoom = 'lobby';
    const playerRoom = 'players';
    const spectatorRoom = 'spectators';

    if (roundInProgress === false)
    {
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
        if (players.length === 0)
        {
            socket.join(playerRoom);
            console.log(`User with ID: ${socket.id} joined room: ${playerRoom}`);

            const player = {
                id: socket.id,
                isLeader: true,
                nickname: redirectNicknames[0].splice(0,1)[0],
                hand: []
            };

            players.push(player);

            currentLeader = {
                id: player.id,
                nickname: player.nickname
            };

            console.log(`User with ID of: ${currentLeader.id} has been set as leader`);
        }
        else if (players.length >= 1 && players.length < redirectPlayerTotal)
        {
            socket.join(playerRoom);
            console.log(`User with ID: ${socket.id} joined room: ${playerRoom}`);

            const player = {
                id: socket.id,
                isLeader: false,
                nickname: redirectNicknames[0].splice(0,1)[0],
                hand: []
            };

            players.push(player);
        }
        else
        {
            socket.join(spectatorRoom);
            console.log(`User with ID: ${socket.id} joined room: ${spectatorRoom}`);

            const spectator = {
                id: socket.id,
                nickname: redirectNicknames[1].splice(0,1)[0]
            };

            spectators.push(spectator);
        }
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

    socket.on('lobbyRedirect', () => {
        roundInProgress = true;
        console.log(`New round of Durak started with ${players.length} player(s) and ${spectators.length} spectator(s)`);

        io.in(lobbyRoom).emit('removeLobbyMenus');
        
        players.forEach(player => {
            redirectNicknames[0].push(player.nickname);
        });

        if (spectators.length > 0)
        {
            spectators.forEach(spectator => {
                redirectNicknames[1].push(spectator.nickname);
            });
        }

        redirectPlayerTotal = players.length;
        redirectPlayerCount = players.length;
        redirectSpectatorTotal = spectators.length;

        players = [];
        spectators = [];
        
        const destination = '/game';

        io.to(currentLeader.id).emit('lobbyRedirect', destination);

        setTimeout(() => {
            socket.to(playerRoom).emit('lobbyRedirect', destination);
        }, 5000);

        setTimeout(() => {
            io.in(spectatorRoom).emit('lobbyRedirect', destination);
        }, 6000);
    });

    socket.on('setRedirectLeader', () => {
        redirectPlayerCount -= 1;

        if (redirectPlayerCount === (redirectSpectatorTotal * -1))
        {
            io.to(currentLeader.id).emit('newRoundPrep');
        }
        else
        {
            io.to(socket.id).emit('setRedirectLeader', currentLeader.id);
        }
    });

    socket.on('newRoundPrep', () => {
        theDealer.resetDeck();

        players.forEach(player => {
            player.hand = theDealer.setPlayerHand();
        });

        console.log('All player hands have been set');

        const trumpSuit = theDealer.setTrumpSuit();

        console.log(`Trump suit for this round is: ${trumpSuit}`);

        io.in(playerRoom).emit('firstTurnDealPrep', 'player');
        io.in(spectatorRoom).emit('firstTurnDealPrep', 'spectator');
    });

    socket.on('firstTurnDealPrep', userType => {
        let playersInfo = [];

        for (let i = 0; i < players.length; i++)
        {
            playersInfo.push( { "id": players[i].id, "hand": players[i].hand } );
        }

        if (userType === 'player')
        {
            io.to(socket.id).emit('firstTurnDeal', userType, playersInfo);
        }
        else
        {
            io.to(socket.id).emit('firstTurnDeal', userType, playersInfo);
        }
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