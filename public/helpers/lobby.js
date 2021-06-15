/* eslint-disable no-undef */
const socket = io();

socket.on('connect', () => {
    console.log('Client connected');
    console.log(`Your ID is: ${socket.id}`);
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
        document.getElementById("player-buttons").innerHTML = `<button class="btn btn-success">Start new round</button>
                                                               <button class="btn btn-danger">Become spectator</button>`;
    }

    if (userType === 'player')
    {
        document.getElementById("player-buttons").innerHTML = '<button class="btn btn-danger">Become spectator</button>';
    }

    if (userType === 'spectator')
    {
        document.getElementById("spectator-buttons").innerHTML = '<button class="btn btn-success">Become player</button>';
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