const handlePassChange = (e) => {
    e.preventDefault();

    $("#teamMessage").animate({width:'hide'},350);

    if($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
        handleError("RAWR! Username or password is empty");
        return false;
    }

    sendAjax('POST', $("#passForm").attr("action"), $("#passForm").serialize(), redirect);
    
    return false;
};

const PassChange = (props) => {
    return (
    <form id="passForm" name="passForm"
            onSubmit={handlePassChange}
            action="/passwordChange"
            method="POST"
            className="mainForm"
        >
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

const createLoginWindow = (csrf) => {
    ReactDOM.render(
        <PassChange csrf={csrf} />,
        document.querySelector("#passChange")
    );
};
    
const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        createLoginWindow(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});