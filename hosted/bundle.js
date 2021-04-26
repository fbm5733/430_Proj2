"use strict";

var currentTeam = {};
var currentSpecies = {};

var handleTeam = function handleTeam(e) {
  e.preventDefault();
  $("#teamMessage").animate({
    width: 'hide'
  }, 350);

  if ($("#teamName").val() == '' || $("#teamAge").val() == '') {
    handleError("RAWR! All fields are required");
    return false;
  }

  sendAjax('POST', $("#teamForm").attr("action"), $("#teamForm").serialize(), function () {
    loadTeamsFromServer();
  });
  return false;
};

var TeamForm = function TeamForm(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "teamForm",
    onSubmit: handleTeam,
    name: "teamForm",
    action: "/maker",
    method: "POST",
    className: "teamForm"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "name"
  }, "Name: "), /*#__PURE__*/React.createElement("input", {
    id: "teamName",
    type: "text",
    name: "name",
    placeholder: "Team Name"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "makeTeamSubmit",
    type: "submit",
    value: "New Team"
  }));
};

var TeamList = function TeamList(props) {
  if (props.teams.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "teamList"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "emptyTeam"
    }, "No Teams yet"));
  }

  var teamNodes = props.teams.map(function (team) {
    var memberNodes = []; //iterates 6 times, once each possible team member
    //ones that don't exist will have an empty member created

    for (var i = 0; i < 6; i++) {
      //get the team member from the object
      var species = team.members[i]; //creates the team member

      var teamMember = document.createElement("div");
      teamMember.className = "teamMember"; //if it exists then add it, if not make an empty spot

      if (species && species.image) {
        //gives it the image
        memberNodes.push( /*#__PURE__*/React.createElement("div", {
          className: "teamMember"
        }, /*#__PURE__*/React.createElement("img", {
          src: species.image,
          alt: species.name
        }), /*#__PURE__*/React.createElement("h3", null, species.name)));
      } else {
        // http://probablyprogramming.com/wp-content/uploads/2009/03/handtinytrans.gif
        // http://probablyprogramming.com/2009/03/15/the-tiniest-gif-ever
        //This is a very small gif file that will be used in place of a pokemon image if 
        //there isn't a pokemon in that slot of the team.
        memberNodes.push( /*#__PURE__*/React.createElement("div", {
          className: "teamMember"
        }, /*#__PURE__*/React.createElement("img", {
          src: "http://probablyprogramming.com/wp-content/uploads/2009/03/handtinytrans.gif",
          alt: "Empty Slot",
          width: "475"
        }), /*#__PURE__*/React.createElement("h3", null, species.name)));
      }
    }

    return /*#__PURE__*/React.createElement("div", {
      key: team._id,
      id: "t".concat(team._id),
      className: "team",
      onClick: function onClick() {
        sendAjax('GET', "/getTeam?_id=".concat(team._id), null, setupTeamCreateScreen);
      }
    }, /*#__PURE__*/React.createElement("h2", {
      className: "teamName"
    }, " ", team.name, " "), /*#__PURE__*/React.createElement("div", {
      className: "innerTeam"
    }, " ", memberNodes, " "));
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "teamList"
  }, teamNodes);
};

var TeamCreateScreen = function TeamCreateScreen(props) {};

var setupTeamCreateScreen = function setupTeamCreateScreen(data) {
  ReactDOM.render( /*#__PURE__*/React.createElement(TeamCreateScreen, {
    team: data
  }), document.querySelector("#teams"));
};

var loadTeamsFromServer = function loadTeamsFromServer() {
  sendAjax('GET', '/getTeams', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(TeamList, {
      teams: data.teams
    }), document.querySelector("#teams"));
  });
};

var setup = function setup(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(TeamForm, {
    csrf: csrf
  }), document.querySelector("#makeTeam"));
  ReactDOM.render( /*#__PURE__*/React.createElement(TeamList, {
    teams: []
  }), document.querySelector("#teams"));
  loadTeamsFromServer();
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
}; //NOT USED YET, TO SEE A WORKING VERSION YOU CAN LOOK AT HOW I DID IT IN DOMOMAKER-E


var getShareLink = function getShareLink(id) {
  //get the current page link (can't use absolutes because the host may change)
  var urlString = window.location.href; //gets the first index of / to find the start of the word maker. Starts at 10 to skip over https://

  var pageIndex = urlString.indexOf("/", 10) + 6; //makes the whole URL

  urlString = "".concat(urlString.substring(0, pageIndex), "/").concat(id); //copies the share link to the clipboard

  navigator.clipboard.writeText(urlString).then(function () {
    //shows the success
    alert("Link copied successfully");
  }, function () {
    alert("Link copy failed");
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#teamMessage").animate({
    width: 'toggle'
  }, 350);
};

var redirect = function redirect(response) {
  $("#teamMessage").animate({
    width: 'hide'
  }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
