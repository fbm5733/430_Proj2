let currentTeam = {};
let currentSpecies = {};

const handleTeam = (e) => {
    e.preventDefault();

    $("#teamMessage").animate({width:'hide'},350);
    
    sendAjax( 'POST', $("#teamForm").attr("action"), $("#teamForm").serialize(), function() {
        loadTeamsFromServer();
    });

    return false;
};

const TeamForm = (props) => {
    return (
        <form id="teamForm"
                onSubmit={handleTeam}
                name="teamForm"
                action="/maker"
                method="POST"
                className="teamForm"
            >
            <label htmlFor="name">Name: </label>
            <input id="teamName" type="text" name="name" placeholder="Team Name" />
            <input type="hidden" id='csrf' name="_csrf" value={props.csrf} />
            <input className="makeTeamSubmit" type="submit" value="New Team" />
        </form>
    );
};
    
const TeamList = function(props) {
    if(props.teams.length === 0) {
        return (
            <div className="teamList">
                <h3 className="emptyTeam">No Teams yet</h3>
            </div>
        );
    }

    const teamNodes = props.teams.map(function(team) {

        const memberNodes = [];

        //iterates 6 times, once each possible team member
        //ones that don't exist will have an empty member created
        for(let i = 0; i < 6; i++) {
            //get the team member from the object
            let species = team.members[i];

            //creates the team member
            let teamMember = document.createElement("div");
            teamMember.className = "teamMember";

            //if it exists then add it, if not make an empty spot
            if(species && species.image) {
                //gives it the image
                memberNodes.push(
                    <div className="teamMember"> 
                        <img src={species.image} alt={species.name}/>
                        <h3>{species.name}</h3>
                    </div>
                );
            } else {
                // http://probablyprogramming.com/wp-content/uploads/2009/03/handtinytrans.gif
                // http://probablyprogramming.com/2009/03/15/the-tiniest-gif-ever
                //This is a very small gif file that will be used in place of a pokemon image if 
                //there isn't a pokemon in that slot of the team.
                memberNodes.push(
                    <div className="teamMember"> 
                        <img src="http://probablyprogramming.com/wp-content/uploads/2009/03/handtinytrans.gif" alt="Empty Slot" width='475'/>
                    </div>
                );
            }
        }

        return (
            <div key={team._id} id={`t${team._id}`} className="team" onClick = {() => { sendAjax('GET', `/getTeamDetails?_id=${team._id}`, null, setupTeamCreateScreen); }}>
                <h2 className="teamName"> {team.name} </h2>
                <div className="innerTeam"> {memberNodes} </div>
            </div>
        );
    });

    return (
        <div className="teamList">
            {teamNodes}
        </div>
    );
};

const TeamCreateScreen = function(props) {

}

const setupTeamCreateScreen = (obj) => {
    //ReactDOM.render(
      //  <TeamCreateScreen team={data} />, document.querySelector("#teams")
    //);

    //TODO: MAKE REACT
        //sets the team we are working with
        currentTeam = obj;
    
        let teamFlex = document.querySelector("#teams");
        ReactDOM.unmountComponentAtNode(teamFlex);
        teamFlex.innerHTML = ""; //it will say loading so we need to clear that
    
        //makes the save team link and appends it
        let saveLink = document.createElement("button");
        saveLink.className="saveTeam";
        saveLink.textContent = "Save & Exit";
        saveLink.onclick = saveTeam;
        teamFlex.append(saveLink);
    
        //create the team div
        let teamDiv = document.createElement("div");
        teamDiv.className = "teamPage";
    
        //create the team name
        let teamName = document.createElement("input");
        teamName.id = "nameInput";
        teamName.value = obj.name;
        //onchange, sets the current team name
        teamName.onchange = (e) => { 
            currentTeam.name = e.target.value; 
            //document.querySelector("#title").textContent = e.target.value;
        };
        teamDiv.append(teamName);
    
        let innerTeam = document.createElement("div");
        innerTeam.className = "innerTeam";
    
        //document.querySelector("#title").textContent = obj.name;
    
        for(let j = 0; j < 6; j++) {
            //get the team member from the object
            let species = obj.members[j];
    
            //creates the team member
            let teamMember = document.createElement("div");
            teamMember.className = "teamMemberEdit";
            teamMember.id = `m${j}`; //m1, m2, etc. stand for Member1, Member2, etc
            teamMember.onclick = editMember;
            //edit screen for team member
    
            //if it exists then add it, if not make an empty spot
            if(species) {
                //gives it the image
                let image = document.createElement("img"); 
                image.src = species.image;
                image.alt = species.name;
                //appends the image
                teamMember.append(image);
    
                //gives it the name header
                let pokName = document.createElement("h3");
                pokName.textContent = species.name;
                //appends the name
                teamMember.append(pokName);
            } else {
                // http://probablyprogramming.com/wp-content/uploads/2009/03/handtinytrans.gif
                // http://probablyprogramming.com/2009/03/15/the-tiniest-gif-ever
                //This is a very small gif file that will be used in place of a pokemon image if 
                //there isn't a pokemon in that slot of the team.
                let image = document.createElement("img"); 
                image.src = "http://probablyprogramming.com/wp-content/uploads/2009/03/handtinytrans.gif";
                image.alt = "Empty Slot";
                //width makes sure it's the same size as the other images (which are all 475x475)
                image.width = '475';
                //appends
                teamMember.append(image);
    
                //gives it the empty name header
                let pokName = document.createElement("h3");
                pokName.textContent = "Empty";
                //appends the name
                teamMember.append(pokName);
            } //end else
    
            innerTeam.append(teamMember);
        } //end loop
    
    
        //appends everything when done
        teamDiv.append(innerTeam);
        teamFlex.append(teamDiv);
    
        let detailsDiv = document.createElement("div");
        detailsDiv.className = "teamPage";
        detailsDiv.id = "detailsDiv";
        detailsDiv.style.display = 'none';
        teamFlex.append(detailsDiv);
}

//picks the member and sends the request
const editMember = (e) => {
    //sets the member we're working with
    let id = e.currentTarget.id.substring(1);
    currentSpecies = {id: id};
    let member = currentTeam.members[id];

    if(member) {
        currentSpecies.selections = member;
        sendAjax('GET', `/getSpeciesData?species=${member.name}&id=${id}&newSpecies=no`, null, showSpeciesData);
    }
    else {
        showSpeciesData({id: id})
    }
};

//TODO: Make REACT
const showSpeciesData = (obj) => {
    let detailsDiv = document.querySelector("#detailsDiv");
    //the user clicked somewhere else before the response got back, so don't do anything anymore
    if(!detailsDiv || obj.id !== currentSpecies.id) return;

    //clear the details div
    detailsDiv.innerHTML = "";

    //resets the species if you are changing it to something new (and data is actually found)
    if(obj.newSpecies && obj.newSpecies === "yes" && obj.data) {
        let newObj = {
            name: obj.data.name,
            image: obj.data.sprites.other['official-artwork'].front_default,
            number: obj.data.id,
            abilityValue: "",
            moveValues: [],
            ability: "",
            moves: [],
        }

        //change the image and name
        let img = document.querySelector(`#m${obj.id} img`);
        let h3 = document.querySelector(`#m${obj.id} h3`);
        img.src = newObj.image;
        img.alt = newObj.name;
        h3.textContent = newObj.name;

        currentSpecies.selections = newObj;
        currentTeam.members[obj.id] = newObj;
    }

    let data = obj.data;

    //create div for the first thing the user can change - the species
    let speciesDiv = document.createElement("div");
    speciesDiv.className = "question";
    
    let speciesLabel = document.createElement("label");
    speciesLabel.className = "label";
    speciesLabel.textContent = "Pokemon Name: "
    speciesDiv.append(speciesLabel);

    //the search will perform a search that will eventually populate 
    let speciesSearch = document.createElement("input");
    speciesSearch.className = "search";
    speciesSearch.onchange = (e) => {
        sendAjax('GET', `/speciesSearch?q=${encodeURIComponent(e.target.value)}`, null, speciesSelectFunc);
    }
    speciesDiv.append(speciesSearch);
    
    //the select changes the species
    let speciesSelect = document.createElement("select");
    speciesSelect.className = "select";
    speciesSelect.id = "speciesSelect"
    speciesDiv.append(speciesSelect);

    //option to display that the possible options are loading
    let option = document.createElement("option");
    option.value = "";
    option.textContent = "Loading...";
    speciesSelect.onchange = null;

    detailsDiv.append(speciesDiv);
    detailsDiv.style.display = 'block';

    //dispatch event so the select list is filled
    speciesSearch.dispatchEvent(new Event("change"));

    window.scrollTo(0,document.body.scrollHeight); //scroll to bottom to show the changes

    //if there's no data, then just ask for a pokemon
    if(!data) {
        return;
    }

    //sets the data in the current species
    currentSpecies.data = data;

    //if there is, do everything else
    speciesSelect.value = data.name;
    speciesSearch.value = data.name;


    //create div for the next thing the user can change - the ability
    let abilityDiv = document.createElement("div");
    abilityDiv.className = "question";
    
    let abilityLabel = document.createElement("label");
    abilityLabel.className = "label";
    abilityLabel.textContent = "Ability: ";
    abilityDiv.append(abilityLabel);
    
    //the select changes the species
    let abilitySelect = document.createElement("select");
    abilitySelect.className = "select";
    abilitySelect.id = "abilitySelect";
    abilitySelectSetup(abilitySelect, data);
    abilitySelect.value = currentSpecies.selections.abilityValue;
    //onchange event sets the currentspecies ability and the team member ability
    abilitySelect.onchange = (e) => {
        let newAbility = e.target.value;
        let abilityText = e.target.options[e.target.selectedIndex].text;
        currentSpecies.selections.abilityValue = newAbility;
        currentTeam.members[obj.id].abilityValue = newAbility;
        currentSpecies.selections.ability = abilityText;
        currentTeam.members[obj.id].ability = abilityText;
    }
    abilityDiv.append(abilitySelect);

    detailsDiv.append(abilityDiv);

    //sets up the moves section, more complicated so it's its own function
    movesSetup(detailsDiv, data, obj);
};

//pupulates the select list
const speciesSelectFunc = (obj) => {
    //makes sure it exists still first
    let speciesSelectList = document.querySelector("#speciesSelect");
    let results = obj.results;
    if(speciesSelectList && results && results.length > 0) {
        //adds each option to the select list
        speciesSelectList.innerHTML = "";
        //default 'None' option
        let defOption = document.createElement("option");
        defOption.value = "";
        defOption.textContent = "None";
        speciesSelectList.append(defOption);

        for(let i=0;i<results.length;i++) {
            let option = document.createElement("option");
            option.value = results[i];
            option.textContent = results[i];
            speciesSelectList.append(option);
        }
        speciesSelectList.onchange = (e) => {
            //changes the species
            if(e.target.value !== "") {
                sendAjax('GET', `/getSpeciesData?species=${e.target.value}&id=${currentSpecies.id}&newSpecies=yes`, null, showSpeciesData);
            }
            else {
                //removes the team member if you pick None
                //change the image and name
                let img = document.querySelector(`#m${currentSpecies.id} img`);
                let h3 = document.querySelector(`#m${currentSpecies.id} h3`);
                img.src = "/transparent.gif";
                img.alt = "Empty Slot";
                img.width = '475';
                h3.textContent = "Empty";
        
                currentSpecies = {id: currentSpecies.id};
                currentTeam.members[currentSpecies.id] = null;

                //this will empty out this div
                showSpeciesData({id: currentSpecies.id});
            }
        }
        //if there's a selected species then set the current value
        if(currentSpecies.selections) speciesSelectList.value = currentSpecies.selections.name;
    } else if (speciesSelectList) {
        //don't have an onchange if it's null
        speciesSelectList.innerHTML = "";
        let option = document.createElement("option");
        option.value = "";
        option.textContent = "No Results Found";
        speciesSelectList.append(option);
        speciesSelectList.value = "";
        speciesSelectList.onchange = null;
    }
};

const abilitySelectSetup = (select, data) => {
    //option to make a null decision
    let option = document.createElement("option");
    option.value = "";
    option.textContent = "None";
    select.append(option);

    let abilities = data.abilities;
    for(let i = 0; i<abilities.length; i++) {
        //appends an option for each ability
        let newOption = document.createElement("option");
        newOption.value = i;
        newOption.textContent = abilities[i].ability.name;
        select.append(newOption);
    }
};

const movesSetup = (detailsDiv, data, obj) => {
    //makes 4 move setups
    for(let i = 0; i < 4; i++) {
        //create div for each of the moves
        let moveDiv = document.createElement("div");
        moveDiv.className = "question";
        
        let moveLabel = document.createElement("label");
        moveLabel.className = "label";
        moveLabel.textContent = `Move ${i + 1}: `;
        moveDiv.append(moveLabel);

        //the search will perform a search that will eventually populate
        let moveSearch = document.createElement("input");
        moveSearch.className = "search";
        moveDiv.append(moveSearch);
        
        //the select changes the species
        let moveSelect = document.createElement("select");
        moveSelect.className = "select";
        moveSelect.id = `moveSelect${i}`;
        moveDiv.append(moveSelect);

        //onchange event searches for the move
        moveSearch.onchange = (e) => {
            searchMove(moveSelect, data, i, obj.id, e.target.value.trim().toLowerCase());
        }

        //dispatch event so the select list is filled
        moveSearch.dispatchEvent(new Event("change"));

        //if there's a searchvalue display it
        let searchValue = currentSpecies.selections.moves[i];
        if(searchValue && searchValue !== "None"){
            moveSearch.value = searchValue;
        }

        detailsDiv.append(moveDiv);
    }
};

const searchMove = (select, data, moveNumber = 0, teamID = 0, searchString = "") => {
    if(!data.moves || !select) return; //return if it won't work
    //grabs all the moves that fit with the filter string
    let results = data.moves
    .map((move, index) => {
        return {
        name: move.move.name, 
        id: index //need to save the index to store it if the user picks it
        };
    })
    .filter((object) => object.name.includes(searchString)); //filters out to be only the ones searched for

    if(results.length > 0) {
        //adds each option to the select list
        select.innerHTML = "";

        //option to pick nothing
        let defOption = document.createElement("option");
        defOption.value = "";
        defOption.textContent = "None";
        select.append(defOption);

        for(let i=0;i<results.length;i++) {
            let option = document.createElement("option");
            option.value = results[i].id;
            option.textContent = results[i].name;
            select.append(option);
        }
        //set up onchange event for the select list
        select.onchange = (e) => {
            //changes the move and move text
            let moveChoice = e.target.value;
            let moveText = e.target.options[e.target.selectedIndex].text;
            currentSpecies.selections.moveValues[moveNumber] = moveChoice;
            currentTeam.members[teamID].moveValues[moveNumber] = moveChoice;
            currentSpecies.selections.moves[moveNumber] = moveText;
            currentTeam.members[teamID].moves[moveNumber] = moveText;
        }
        //if there's a selected move in this slot, set the value (won't do anything if the selection isn't one of the options)
        if(currentSpecies.selections.moveValues[moveNumber] || currentSpecies.selections.moveValues[moveNumber] === 0) 
            { select.value = currentSpecies.selections.moveValues[moveNumber]; }
    } else {
        //don't have an onchange if it's null
        select.innerHTML = "";
        let option = document.createElement("option");
        option.value = "";
        option.textContent = "No Results Found";
        select.append(option);
        select.value = "";
        select.onchange = null;
    }
};

const saveTeam = (e) => {
    const dataLoaded = (e) => {
        //This will essentially 'exit' the team editing page once it's done.
        document.querySelector("#teams").innerHTML = "Loading..."
        loadTeamsFromServer();
    };

    //creates the data and sends it
    const jsonData = {
        name: currentTeam.name,
        members: [],
        _csrf: document.querySelector('#csrf').value
    }; //end json

    if(currentTeam._id || currentTeam._id == 0) { 
        jsonData._id = currentTeam._id
    }

    //loop through every possible team member
    for(let i = 0; i<6; i++) {
        let teamMember = currentTeam.members[i];
        //only add it to the data if it is real
        if(teamMember) {
            let memberObject = {
                name: teamMember.name,
                image: teamMember.image,
                number: teamMember.number,
            }
            //add the ability if it exists
            let memberAbility = teamMember.abilityValue;
            if(memberAbility || memberAbility === 0) {
                memberObject.ability = memberAbility;
            } else {
                memberObject.ability = "";
            }
            //adds the moves if each of them exists
            let memberMoves = [];
            for(let j = 0; j<4; j++) {
                let newMove = teamMember.moveValues[j];
                if(newMove || newMove === 0) {
                //pushes it if it exists
                memberMoves.push(newMove);
                }
            }
            memberObject.moves = memberMoves;
            jsonData.members.push(memberObject);
        }
    }


    console.log(jsonData);
    sendAjax('POST', '/maker', jsonData, dataLoaded);

    return false;
};
    
const loadTeamsFromServer = () => {
    sendAjax('GET', '/getTeams', null, (data) => {
        ReactDOM.render(
            <TeamList teams={data.teams} />, document.querySelector("#teams")
        );
    });
};

const setup = function(csrf) {
    ReactDOM.render(
        <TeamForm csrf={csrf} />, document.querySelector("#makeTeam")
    );

    ReactDOM.render(
        <TeamList teams={[]} />, document.querySelector("#teams")
    );

    loadTeamsFromServer();
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

//NOT USED YET, TO SEE A WORKING VERSION YOU CAN LOOK AT HOW I DID IT IN DOMOMAKER-E
const getShareLink = (id) => {

    //get the current page link (can't use absolutes because the host may change)
    let urlString = window.location.href;
    //gets the first index of / to find the start of the word maker. Starts at 10 to skip over https://
    let pageIndex = urlString.indexOf("/", 10) + 6;
    //makes the whole URL
    urlString = `${urlString.substring(0, pageIndex)}/${id}`;


    //copies the share link to the clipboard
    navigator.clipboard.writeText(urlString).then(() => {
        //shows the success
        alert("Link copied successfully");
    }, () => {
        alert("Link copy failed");
    });
};

$(document).ready(function() {
    getToken();
});