const handleDomo = (e) => {
    e.preventDefault();

    $("#domoMessage").animate({width:'hide'},350);

    if($("#domoName").val() == '' || $("#domoAge").val() == ''){
        handleError("RAWR! All fields are required");
        return false;
    }
    
    sendAjax( 'POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function() {
        loadDomosFromServer();
    });

    return false;
};

const DomoForm = (props) => {
    return (
        <form id="domoForm"
                onSubmit={handleDomo}
                name="domoForm"
                action="/maker"
                method="POST"
                className="domoForm"
            >
            <label htmlFor="name">Name: </label>
            <input id="domoName" type="text" name="name" placeholder="Domo Name" />
            <label htmlFor="age">Age: </label>
            <input id="domoAge" type="text" name="age" placeholder="Domo Age" />
            <label htmlFor="sharable">Sharable: </label>
            <input id="domoSharable" type="checkbox" name="sharable" value="true" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="makeDomoSubmit" type="submit" value="Make Domo" />
        </form>
    );
};
    
const DomoList = function(props) {
    if(props.domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Domos yet</h3>
            </div>
        );
    }

    const domoNodes = props.domos.map(function(domo) {
        
        // if sharable is true then it will display a button. 
        //If it is false or doesn't exist then show a message
        const sharableButton = domo.sharable ? 
        (<button className="domoSharable" onClick={(e) => getShareLink(domo._id)}>Copy Share Link</button>) : 
        (<h3 className="domoSharable"> Not Sharable </h3>);

        return (
            <div key={domo._id} className="domo">
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
                <h3 className="domoName"> Name: {domo.name} </h3>
                <h3 className="domoAge"> Age: {domo.age} </h3>
                {sharableButton}
            </div>
        );
    });

    return (
        <div className="domoList">
            {domoNodes}
        </div>
    );
};
    
const loadDomosFromServer = () => {
    sendAjax('GET', '/getDomos', null, (data) => {
        ReactDOM.render(
            <DomoList domos={data.domos} />, document.querySelector("#domos")
        );
    });
};

const setup = function(csrf) {
    ReactDOM.render(
        <DomoForm csrf={csrf} />, document.querySelector("#makeDomo")
    );

    ReactDOM.render(
        <DomoList domos={[]} />, document.querySelector("#domos")
    );

    loadDomosFromServer();
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

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