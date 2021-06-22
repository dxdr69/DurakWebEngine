/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const socket = io();

let currentLeaderID = null;

const playerForm = document.getElementById("player-buttons");
const spectatorForm = document.getElementById("spectator-buttons");

playerForm.addEventListener('submit', e => {
    e.preventDefault();
    e.stopPropagation();

    
    const playerListLength = document.getElementById("player-list")
                             .getElementsByTagName("li").length;

    if (socket.id === currentLeaderID)
    {
        if (document.activeElement.id === 'btn-start-round' && playerListLength > 1)
        {
            socket.emit('lobbyRedirect');
        }
        else
        {
            if (document.activeElement.id === 'btn-become-spectator')
            {
                socket.emit('changeLeaderToSpectator');
            }
        }
    }
    else
    {
        socket.emit('changePlayerToSpectator');
    }
});

spectatorForm.addEventListener('submit', e => {
    e.preventDefault();

    const playerListLength = document.getElementById("player-list")
                             .getElementsByTagName("li").length;

    if (playerListLength === 4)
    {
        return false;
    }
    else
    {
        socket.emit('changeSpectatorToPlayer');
    }
});



socket.on('connect', () => {
    console.log('Client connected');
    console.log(`Your ID is: ${socket.id}`);
});

socket.on('changeLeaderID', (leaderID) => {
    currentLeaderID = leaderID;
});

socket.on('leaderToSpectator', () => {
    let playerButtons = document.getElementById("player-buttons");

    while (playerButtons.childNodes.length > 0)
    {
        playerButtons.removeChild(playerButtons.childNodes[0]);
    }

    let spectatorButtons = document.getElementById("spectator-buttons");

    const btnBecomePlayer = document.createElement("button");
    btnBecomePlayer.appendChild(document.createTextNode('Become player'));
    btnBecomePlayer.setAttribute("type", "submit");
    btnBecomePlayer.setAttribute("id", "btn-become-player");
    btnBecomePlayer.setAttribute("class", "btn btn-success");

    spectatorButtons.appendChild(btnBecomePlayer);
});

socket.on('playerToLeader', () => {
    let playerButtons = document.getElementById("player-buttons");

    while (playerButtons.childNodes.length > 0)
    {
        playerButtons.removeChild(playerButtons.childNodes[0]);
    }

    const btnStartRound = document.createElement("button");
    btnStartRound.appendChild(document.createTextNode('Start new round'));
    btnStartRound.setAttribute("type", "submit");
    btnStartRound.setAttribute("id", "btn-start-round");
    btnStartRound.setAttribute("class", "btn btn-success");

    const btnBecomeSpectator = document.createElement("button");
    btnBecomeSpectator.appendChild(document.createTextNode('Become spectator'));
    btnBecomeSpectator.setAttribute("type", "submit");
    btnBecomeSpectator.setAttribute("id", "btn-become-spectator");
    btnBecomeSpectator.setAttribute("class", "btn btn-danger");

    playerButtons.appendChild(btnStartRound);
    playerButtons.appendChild(btnBecomeSpectator);
});

socket.on('playerToSpectator', () => {
    let playerButtons = document.getElementById("player-buttons");

    while (playerButtons.childNodes.length > 0)
    {
        playerButtons.removeChild(playerButtons.childNodes[0]);
    }

    let spectatorButtons = document.getElementById("spectator-buttons");

    const btnBecomePlayer = document.createElement("button");
    btnBecomePlayer.appendChild(document.createTextNode('Become player'));
    btnBecomePlayer.setAttribute("type", "submit");
    btnBecomePlayer.setAttribute("id", "btn-become-player");
    btnBecomePlayer.setAttribute("class", "btn btn-success");

    spectatorButtons.appendChild(btnBecomePlayer);
});

socket.on('spectatorToLeader', () => {
    let spectatorButtons = document.getElementById("spectator-buttons");

    while (spectatorButtons.childNodes.length > 0)
    {
        spectatorButtons.removeChild(spectatorButtons.childNodes[0]);
    }

    let playerButtons = document.getElementById("player-buttons");

    const btnStartRound = document.createElement("button");
    btnStartRound.appendChild(document.createTextNode('Start new round'));
    btnStartRound.setAttribute("type", "submit");
    btnStartRound.setAttribute("id", "btn-start-round");
    btnStartRound.setAttribute("class", "btn btn-success");

    const btnBecomeSpectator = document.createElement("button");
    btnBecomeSpectator.appendChild(document.createTextNode('Become spectator'));
    btnBecomeSpectator.setAttribute("type", "submit");
    btnBecomeSpectator.setAttribute("id", "btn-become-spectator");
    btnBecomeSpectator.setAttribute("class", "btn btn-danger");

    playerButtons.appendChild(btnStartRound);
    playerButtons.appendChild(btnBecomeSpectator);
});

socket.on('spectatorToPlayer', () => {
    let spectatorButtons = document.getElementById("spectator-buttons");

    while (spectatorButtons.childNodes.length > 0)
    {
        spectatorButtons.removeChild(spectatorButtons.childNodes[0]);
    }

    let playerButtons = document.getElementById("player-buttons");

    const btnBecomeSpectator = document.createElement("button");
    btnBecomeSpectator.appendChild(document.createTextNode('Become spectator'));
    btnBecomeSpectator.setAttribute("type", "submit");
    btnBecomeSpectator.setAttribute("id", "btn-become-spectator");
    btnBecomeSpectator.setAttribute("class", "btn btn-danger");

    playerButtons.appendChild(btnBecomeSpectator);
});

socket.on('setLobbyLeader', (userType, leaderNickname) => {
    let playerList = document.getElementById("player-list");

    let b = document.createElement("b");
    b.appendChild(document.createTextNode(`${leaderNickname} (Leader)`));

    let li = document.createElement("li");
    li.appendChild(b);
    li.setAttribute("class", "list-group-item");
    li.setAttribute("id", "leader");

    playerList.appendChild(li);

    if (userType === 'leader')
    {
        let playerButtons = document.getElementById("player-buttons");

        const btnStartRound = document.createElement("button");
        btnStartRound.appendChild(document.createTextNode('Start new round'));
        btnStartRound.setAttribute("type", "submit");
        btnStartRound.setAttribute("id", "btn-start-round");
        btnStartRound.setAttribute("class", "btn btn-success");

        const btnBecomeSpectator = document.createElement("button");
        btnBecomeSpectator.appendChild(document.createTextNode('Become spectator'));
        btnBecomeSpectator.setAttribute("type", "submit");
        btnBecomeSpectator.setAttribute("id", "btn-become-spectator");
        btnBecomeSpectator.setAttribute("class", "btn btn-danger");

        playerButtons.appendChild(btnStartRound);
        playerButtons.appendChild(btnBecomeSpectator);
    }

    if (userType === 'player')
    {
        let playerButtons = document.getElementById("player-buttons");

        const btnBecomeSpectator = document.createElement("button");
        btnBecomeSpectator.appendChild(document.createTextNode('Become spectator'));
        btnBecomeSpectator.setAttribute("type", "submit");
        btnBecomeSpectator.setAttribute("id", "btn-become-spectator");
        btnBecomeSpectator.setAttribute("class", "btn btn-danger");

        playerButtons.appendChild(btnBecomeSpectator);
    }

    if (userType === 'spectator')
    {
        let spectatorButtons = document.getElementById("spectator-buttons");

        const btnBecomePlayer = document.createElement("button");
        btnBecomePlayer.appendChild(document.createTextNode('Become player'));
        btnBecomePlayer.setAttribute("type", "submit");
        btnBecomePlayer.setAttribute("id", "btn-become-player");
        btnBecomePlayer.setAttribute("class", "btn btn-success");

        spectatorButtons.appendChild(btnBecomePlayer);
    }
});

socket.on('changeLobbyLeader', leaderNickname => {
    let playerList = document.getElementById("player-list");
    const elements = playerList.getElementsByTagName("li");
    const length = elements.length;
    
    if (leaderNickname === null)
    {
        playerList.removeChild(elements[0]);
    }
    else
    {
        if (length > 0)
        {
            playerList.removeChild(elements[0]);
            playerList.removeChild(elements[0]);

            let b = document.createElement("b");
            b.appendChild(document.createTextNode(`${leaderNickname} (Leader)`));
    
            let li = document.createElement("li");
            li.appendChild(b);
            li.setAttribute("class", "list-group-item");
            li.setAttribute("id", "leader");
    
            playerList.prepend(li);
        }
        else
        {
            let b = document.createElement("b");
            b.appendChild(document.createTextNode(`${leaderNickname} (Leader)`));
    
            let li = document.createElement("li");
            li.appendChild(b);
            li.setAttribute("class", "list-group-item");
            li.setAttribute("id", "leader");
    
            playerList.prepend(li);
        }
    }
});

socket.on('changeLobbyPlayer', oldPlayerNickname => {
    let playerList = document.getElementById("player-list");
    const elements = playerList.getElementsByTagName("li");
    const length = elements.length;

    for (let i = 0; i < length; i++)
    {
        if (elements[i].textContent === oldPlayerNickname)
        {
            playerList.removeChild(elements[i]);
            break;
        }
    }
});

socket.on('changeLobbySpectator', oldSpectatorNickname => {
    let spectatorList = document.getElementById("spectator-list");
    const elements = spectatorList.getElementsByTagName("li");
    const length = elements.length;

    for (let i = 0; i < length; i++)
    {
        if (elements[i].textContent === oldSpectatorNickname)
        {
            spectatorList.removeChild(elements[i]);
            break;
        }
    }
});

socket.on('joinLobby', (userType, playerNicknames, spectatorNicknames, currentLeaderID) => {
    if (userType === 'leader' && socket.id === currentLeaderID)
    {
        if (playerNicknames !== null)
        {
            let playerList = document.getElementById("player-list");
            const playerListLength = playerList.getElementsByTagName("li").length;
    
            for (let i = playerListLength; i <= playerNicknames.length; i++)
            {
                let li = document.createElement("li");
                li.appendChild(document.createTextNode(`${playerNicknames[i-1]}`));
                li.setAttribute("class", "list-group-item");
                li.setAttribute("id", "player");
                playerList.appendChild(li);
            }
        }

        if (spectatorNicknames !== null)
        {
            let spectatorList = document.getElementById("spectator-list");
            const spectatorListLength = spectatorList.getElementsByTagName("li").length;

            if (spectatorListLength === 0)
            {
                for (let i = 0; i < spectatorNicknames.length; i++)
                {
                    let li = document.createElement("li");
                    li.appendChild(document.createTextNode(`${spectatorNicknames[i]}`));
                    li.setAttribute("class", "list-group-item");
                    li.setAttribute("id", "spectator");
                    spectatorList.appendChild(li);
                }
            }
            else
            {
                for (let i = spectatorListLength; i < spectatorNicknames.length; i++)
                {
                    let li = document.createElement("li");
                    li.appendChild(document.createTextNode(`${spectatorNicknames[i]}`));
                    li.setAttribute("class", "list-group-item");
                    li.setAttribute("id", "spectator");
                    spectatorList.appendChild(li);
                }
            }
        }
    }

    if (userType === 'normal' && socket.id !== currentLeaderID)
    {
        if (playerNicknames !== null)
        {
            let playerList = document.getElementById("player-list");
            const playerListLength = playerList.getElementsByTagName("li").length;

            if (playerListLength === 1)
            {
                for (let i = 0; i < playerNicknames.length; i++)
                {
                    let li = document.createElement("li");
                    li.appendChild(document.createTextNode(`${playerNicknames[i]}`));
                    li.setAttribute("class", "list-group-item");
                    li.setAttribute("id", "player");
                    playerList.appendChild(li);
                }
            }
            else
            {
                for (let i = playerListLength; i <= playerNicknames.length; i++)
                {
                    let li = document.createElement("li");
                    li.appendChild(document.createTextNode(`${playerNicknames[i-1]}`));
                    li.setAttribute("class", "list-group-item");
                    li.setAttribute("id", "player");
                    playerList.appendChild(li);
                }
            }
        }

        if (spectatorNicknames !== null)
        {
            let spectatorList = document.getElementById("spectator-list");
            const spectatorListLength = spectatorList.getElementsByTagName("li").length;

            if (spectatorListLength === 0)
            {
                for (let i = 0; i < spectatorNicknames.length; i++)
                {
                    let li = document.createElement("li");
                    li.appendChild(document.createTextNode(`${spectatorNicknames[i]}`));
                    li.setAttribute("class", "list-group-item");
                    li.setAttribute("id", "spectator");
                    spectatorList.appendChild(li);
                }
            }
            else
            {
                for (let i = spectatorListLength; i < spectatorNicknames.length; i++)
                {
                    let li = document.createElement("li");
                    li.appendChild(document.createTextNode(`${spectatorNicknames[i]}`));
                    li.setAttribute("class", "list-group-item");
                    li.setAttribute("id", "spectator");
                    spectatorList.appendChild(li);
                }
            }
        }
    }
});

socket.on('removeLobbyMenus', () => {
    document.body.innerHTML = '';
});

socket.on('lobbyRedirect', destination => {
    window.location.href = destination;
});