"use strict";

var currentTeam = {};
var currentSpecies = {};

var handleTeam = function handleTeam(e) {
  e.preventDefault();
  $("#teamMessage").animate({
    width: 'hide'
  }, 350);
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
    id: "csrf",
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
          key: "".concat(team._id, " + ").concat(i),
          className: "teamMember"
        }, /*#__PURE__*/React.createElement("img", {
          width: "475",
          src: species.image,
          alt: species.name
        }), /*#__PURE__*/React.createElement("h3", null, species.name)));
      } else {
        // http://probablyprogramming.com/wp-content/uploads/2009/03/handtinytrans.gif
        // http://probablyprogramming.com/2009/03/15/the-tiniest-gif-ever
        //This is a very small gif file that will be used in place of a pokemon image if 
        //there isn't a pokemon in that slot of the team.
        memberNodes.push( /*#__PURE__*/React.createElement("div", {
          key: "".concat(team._id, " + ").concat(i),
          className: "teamMember"
        }, /*#__PURE__*/React.createElement("img", {
          src: "/assets/img/transparent.gif",
          alt: "Empty Slot",
          width: "475"
        })));
      }
    }

    return /*#__PURE__*/React.createElement("div", {
      key: team._id,
      id: "t".concat(team._id),
      className: "team",
      onClick: function onClick() {
        sendAjax('GET', "/getTeamDetails?_id=".concat(team._id), null, setupTeamCreateScreen);
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

var setupTeamCreateScreen = function setupTeamCreateScreen(obj) {
  //ReactDOM.render(
  //  <TeamCreateScreen team={data} />, document.querySelector("#teams")
  //);
  //TODO: MAKE REACT
  //sets the team we are working with
  currentTeam = obj;
  var teamFlex = document.querySelector("#teams");
  ReactDOM.unmountComponentAtNode(teamFlex);
  teamFlex.innerHTML = ""; //it will say loading so we need to clear that
  //makes the save team link and appends it

  var saveLink = document.createElement("button");
  saveLink.className = "saveTeam";
  saveLink.textContent = "Save & Exit";
  saveLink.onclick = saveTeam;
  teamFlex.append(saveLink); //create the team div

  var teamDiv = document.createElement("div");
  teamDiv.className = "teamPage"; //create the team name

  var teamName = document.createElement("input");
  teamName.id = "nameInput";
  teamName.value = obj.name; //onchange, sets the current team name

  teamName.onchange = function (e) {
    currentTeam.name = e.target.value; //document.querySelector("#title").textContent = e.target.value;
  };

  teamDiv.append(teamName);
  var innerTeam = document.createElement("div");
  innerTeam.className = "innerTeam"; //document.querySelector("#title").textContent = obj.name;

  for (var j = 0; j < 6; j++) {
    //get the team member from the object
    var species = obj.members[j]; //creates the team member

    var teamMember = document.createElement("div");
    teamMember.className = "teamMemberEdit";
    teamMember.id = "m".concat(j); //m1, m2, etc. stand for Member1, Member2, etc

    teamMember.onclick = editMember; //edit screen for team member
    //if it exists then add it, if not make an empty spot

    if (species) {
      //gives it the image
      var image = document.createElement("img");
      image.src = species.image;
      image.alt = species.name;
      image.width = '475'; //appends the image

      teamMember.append(image); //gives it the name header

      var pokName = document.createElement("h3");
      pokName.textContent = species.name; //appends the name

      teamMember.append(pokName);
    } else {
      // http://probablyprogramming.com/wp-content/uploads/2009/03/handtinytrans.gif
      // http://probablyprogramming.com/2009/03/15/the-tiniest-gif-ever
      //This is a very small gif file that will be used in place of a pokemon image if 
      //there isn't a pokemon in that slot of the team.
      var _image = document.createElement("img");

      _image.src = "/assets/img/transparent.gif";
      _image.alt = "Empty Slot"; //width makes sure it's the same size as the other images (which are all 475x475)

      _image.width = '475'; //appends

      teamMember.append(_image); //gives it the empty name header

      var _pokName = document.createElement("h3");

      _pokName.textContent = "Empty"; //appends the name

      teamMember.append(_pokName);
    } //end else


    innerTeam.append(teamMember);
  } //end loop
  //appends everything when done


  teamDiv.append(innerTeam);
  teamFlex.append(teamDiv);
  var detailsDiv = document.createElement("div");
  detailsDiv.className = "teamPage";
  detailsDiv.id = "detailsDiv";
  detailsDiv.style.display = 'none';
  teamFlex.append(detailsDiv);
}; //picks the member and sends the request


var editMember = function editMember(e) {
  //sets the member we're working with
  var id = e.currentTarget.id.substring(1);
  currentSpecies = {
    id: id
  };
  var member = currentTeam.members[id];

  if (member) {
    currentSpecies.selections = member;
    sendAjax('GET', "/getSpeciesData?species=".concat(member.name, "&id=").concat(id, "&newSpecies=no"), null, showSpeciesData);
  } else {
    showSpeciesData({
      id: id
    });
  }
}; //TODO: Make REACT


var showSpeciesData = function showSpeciesData(obj) {
  var detailsDiv = document.querySelector("#detailsDiv"); //the user clicked somewhere else before the response got back, so don't do anything anymore

  if (!detailsDiv || obj.id !== currentSpecies.id) return; //clear the details div

  detailsDiv.innerHTML = ""; //resets the species if you are changing it to something new (and data is actually found)

  if (obj.newSpecies && obj.newSpecies === "yes" && obj.data) {
    var newObj = {
      name: obj.data.name,
      //includes defaults for the sprites
      image: obj.data.sprites.other['official-artwork'].front_default || obj.data.sprites.front_default || "/assets/img/transparent.gif",
      number: obj.data.id,
      abilityValue: "",
      moveValues: [],
      ability: "",
      moves: []
    }; //change the image and name

    var img = document.querySelector("#m".concat(obj.id, " img"));
    var h3 = document.querySelector("#m".concat(obj.id, " h3"));
    img.src = newObj.image;
    img.alt = newObj.name;
    h3.textContent = newObj.name;
    currentSpecies.selections = newObj;
    currentTeam.members[obj.id] = newObj;
  }

  var data = obj.data; //create div for the first thing the user can change - the species

  var speciesDiv = document.createElement("div");
  speciesDiv.className = "question";
  var speciesLabel = document.createElement("label");
  speciesLabel.className = "label";
  speciesLabel.textContent = "Pokemon Name: ";
  speciesDiv.append(speciesLabel); //the search will perform a search that will eventually populate 

  var speciesSearch = document.createElement("input");
  speciesSearch.className = "search";

  speciesSearch.onchange = function (e) {
    sendAjax('GET', "/speciesSearch?q=".concat(encodeURIComponent(e.target.value)), null, speciesSelectFunc);
  };

  speciesDiv.append(speciesSearch); //the select changes the species

  var speciesSelect = document.createElement("select");
  speciesSelect.className = "select";
  speciesSelect.id = "speciesSelect";
  speciesDiv.append(speciesSelect); //option to display that the possible options are loading

  var option = document.createElement("option");
  option.value = "";
  option.textContent = "Loading...";
  speciesSelect.onchange = null;
  detailsDiv.append(speciesDiv);
  detailsDiv.style.display = 'block'; //dispatch event so the select list is filled

  speciesSearch.dispatchEvent(new Event("change"));
  window.scrollTo(0, document.body.scrollHeight); //scroll to bottom to show the changes
  //if there's no data, then just ask for a pokemon

  if (!data) {
    return;
  } //sets the data in the current species


  currentSpecies.data = data; //if there is, do everything else

  speciesSelect.value = data.name;
  speciesSearch.value = data.name; //create div for the next thing the user can change - the ability

  var abilityDiv = document.createElement("div");
  abilityDiv.className = "question";
  var abilityLabel = document.createElement("label");
  abilityLabel.className = "label";
  abilityLabel.textContent = "Ability: ";
  abilityDiv.append(abilityLabel); //the select changes the species

  var abilitySelect = document.createElement("select");
  abilitySelect.className = "select";
  abilitySelect.id = "abilitySelect";
  abilitySelectSetup(abilitySelect, data);
  abilitySelect.value = currentSpecies.selections.abilityValue; //onchange event sets the currentspecies ability and the team member ability

  abilitySelect.onchange = function (e) {
    var newAbility = e.target.value;
    var abilityText = e.target.options[e.target.selectedIndex].text;
    currentSpecies.selections.abilityValue = newAbility;
    currentTeam.members[obj.id].abilityValue = newAbility;
    currentSpecies.selections.ability = abilityText;
    currentTeam.members[obj.id].ability = abilityText;
  };

  abilityDiv.append(abilitySelect);
  detailsDiv.append(abilityDiv); //sets up the moves section, more complicated so it's its own function

  movesSetup(detailsDiv, data, obj);
}; //pupulates the select list


var speciesSelectFunc = function speciesSelectFunc(obj) {
  //makes sure it exists still first
  var speciesSelectList = document.querySelector("#speciesSelect");
  var results = obj.results;

  if (speciesSelectList && results && results.length > 0) {
    //adds each option to the select list
    speciesSelectList.innerHTML = ""; //default 'None' option

    var defOption = document.createElement("option");
    defOption.value = "";
    defOption.textContent = "None";
    speciesSelectList.append(defOption);

    for (var i = 0; i < results.length; i++) {
      var option = document.createElement("option");
      option.value = results[i];
      option.textContent = results[i];
      speciesSelectList.append(option);
    }

    speciesSelectList.onchange = function (e) {
      //changes the species
      if (e.target.value !== "") {
        sendAjax('GET', "/getSpeciesData?species=".concat(e.target.value, "&id=").concat(currentSpecies.id, "&newSpecies=yes"), null, showSpeciesData);
      } else {
        //removes the team member if you pick None
        //change the image and name
        var img = document.querySelector("#m".concat(currentSpecies.id, " img"));
        var h3 = document.querySelector("#m".concat(currentSpecies.id, " h3"));
        img.src = "/assets/img/transparent.gif";
        img.alt = "Empty Slot";
        img.width = '475';
        h3.textContent = "Empty";
        currentSpecies = {
          id: currentSpecies.id
        };
        currentTeam.members[currentSpecies.id] = null; //this will empty out this div

        showSpeciesData({
          id: currentSpecies.id
        });
      }
    }; //if there's a selected species then set the current value


    if (currentSpecies.selections) speciesSelectList.value = currentSpecies.selections.name;
  } else if (speciesSelectList) {
    //don't have an onchange if it's null
    speciesSelectList.innerHTML = "";

    var _option = document.createElement("option");

    _option.value = "";
    _option.textContent = "No Results Found";
    speciesSelectList.append(_option);
    speciesSelectList.value = "";
    speciesSelectList.onchange = null;
  }
};

var abilitySelectSetup = function abilitySelectSetup(select, data) {
  //option to make a null decision
  var option = document.createElement("option");
  option.value = "";
  option.textContent = "None";
  select.append(option);
  var abilities = data.abilities;

  for (var i = 0; i < abilities.length; i++) {
    //appends an option for each ability
    var newOption = document.createElement("option");
    newOption.value = i;
    newOption.textContent = abilities[i].ability.name;
    select.append(newOption);
  }
};

var movesSetup = function movesSetup(detailsDiv, data, obj) {
  var _loop = function _loop(i) {
    //create div for each of the moves
    var moveDiv = document.createElement("div");
    moveDiv.className = "question";
    var moveLabel = document.createElement("label");
    moveLabel.className = "label";
    moveLabel.textContent = "Move ".concat(i + 1, ": ");
    moveDiv.append(moveLabel); //the search will perform a search that will eventually populate

    var moveSearch = document.createElement("input");
    moveSearch.className = "search";
    moveDiv.append(moveSearch); //the select changes the species

    var moveSelect = document.createElement("select");
    moveSelect.className = "select";
    moveSelect.id = "moveSelect".concat(i);
    moveDiv.append(moveSelect); //onchange event searches for the move

    moveSearch.onchange = function (e) {
      searchMove(moveSelect, data, i, obj.id, e.target.value.trim().toLowerCase());
    }; //dispatch event so the select list is filled


    moveSearch.dispatchEvent(new Event("change")); //if there's a searchvalue display it

    var searchValue = currentSpecies.selections.moves[i];

    if (searchValue && searchValue !== "None") {
      moveSearch.value = searchValue;
    }

    detailsDiv.append(moveDiv);
  };

  //makes 4 move setups
  for (var i = 0; i < 4; i++) {
    _loop(i);
  }
};

var searchMove = function searchMove(select, data) {
  var moveNumber = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var teamID = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var searchString = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
  if (!data.moves || !select) return; //return if it won't work
  //grabs all the moves that fit with the filter string

  var results = data.moves.map(function (move, index) {
    return {
      name: move.move.name,
      id: index //need to save the index to store it if the user picks it

    };
  }).filter(function (object) {
    return object.name.includes(searchString);
  }); //filters out to be only the ones searched for

  if (results.length > 0) {
    //adds each option to the select list
    select.innerHTML = ""; //option to pick nothing

    var defOption = document.createElement("option");
    defOption.value = "";
    defOption.textContent = "None";
    select.append(defOption);

    for (var i = 0; i < results.length; i++) {
      var option = document.createElement("option");
      option.value = results[i].id;
      option.textContent = results[i].name;
      select.append(option);
    } //set up onchange event for the select list


    select.onchange = function (e) {
      //changes the move and move text
      var moveChoice = e.target.value;
      var moveText = e.target.options[e.target.selectedIndex].text;
      currentSpecies.selections.moveValues[moveNumber] = moveChoice;
      currentTeam.members[teamID].moveValues[moveNumber] = moveChoice;
      currentSpecies.selections.moves[moveNumber] = moveText;
      currentTeam.members[teamID].moves[moveNumber] = moveText;
    }; //if there's a selected move in this slot, set the value (won't do anything if the selection isn't one of the options)


    if (currentSpecies.selections.moveValues[moveNumber] || currentSpecies.selections.moveValues[moveNumber] === 0) {
      select.value = currentSpecies.selections.moveValues[moveNumber];
    }
  } else {
    //don't have an onchange if it's null
    select.innerHTML = "";

    var _option2 = document.createElement("option");

    _option2.value = "";
    _option2.textContent = "No Results Found";
    select.append(_option2);
    select.value = "";
    select.onchange = null;
  }
};

var saveTeam = function saveTeam(e) {
  var dataLoaded = function dataLoaded(e) {
    //This will essentially 'exit' the team editing page once it's done.
    document.querySelector("#teams").innerHTML = "Loading...";
    loadTeamsFromServer();
  }; //creates the data and sends it


  var jsonData = {
    name: currentTeam.name,
    members: [],
    _csrf: document.querySelector('#csrf').value
  }; //end json

  if (currentTeam._id || currentTeam._id == 0) {
    jsonData._id = currentTeam._id;
  } //loop through every possible team member


  for (var i = 0; i < 6; i++) {
    var teamMember = currentTeam.members[i]; //only add it to the data if it is real

    if (teamMember) {
      var memberObject = {
        name: teamMember.name,
        image: teamMember.image,
        number: teamMember.number
      }; //add the ability if it exists

      var memberAbility = teamMember.abilityValue;

      if (memberAbility || memberAbility === 0) {
        memberObject.ability = memberAbility;
      } else {
        memberObject.ability = "";
      } //adds the moves if each of them exists


      var memberMoves = [];

      for (var j = 0; j < 4; j++) {
        var newMove = teamMember.moveValues[j];

        if (newMove || newMove === 0) {
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
