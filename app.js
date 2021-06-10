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

let players = [];
let spectators = [];
const theDealer = new Dealer();
let currentLeaderID = null;



app.get('/', (req, res) => {
    res.render('home');
});



io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    const playerRoom = 'players';
    const spectatorRoom = 'spectators';

    if (players.length === 0)
    {
        currentLeaderID = socket.id;

        socket.join(playerRoom);
        console.log(`User with ID: ${socket.id} joined room: ${playerRoom}`);

        const player = {
            id: socket.id,
            hand: [],
            isLeader: true
        };

        players.push(player);

        io.to(currentLeaderID).emit('isLeader');
        console.log(`User with ID of: ${socket.id} has been set as leader`);
    }
    else if (players.length < 2)
    {
        socket.join(playerRoom);
        console.log(`User with ID: ${socket.id} joined room: ${playerRoom}`);

        const player = {
            id: socket.id,
            hand: [],
            isLeader: false
        };

        players.push(player);


        io.to(currentLeaderID).emit('newRoundPrep');
        console.log(`New round of Durak started with 2 players`);
    }
    else if (players.length >= 2 && players.length < 4 )
    {
        let player = {
            id: socket.id,
            hand: [],
            isLeader: false
        };

        players.push(player);

        console.log(`New round of Durak started with ${players.length} players`);
    }
    else
    {
        let spectator = {
            id: socket.id
        };

        spectators.push(spectator);

        io.emit('spectate');
    }
    
    socket.on('newRoundPrep', () => {
        theDealer.resetDeck();

        players.forEach(player => {
            player.hand = theDealer.serverDealCardsNewRound();
        });

        console.log('All players have been dealt their first hand');

        const trumpSuit = theDealer.serverSetTrumpSuit();

        console.log(`Trump suit for this round is: ${trumpSuit}`);

        io.in(playerRoom).emit('newRoundDealPrep');
    });

    socket.on('newRoundDealPrep', () => {
        let playersInfo = [];

        for (let i = 0; i < players.length; i++)
        {
            playersInfo.push( { "id": players[i].id, "hand": players[i].hand } );
        }

        io.to(playerRoom).emit('newRoundDeal', playersInfo);
    });

    socket.on('cardPlayedTo', (game, isTurnToPlay) => {
        //io.emit('cardPlayedTo', gameObject, isTurnToPlay)
    });

    socket.on('cardPlayedOn', (game, isBeingPlayedTo) => {
        //io.emit('cardPlayedOn', gameObject, isBeingPlayedTo)
    })

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
            currentLeaderID = players[0].id;
            console.log(`Player with ID of: ${currentLeaderID} has been set as the new leader`);
            io.to(currentLeaderID).emit('isLeader');
        }
    });
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
});