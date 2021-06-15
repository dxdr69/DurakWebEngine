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

let nicknames = [];
let players = [];
let spectators = [];

let currentLeader = null;

const theDealer = new Dealer();



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

app.post('/join', (req, res) => {
    const nickname = encodeURIComponent(req.body.nickname);
    res.redirect(`/lobby?nickname=${nickname}`);
});



io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    const lobbyRoom = 'lobby';
    const playerRoom = 'players';
    const spectatorRoom = 'spectators';

    if (players.length === 0)
    {
        socket.join(lobbyRoom);
        console.log(`User with ID: ${socket.id} joined room: ${lobbyRoom}`);
        socket.join(playerRoom);
        console.log(`User with ID: ${socket.id} joined room: ${playerRoom}`);

        const player = {
            id: socket.id,
            isLeader: true,
            nickname: nicknames.splice(0,1)[0],
            hand: []
        };

        players.push(player);

        currentLeader = {
            id: player.id,
            nickname: player.nickname
        };

        console.log(`User with ID of: ${currentLeader.id} has been set as leader`);
        io.to(currentLeader.id).emit('setLobbyLeader', 'leader', currentLeader.nickname);
        
        if (spectators.length > 0)
        {
            io.to(spectatorRoom).emit('setLobbyLeader', null, currentLeader.nickname);

            let spectatorNicknames = [];

            for (let i = 0; i < spectators.length; i++)
            {
                spectatorNicknames.push(spectators[i].nickname);
            }

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
            nickname: nicknames.splice(0,1)[0],
            hand: []
        };

        players.push(player);

        io.to(socket.id).emit('setLobbyLeader', 'player', currentLeader.nickname);


        let playerNicknames = [];

        for (let i = 1; i < players.length; i++)
        {
            playerNicknames.push(players[i].nickname);
        }

        io.in(lobbyRoom).emit('joinLobby', 'leader', playerNicknames, null, currentLeader.id);
        io.in(lobbyRoom).emit('joinLobby', 'normal', playerNicknames, null, currentLeader.id);
    }
    else
    {
        socket.join(lobbyRoom);
        console.log(`User with ID: ${socket.id} joined room: ${lobbyRoom}`);
        socket.join(spectatorRoom);
        console.log(`User with ID: ${socket.id} joined room: ${spectatorRoom}`);

        let spectator = {
            id: socket.id,
            nickname: nicknames.splice(0,1)[0]
        };

        spectators.push(spectator);

        io.to(socket.id).emit('setLobbyLeader', 'spectator', currentLeader.nickname);


        let playerNicknames = [];

        for (let i = 1; i < players.length; i++)
        {
            playerNicknames.push(players[i].nickname);
        }

        let spectatorNicknames = [];

        for (let i = 0; i < spectators.length; i++)
        {
            spectatorNicknames.push(spectators[i].nickname);
        }

        io.in(lobbyRoom).emit('joinLobby', 'leader', null, spectatorNicknames, currentLeader.id);
        io.in(lobbyRoom).emit('joinLobby', 'normal', playerNicknames, spectatorNicknames, currentLeader.id);
    }

    socket.on('newRoundPrep', () => {
        theDealer.resetDeck();

        players.forEach(player => {
            player.hand = theDealer.setPlayerHand();
        });

        console.log('All players hands have been set');

        const trumpSuit = theDealer.setTrumpSuit();

        console.log(`Trump suit for this round is: ${trumpSuit}`);

        io.in(playerRoom).emit('firstTurnDealPrep');
    });

    socket.on('firstTurnDealPrep', () => {
        let playersInfo = [];

        for (let i = 0; i < players.length; i++)
        {
            playersInfo.push( { "id": players[i].id, "hand": players[i].hand } );
        }

        io.to(playerRoom).emit('firstTurnDeal', playersInfo);
    });

    socket.on('disconnect', () => {
        console.log(`A user disconnected: ${socket.id}`);

        let disconnectedUserIndex = players.findIndex(player => player.id === socket.id);

        if (disconnectedUserIndex !== -1)
        {
            players.splice(disconnectedUserIndex, 1);
        }
        else
        {
            disconnectedUserIndex = spectators.findIndex(spectator => spectator.id === socket.id);
            spectators.splice(disconnectedUserIndex, 1);
        }
        
        if (players.length > 0)
        {
            players[0].isLeader = true;
            currentLeader.id = players[0].id;
            currentLeader.nickname = players[0].nickname;
            console.log(`Player with ID of: ${currentLeader.id} has been set as the new leader`);
        }
        else
        {
            console.log('All players have disconnected');
        }
    });
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
});