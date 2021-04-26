let currentTeam = {};
let currentSpecies = {};

const handleTeam = (e) => {
    e.preventDefault();

    $("#teamMessage").animate({width:'hide'},350);

    if($("#teamName").val() == '' || $("#teamAge").val() == ''){
        handleError("RAWR! All fields are required");
        return false;
    }
    
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
            <input type="hidden" name="_csrf" value={props.csrf} />
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
                        <h3>{species.name}</h3>
                    </div>
                );
            }
        }

        return (
            <div key={team._id} id={`t${team._id}`} className="team" onClick = {() => { sendAjax('GET', `/getTeam?_id=${team._id}`, null, setupTeamCreateScreen); }}>
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

const setupTeamCreateScreen = (data) => {
    ReactDOM.render(
        <TeamCreateScreen team={data} />, document.querySelector("#teams")
    );
}
    
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