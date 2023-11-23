const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');


// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2306-FTB-MT-WEB-PT';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`;


/**
* It fetches all players from the API and returns them
* @returns An array of objects.
*/
const renderNewPlayerForm = () => {
    const formHTML = `
        <form id="addPlayerForm">
            <label for="playerName">Player Name:</label>
            <input type="text" id="playerName" name="playerName" required>
            <label for="playerBreed">Player Breed:</label>
            <input type="text" id="playerBreed" name="playerBreed" required>
            <label for="playerStatus">Player Status:</label>
            <input type="text" id="playerStatus" name="playerStatus" required>
            <button type="submit">Add Player</button>
        </form>
    `;
    newPlayerFormContainer.innerHTML = formHTML;

    const addPlayerForm = document.getElementById('addPlayerForm');
    addPlayerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const playerName = document.getElementById('playerName').value;
        const playerBreed = document.getElementById('playerBreed').value;
        const playerStatus = document.getElementById('playerStatus').value;
    
        const newPlayer = await addNewPlayer({
            name: playerName,
            breed: playerBreed,
            status: playerStatus,
        });
    
        // Wait for a short period (e.g., 500 milliseconds)
        await new Promise((resolve) => setTimeout(resolve, 500));
    
        // Fetch the updated list of players
        const updatedPlayers = await fetchAllPlayers();
    
        // Render all players with the updated list
        renderAllPlayers(updatedPlayers.data.players);
    
        // Reset the form
        addPlayerForm.reset();
    });
};

const fetchAllPlayers = async () => {
   try {
       const response = await fetch(`${APIURL}/players`);
       const players = await response.json();
       console.log(players)
       console.log(players.data.players)
       return players;
   } catch (err) {
       console.error('Uh oh, trouble fetching players!', err);
   }
};


const fetchSinglePlayer = async (playerId) => {
    try {
        const response = await fetch(`${APIURL}/players/${playerId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch player #${playerId}`);
        }
        const playerData = await response.json();
        const playerDetails = playerData?.data?.player; // Accessing the nested player object
        console.log(playerDetails); // Log the playerDetails object
        renderPlayerDetails(playerId, playerDetails);
    } catch (err) {
//         console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    }
};

const renderPlayerDetails = (playerId, playerDetails) => {
    // Add a unique identifier to each player card
    const playerCard = document.getElementById(`player-${playerId}`);

    const existingDetails = playerCard.querySelector('.player-details');
    const detailsButton = playerCard.querySelector('.details-button');

    if (existingDetails) {
        // If details exist, remove them and change button text to “See details”
        existingDetails.remove();
        detailsButton.textContent = 'See Details';
    } else {
        // If details don’t exist, render them and change button text to “Hide details”
        const detailsHTML = `
            <div class="player-details">
                <h3>Player Details</h3>
                <p>Name: ${playerDetails.name}</p>
                <p>Breed: ${playerDetails.breed}</p>
                <p>Status: ${playerDetails.status}</p>
                <img src="${playerDetails.imageUrl}" alt="${playerDetails.name} Image">
                <!-- Add other details as needed -->
            </div>
        `;
        playerCard.insertAdjacentHTML('beforeend', detailsHTML);
        detailsButton.textContent = 'Hide Details';
    }
};



const addNewPlayer = async (playerObj) => {
    try {
        console.log(playerObj)
        const response = await fetch(`${APIURL}/players`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerObj),
        });
        const newPlayer = await response.json();
        console.log(newPlayer)
        renderSinglePlayer(newPlayer);

        const updatedPlayers = await fetchAllPlayers();
        renderAllPlayers(updatedPlayers.data.players);
    } catch (err) {
        console.error('Oops, something went wrong with adding that player!', err);
    }
};


const removePlayer = async (playerId) => {
    try {
        await fetch(`${APIURL}/players/${playerId}`, {
            method: 'DELETE',
        });
        const updatedPlayers = await fetchAllPlayers();
        renderAllPlayers(updatedPlayers.data.players);
    } catch (err) {
        console.error(`Whoops, trouble removing player #${playerId} from the roster!`, err);
    }
};


/**
* It takes an array of player objects, loops through them, and creates a string of HTML for each
* player, then adds that string to a larger string of HTML that represents all the players.
*
* Then it takes that larger string of HTML and adds it to the DOM.
*
* It also adds event listeners to the buttons in each player card.
*
* The event listeners are for the "See details" and "Remove from roster" buttons.
*
* The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
* API to get the details for a single player.
*
* The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
* the API to remove a player from the roster.
*
* The `fetchSinglePlayer` and `removePlayer` functions are defined in the
* @param playerList - an array of player objects
* @returns the playerContainerHTML variable.
*/


// const renderSinglePlayer = (playerObj) => {
//     playerContainer.innerHTML = '';
//     //pass eachPlayer
//     console.log(playerObj)
// }


const renderSinglePlayer = (playerObj) => {
    // Assuming playerObj is an object with player details
    const playerCard = document.createElement('div');
    playerCard.id = `player-${playerObj.id}`;

    const detailsButton = document.createElement('button');
    detailsButton.innerHTML = 'See Details';
    detailsButton.addEventListener('click', async () => {
        await fetchSinglePlayer(playerObj.id);
    });

    const removeButton = document.createElement('button');
    removeButton.innerHTML = 'Remove from Roster';
    removeButton.addEventListener('click', () => {
        removePlayer(playerObj.id);
    });

    playerCard.appendChild(document.createTextNode(`Name: ${playerObj.name}`));
    playerCard.appendChild(detailsButton);
    playerCard.appendChild(removeButton);

    // Append the player card to the container
    playerContainer.appendChild(playerCard);
};

// Modify renderAllPlayers to use renderSinglePlayer
const renderAllPlayers = (playerList) => {
    playerContainer.innerHTML = '';
    playerList.forEach((eachPlayer) => {
        renderSinglePlayer(eachPlayer);
    });
};

const init = async () => {
    const players = await fetchAllPlayers();
    renderAllPlayers(players.data.players);
    console.log(players);

    renderNewPlayerForm();
};

init();

