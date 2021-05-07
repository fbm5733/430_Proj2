let currentTeam = {};
let currentSpecies = {};
let detailsRef;

//makes a new team
const newTeam = (e) => {
    $("#teamMessage").animate({width:'hide'},350);
    
    sendAjax( 'POST', '/maker', { new: "true", name: "New Team", _csrf: document.querySelector('#csrf').value }, function() {
        loadTeamsFromServer();
    });
};

//the form is not a form anymore, just a hidden csrf
const TeamForm = (props) => {
    return (
        <input type="hidden" id='csrf' name="_csrf" value={props.csrf} />
    );
};
    
//create the inital list of all the teams, with all 6 members of each displayed
const TeamList = function(props) {
    if(props.teams.length === 0) {
        return (
            <div className="teamList">
                <h3 className="emptyTeam">No Teams yet</h3>
            </div>
        );
    }

    const teamNodes = props.teams.map(function(team) {

        document.title = `Team Maker`;

        const memberNodes = [];

        //iterates 6 times, once each possible team member
        //ones that don't exist will have an empty member created
        for(let i = 0; i < 6; i++) {
            //get the team member from the object
            let species = team.members[i];

            //pushes it with the SpeciesImageName component
            memberNodes.push(
                <div key={`${team._id} + ${i}`} className="teamMember"> 
                    <SpeciesImageName species={species} />
                </div>
            );
        }

        return (
            <div key={team._id} id={`t${team._id}`} className="team" onClick = {() => { sendAjax('GET', `/getTeamDetails?_id=${team._id}`, null, setupTeamCreateScreen); }}>
                <h2 className="teamName"> {team.name} </h2>
                <div className="innerTeam"> 
                    {memberNodes} 
                </div>
            </div>
        );
    });

    return (
        <div className="teamList">
            {teamNodes}
        </div>
    );
};

class SpeciesImageName extends React.Component {
    //initialize
    constructor(props) {
        super(props)

        let species = props.species;

        //defaults for the species, empty
        if (!species) {
            species = {
                image: "/assets/img/transparent.gif",
                name: "Empty"
            };
        }
        //sets the state
        this.state = {
           species: species
        };

        this.handleChange = this.handleChange.bind(this);
    }

    //handles the change in the species
    handleChange(newSpecies) {
        let species = newSpecies;

        //defaults for the species, empty
        if (!species) {
            species = {
                image: "/assets/img/transparent.gif",
                name: "Empty"
            };
        }

        //sets the state
        this.setState({ species: species });
    }

    //render the component
    render() {
        //displays the name and image 
        //the defaults are in case the species exists but hte name/image doesn't (should never happen but checking anyway)
        return (
            <React.Fragment>
            <img width='475' src={this.state.species.image || "/assets/img/transparent.gif"} alt={this.state.species.name || "Empty"}/>
            <h3>{this.state.species.name || "Empty"}</h3>
            </React.Fragment>
        );
    }
}

const TeamCreateScreen = function(props) {

    //sets the team we are working with
    currentTeam = props.team;
    document.title = `Team Maker - ${currentTeam.name}`;


    const memberNodes = [];

    //iterates 6 times, once each possible team member
    //ones that don't exist will have an empty member created
    for(let i = 0; i < 6; i++) {
        //get the team member from the object
        let species = currentTeam.members[i];

        let childSpecies = React.createRef();

        //sends the reference up so they can be changed later
        function startEditMember(e) {
            editMember(e, childSpecies);
        }

        //pushes it with the SpeciesImageName component
        memberNodes.push(
            <div key={`m${i}`} id={`m${i}`} className="teamMemberEdit" onClick={startEditMember}> 
                <SpeciesImageName ref={childSpecies} species={species} />
            </div>
        );
    }

    //function for changing the name
    function handleNameChange(e) {
        currentTeam.name = e.target.value;
        document.title = `Team Maker - ${currentTeam.name}`;
    };

    return (
        <React.Fragment>
        {/*makes the save team link*/}
        <button className="saveTeam" onClick={saveTeam}>Save & Exit</button>
        {/*div for the team page*/}
        <div className="teamPage">
            {/*editable team name*/}
            <input id="nameInput" defaultValue={currentTeam.name} onChange={handleNameChange}/>
            {/*inner team div*/}
            <div className="innerTeam">
                {memberNodes}
            </div>
        </div>
        {/*div for the editable details - not shown yet*/}
        <div className="teamPage" id="detailsDiv" style={{display: 'none'}}></div>
        </React.Fragment>
    );
};

const setupTeamCreateScreen = (obj) => {
    ReactDOM.render(
        <TeamCreateScreen team={obj} />, document.querySelector("#teams")
    );
}

//picks the member and sends the request
const editMember = (e, ref) => {
    //sets the member we're working with
    let id = e.currentTarget.id.substring(1);
    currentSpecies = {id: id, ref: ref};
    let member = currentTeam.members[id];

    //starts displaying appropriately
    if(member) {
        currentSpecies.selections = member;
        sendAjax('GET', `/getSpeciesData?species=${member.name}&id=${id}&newSpecies=no`, null, showSpeciesData);
    }
    else {
        showSpeciesData({id: id})
    }
};

class SpeciesSelectOptions extends React.Component {
    constructor(props) {
        super(props);

        this.state = {results: props.results, loading: props.loading};

        this.handleResults = this.handleResults.bind(this);
    }

    //handles the change in the results
    handleResults(newResults, loading, callback = () => {}) {
        this.setState({ results: newResults, loading: loading}, callback);
    }

    render() {
        const options = [];
        const results = this.state.results;

        //if it's loading make a loading option
        if(this.state.loading) {
            options.push(
                <option key="default" value="">Loading...</option>
            );
        //if none are found make a no results option
        } else if(!results || results.length <= 0){
            options.push(
                <option key="default" value="">No Results Found</option>
            );
        //otherwise keep going
        } else {
            //default option
            options.push(
                <option key="default" value="">None</option>
            );

            //option for every species
            results.forEach(name => {
                options.push(
                    <option key={name} value={name}>{name}</option>
                );
            });
        }

        //render
        return (
            <React.Fragment>
            {options}
            </React.Fragment>
        );
    }
}

const AbilitySelectOptions = (props) => {

    const options = []

    const abilities = props.data.abilities;
    for(let i = 0; i<abilities.length; i++) {
        options.push(
            <option key={i} value={i}>{abilities[i].ability.name}</option>
        );
    }

    return (
        <React.Fragment>
            <option value="">None</option>
            {options}
        </React.Fragment>
    );
};

class MoveSelectOptions extends React.Component {
    //initialize
    constructor(props) {
        super(props);

        this.state = {
           results: props.results
        };

        this.handleResults = this.handleResults.bind(this);
    }

    //handles the change in the results
    handleResults(newResults, callback) {
        this.setState({ results: newResults }, callback);
    }

    //render the component
    render() {
        let results = this.state.results;
        if(results.length > 0) {

            //makes all the options
            const options = [];
            for(let i=0;i<results.length;i++) {
                //pushes the move
                options.push(
                    <option key={i} value={results[i].id}>{results[i].name}</option>
                );
            }

            //builds the React component
            return (
                <React.Fragment>
                <option value="">None</option>
                {options}
                </React.Fragment>
            );

        } else {
            //version with no results
            return (
                <option value="">No Results Found</option>
            );
        }
    }
}

class DetailsScreen extends React.Component { 
    //makes a constructor
    constructor(props) {
        super(props);

        this.state = {
            obj: props.obj,
        };

        this.handleNewSpecies = this.handleNewSpecies.bind(this);
    }

    //handles the change in the results
    handleNewSpecies(obj, callback) {
        this.setState({ obj: obj }, callback);
    }

    //render function
    render() {    
        const obj = this.state.obj;
        const data = obj.data;

        const extraPieces = [];

        let speciesValue = "";

        //if there's data for this pokemon, then make all the extra-detailed pieces
        if(data) {
                
            //sets the data in the current species
            currentSpecies.data = data;
            let moves = data.moves.map((move, index) => {
                return {
                name: move.move.name, 
                id: index //need to save the index to store it if the user picks it
                };
            });

            //sets the default value for species to be the name picked
            speciesValue = data.name;

            //function for when an ability is selected
            function handleAbilitySelect(e) {
                let newAbility = e.target.value;
                let abilityText = e.target.options[e.target.selectedIndex].text;
                currentSpecies.selections.abilityValue = newAbility;
                currentTeam.members[obj.id].abilityValue = newAbility;
                currentSpecies.selections.ability = abilityText;
                currentTeam.members[obj.id].ability = abilityText;
            };

            //creates a div for choosing the Ability
            extraPieces.push(
                <div key="ability" className="question">
                    <label className="label">Ability: </label>
                    <select defaultValue={currentSpecies.selections.abilityValue} className="select" id="abilitySelect" onChange={handleAbilitySelect} >
                        <AbilitySelectOptions data={data}/>
                    </select>
                </div>
            );

            //makes 4 move choosers
            for(let i = 0; i < 4; i++) {

                //selected move
                let searchValue = "";
                let tempSearchValue = currentSpecies.selections.moves[i];
                if(tempSearchValue && tempSearchValue !== "None"){
                    searchValue = tempSearchValue;
                }

                let childMove = React.createRef();

                //function for handling a move being searched for
                function handleMoveSearch(e) {
                    let selected = document.querySelector(`#moveSelect${i}`);
                    searchMove(selected, data, i, obj.id, e.target.value.trim().toLowerCase(), childMove);
                }

                //set up onchange event for the select list
                function handleMoveSelect(e) {
                    //changes the move and move text
                    let moveChoice = e.target.value;
                    let moveText = e.target.options[e.target.selectedIndex].text;
                    currentSpecies.selections.moveValues[i] = moveChoice;
                    currentTeam.members[obj.id].moveValues[i] = moveChoice;
                    currentSpecies.selections.moves[i] = moveText;
                    currentTeam.members[obj.id].moves[i] = moveText;
                }

                extraPieces.push(
                    <div key={`move${i}`} className="question">
                        <label className="label">{`Move ${i + 1}: `}</label>
                        <input defaultValue={searchValue} className="search" onChange={handleMoveSearch}/>
                        <select onChange={handleMoveSelect} defaultValue={searchValue} className="select" id={`moveSelect${i}`}>
                            <MoveSelectOptions ref={childMove} results={moves} />
                        </select>
                    </div>
                );
            }
        }

        let selectRef = React.createRef();

        function handleResponseReceived(obj) {
            speciesSelectFunc(obj, selectRef);
        }

        function handleSpeciesSearch(e) {
            selectRef.current.handleResults([], true);
            sendAjax('GET', `/speciesSearch?q=${encodeURIComponent(e.target.value)}`, null, handleResponseReceived);
        }

        sendAjax('GET', `/speciesSearch?q=${speciesValue}`, null, handleResponseReceived);

        return (
            <React.Fragment>
            <div className="question">
                <label className="label">Pokemon Name: </label>
                <input defaultValue={speciesValue} id="speciesSearch" className="search" onChange={handleSpeciesSearch} onLoad = {handleSpeciesSearch}/>
                <select defaultValue={speciesValue} className="select" id="speciesSelect" onChange={null} >
                    <SpeciesSelectOptions ref={selectRef} results={[]} loading={true}/>
                </select>
            </div>
            {extraPieces}
            </React.Fragment>
        );
    }
};

const showSpeciesData = (obj) => {
    let detailsDiv = document.querySelector("#detailsDiv");
    //the user clicked somewhere else before the response got back, so don't do anything anymore
    if(!detailsDiv || obj.id !== currentSpecies.id) return;

    //resets the species if you are changing it to something new (and data is actually found)
    if(obj.newSpecies && obj.newSpecies === "yes" && obj.data) {
        let newObj = {
            name: obj.data.name,
            //includes defaults for the sprites
            image: obj.data.sprites.other['official-artwork'].front_default || obj.data.sprites.front_default || "/assets/img/transparent.gif",
            number: obj.data.id,
            abilityValue: "",
            moveValues: [],
            ability: "",
            moves: [],
        }

        //sets the image and name for the react div based on the reference
        currentSpecies.ref.current.handleChange({image: newObj.image, name: newObj.name});

        currentSpecies.selections = newObj;
        currentTeam.members[obj.id] = newObj;
    }

    
    //callback for creating details page
    function callback() {
        //display it now
        detailsDiv.style.display = 'block';

        //fill the value in
        let speciesSearch = document.querySelector("#speciesSearch");
        if(obj.data) {
            speciesSearch.value = obj.data.name;
        } else {
            speciesSearch.value = "";
        }
        

        window.scrollTo(0, document.body.scrollHeight); //scroll to bottom to show the changes (doesn't work?)
    }

    //renders or changes the state, depending on if it exists yet
    if(!detailsRef) {
        detailsRef = React.createRef();

        ReactDOM.render(
            <DetailsScreen ref={detailsRef} obj={obj} />, detailsDiv, callback
        );
    } else {
        detailsRef.current.handleNewSpecies(obj, callback);
    }
};

//pupulates the select list
const speciesSelectFunc = (obj, selectRef) => {
    //makes sure it exists still first
    let speciesSelectList = document.querySelector("#speciesSelect");
    let results = obj.results;
    
    //changes the state
    selectRef.current.handleResults(results, false, () => {
        //sets up the onchange when it's done with the state change
        if(speciesSelectList && results && results.length > 0) {
            speciesSelectList.onchange = (e) => {
                //changes the species
                if(e.target.value !== "") {
                    sendAjax('GET', `/getSpeciesData?species=${e.target.value}&id=${currentSpecies.id}&newSpecies=yes`, null, showSpeciesData);
                }
                else {
                    //sets the image and name for the react div based on the reference
                    currentSpecies.ref.current.handleChange({image: "/assets/img/transparent.gif", name: "Empty"});
            
                    currentSpecies = {id: currentSpecies.id, ref: currentSpecies.ref};
                    currentTeam.members[currentSpecies.id] = null;

                    //this will empty out this div
                    showSpeciesData({id: currentSpecies.id});
                }
            }

            let speciesCheck = false;
            //check if the selected one is included
            results.forEach(species => {
                if(currentSpecies.selections && species === currentSpecies.selections.name) speciesCheck = true;
            });

            //if there's a selected species then set the current value
            if(speciesCheck) {
                speciesSelectList.value = currentSpecies.selections.name;
            } else {
                speciesSelectList.value = "";
            }
        } else if (speciesSelectList) {
            //don't have an onchange if it's empty
            speciesSelectList.value = "";
            speciesSelectList.onchange = null;
        }
    });
};

const searchMove = (select, data, moveNumber = 0, teamID = 0, searchString = "", ref) => {
    if(!data.moves || !select) return []; //return if it won't work

    //check if the choice exists in the filter
    let choiceExistsCheck = false;

    //grabs all the moves that fit with the filter string
    let results = data.moves
    .map((move, index) => {
        return {
        name: move.move.name, 
        id: index //need to save the index to store it if the user picks it
        };
    })
    .filter((object) => {
        if(object.name.includes(searchString))
        {
            //check if this is the selected move
            if(currentSpecies.selections.moveValues[moveNumber] == object.id) {
                choiceExistsCheck = true;
            }
            //return true
            return true;
        }
        return false; //otherwise false
    }); //filters out to be only the ones searched for

    //sets the state for the reference
    ref.current.handleResults(results, () => {
        //this is a callback so it happens after the options are made (since it sets the value)
        if(results.length > 0) {
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

            //if there's a selected move in this slot, set the value
            if(choiceExistsCheck) 
            { 
                select.value = currentSpecies.selections.moveValues[moveNumber]; 
            } else {
                select.value = "";
            }
        
        } else {
            select.value = "";
            select.onchange = null;
        }
    });
};

const saveTeam = (e) => {
    const dataLoaded = (e) => {
        //This will essentially 'exit' the team editing page once it's done.
        ReactDOM.render(
            <TeamList teams={[]} />, document.querySelector("#teams")
        );
        detailsRef = null;
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