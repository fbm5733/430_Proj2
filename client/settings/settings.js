const handlePassChange = (e) => {
    e.preventDefault();

    $("#porygonMessage").animate({right:-250},350);

    if($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
        handleError("No fields can be empty");
        return false;
    }

    sendAjax('POST', $("#passForm").attr("action"), $("#passForm").serialize(), redirect);
    
    return false;
};

const PremiumSection = (props) => {

    let button;

    if(props.result.premium && (props.result.premium === "true" || props.result.premium === true)) {
        //already has premium
        button = (
            <h2 className="big" id="hasPremium">You already have Premium</h2>
        );
    } else {
        function handleClick() {
            sendAjax('GET', '/makePremium', null, redirect);
        }

        button = (
            <button id="premiumButton" onClick={handleClick}>Get Premium Now!</button>
        );
    }

    return (
    <div>
        <h1>Premium Mode!</h1>
        <ul>
            <li>No team limit!</li>
            <li>Share teams with others!</li>
            <li><strike>A monkey will be shipped to your house!</strike></li>
        </ul>
        {button}
    </div>
    );
};

const PassChange = (props) => {
    return (
    <form id="passForm" name="passForm"
            onSubmit={handlePassChange}
            action="/passwordChange"
            method="POST"
            className="mainForm"
        >
        <h2 className="big">Change Password</h2>
        <label htmlFor="username">Username: </label>
        <input id="user" type="text" name="username" placeholder="username"/>
        <label htmlFor="pass">Old Password: </label>
        <input id="pass" type="password" name="pass" placeholder="old password"/>
        <label htmlFor="pass2">New Password: </label>
        <input id="pass2" type="password" name="pass2" placeholder="new password"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit" type="submit" value="Change Password" />
    </form>
    );
};

const createLoginWindow = (result) => {
    ReactDOM.render(
        <PremiumSection result={result} />,
        document.querySelector("#premium")
    );
    ReactDOM.render(
        <PassChange csrf={result.csrfToken} />,
        document.querySelector("#passChange")
    );
};
    
const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        createLoginWindow(result);
    });
};

$(document).ready(function() {
    getToken();
});