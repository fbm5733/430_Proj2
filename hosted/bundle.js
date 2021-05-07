"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var currentTeam = {};
var currentSpecies = {};
var detailsRef;

var handleTeam = function handleTeam(e) {
  e.preventDefault();
  $("#teamMessage").animate({
    width: 'hide'
  }, 350);
  sendAjax('POST', $("#teamForm").attr("action"), $("#teamForm").serialize(), function () {
    loadTeamsFromServer();
  });
  return false;
}; //the form is not a form anymore, just a hidden csrf


var TeamForm = function TeamForm(props) {
  return /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    id: "csrf",
    name: "_csrf",
    value: props.csrf
  });
}; //create the inital list of all the teams, with all 6 members of each displayed


var TeamList = function TeamList(props) {
  if (props.teams.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "teamList"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "emptyTeam"
    }, "No Teams yet"));
  }

  var teamNodes = props.teams.map(function (team) {
    document.title = "Team Maker";
    var memberNodes = []; //iterates 6 times, once each possible team member
    //ones that don't exist will have an empty member created

    for (var i = 0; i < 6; i++) {
      //get the team member from the object
      var species = team.members[i]; //pushes it with the SpeciesImageName component

      memberNodes.push( /*#__PURE__*/React.createElement("div", {
        key: "".concat(team._id, " + ").concat(i),
        className: "teamMember"
      }, /*#__PURE__*/React.createElement(SpeciesImageName, {
        species: species
      })));
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
    }, memberNodes));
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "teamList"
  }, teamNodes);
};

var SpeciesImageName = /*#__PURE__*/function (_React$Component) {
  _inherits(SpeciesImageName, _React$Component);

  var _super = _createSuper(SpeciesImageName);

  //initialize
  function SpeciesImageName(props) {
    var _this;

    _classCallCheck(this, SpeciesImageName);

    _this = _super.call(this, props);
    var species = props.species; //defaults for the species, empty

    if (!species) {
      species = {
        image: "/assets/img/transparent.gif",
        name: "Empty"
      };
    } //sets the state


    _this.state = {
      species: species
    };
    _this.handleChange = _this.handleChange.bind(_assertThisInitialized(_this));
    return _this;
  } //handles the change in the species


  _createClass(SpeciesImageName, [{
    key: "handleChange",
    value: function handleChange(newSpecies) {
      var species = newSpecies; //defaults for the species, empty

      if (!species) {
        species = {
          image: "/assets/img/transparent.gif",
          name: "Empty"
        };
      } //sets the state


      this.setState({
        species: species
      });
    } //render the component

  }, {
    key: "render",
    value: function render() {
      //displays the name and image 
      //the defaults are in case the species exists but hte name/image doesn't (should never happen but checking anyway)
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
        width: "475",
        src: this.state.species.image || "/assets/img/transparent.gif",
        alt: this.state.species.name || "Empty"
      }), /*#__PURE__*/React.createElement("h3", null, this.state.species.name || "Empty"));
    }
  }]);

  return SpeciesImageName;
}(React.Component);

var TeamCreateScreen = function TeamCreateScreen(props) {
  //sets the team we are working with
  currentTeam = props.team;
  document.title = "Team Maker - ".concat(currentTeam.name);
  var memberNodes = []; //iterates 6 times, once each possible team member
  //ones that don't exist will have an empty member created

  var _loop = function _loop(i) {
    //get the team member from the object
    var species = currentTeam.members[i];
    var childSpecies = React.createRef(); //sends the reference up so they can be changed later

    function startEditMember(e) {
      editMember(e, childSpecies);
    } //pushes it with the SpeciesImageName component


    memberNodes.push( /*#__PURE__*/React.createElement("div", {
      key: "m".concat(i),
      id: "m".concat(i),
      className: "teamMemberEdit",
      onClick: startEditMember
    }, /*#__PURE__*/React.createElement(SpeciesImageName, {
      ref: childSpecies,
      species: species
    })));
  };

  for (var i = 0; i < 6; i++) {
    _loop(i);
  } //function for changing the name


  function handleNameChange(e) {
    currentTeam.name = e.target.value;
    document.title = "Team Maker - ".concat(currentTeam.name);
  }

  ;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "saveTeam",
    onClick: saveTeam
  }, "Save & Exit"), /*#__PURE__*/React.createElement("div", {
    className: "teamPage"
  }, /*#__PURE__*/React.createElement("input", {
    id: "nameInput",
    defaultValue: currentTeam.name,
    onChange: handleNameChange
  }), /*#__PURE__*/React.createElement("div", {
    className: "innerTeam"
  }, memberNodes)), /*#__PURE__*/React.createElement("div", {
    className: "teamPage",
    id: "detailsDiv",
    style: {
      display: 'none'
    }
  }));
};

var setupTeamCreateScreen = function setupTeamCreateScreen(obj) {
  ReactDOM.render( /*#__PURE__*/React.createElement(TeamCreateScreen, {
    team: obj
  }), document.querySelector("#teams"));
}; //picks the member and sends the request


var editMember = function editMember(e, ref) {
  //sets the member we're working with
  var id = e.currentTarget.id.substring(1);
  currentSpecies = {
    id: id,
    ref: ref
  };
  var member = currentTeam.members[id]; //starts displaying appropriately

  if (member) {
    currentSpecies.selections = member;
    sendAjax('GET', "/getSpeciesData?species=".concat(member.name, "&id=").concat(id, "&newSpecies=no"), null, showSpeciesData);
  } else {
    showSpeciesData({
      id: id
    });
  }
};

var SpeciesSelectOptions = /*#__PURE__*/function (_React$Component2) {
  _inherits(SpeciesSelectOptions, _React$Component2);

  var _super2 = _createSuper(SpeciesSelectOptions);

  function SpeciesSelectOptions(props) {
    var _this2;

    _classCallCheck(this, SpeciesSelectOptions);

    _this2 = _super2.call(this, props);
    _this2.state = {
      results: props.results,
      loading: props.loading
    };
    _this2.handleResults = _this2.handleResults.bind(_assertThisInitialized(_this2));
    return _this2;
  } //handles the change in the results


  _createClass(SpeciesSelectOptions, [{
    key: "handleResults",
    value: function handleResults(newResults, loading) {
      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
      this.setState({
        results: newResults,
        loading: loading
      }, callback);
    }
  }, {
    key: "render",
    value: function render() {
      var options = [];
      var results = this.state.results; //if it's loading make a loading option

      if (this.state.loading) {
        options.push( /*#__PURE__*/React.createElement("option", {
          key: "default",
          value: ""
        }, "Loading...")); //if none are found make a no results option
      } else if (!results || results.length <= 0) {
        options.push( /*#__PURE__*/React.createElement("option", {
          key: "default",
          value: ""
        }, "No Results Found")); //otherwise keep going
      } else {
        //default option
        options.push( /*#__PURE__*/React.createElement("option", {
          key: "default",
          value: ""
        }, "None")); //option for every species

        results.forEach(function (name) {
          options.push( /*#__PURE__*/React.createElement("option", {
            key: name,
            value: name
          }, name));
        });
      } //render


      return /*#__PURE__*/React.createElement(React.Fragment, null, options);
    }
  }]);

  return SpeciesSelectOptions;
}(React.Component);

var AbilitySelectOptions = function AbilitySelectOptions(props) {
  var options = [];
  var abilities = props.data.abilities;

  for (var i = 0; i < abilities.length; i++) {
    options.push( /*#__PURE__*/React.createElement("option", {
      key: i,
      value: i
    }, abilities[i].ability.name));
  }

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "None"), options);
};

var MoveSelectOptions = /*#__PURE__*/function (_React$Component3) {
  _inherits(MoveSelectOptions, _React$Component3);

  var _super3 = _createSuper(MoveSelectOptions);

  //initialize
  function MoveSelectOptions(props) {
    var _this3;

    _classCallCheck(this, MoveSelectOptions);

    _this3 = _super3.call(this, props);
    _this3.state = {
      results: props.results
    };
    _this3.handleResults = _this3.handleResults.bind(_assertThisInitialized(_this3));
    return _this3;
  } //handles the change in the results


  _createClass(MoveSelectOptions, [{
    key: "handleResults",
    value: function handleResults(newResults, callback) {
      this.setState({
        results: newResults
      }, callback);
    } //render the component

  }, {
    key: "render",
    value: function render() {
      var results = this.state.results;

      if (results.length > 0) {
        //makes all the options
        var options = [];

        for (var i = 0; i < results.length; i++) {
          //pushes the move
          options.push( /*#__PURE__*/React.createElement("option", {
            key: i,
            value: results[i].id
          }, results[i].name));
        } //builds the React component


        return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("option", {
          value: ""
        }, "None"), options);
      } else {
        //version with no results
        return /*#__PURE__*/React.createElement("option", {
          value: ""
        }, "No Results Found");
      }
    }
  }]);

  return MoveSelectOptions;
}(React.Component);

var DetailsScreen = /*#__PURE__*/function (_React$Component4) {
  _inherits(DetailsScreen, _React$Component4);

  var _super4 = _createSuper(DetailsScreen);

  //makes a constructor
  function DetailsScreen(props) {
    var _this4;

    _classCallCheck(this, DetailsScreen);

    _this4 = _super4.call(this, props);
    _this4.state = {
      obj: props.obj
    };
    _this4.handleNewSpecies = _this4.handleNewSpecies.bind(_assertThisInitialized(_this4));
    return _this4;
  } //handles the change in the results


  _createClass(DetailsScreen, [{
    key: "handleNewSpecies",
    value: function handleNewSpecies(obj, callback) {
      this.setState({
        obj: obj
      }, callback);
    } //render function

  }, {
    key: "render",
    value: function render() {
      var obj = this.state.obj;
      var data = obj.data;
      var extraPieces = [];
      var speciesValue = ""; //if there's data for this pokemon, then make all the extra-detailed pieces

      if (data) {
        //function for when an ability is selected
        var handleAbilitySelect = function handleAbilitySelect(e) {
          var newAbility = e.target.value;
          var abilityText = e.target.options[e.target.selectedIndex].text;
          currentSpecies.selections.abilityValue = newAbility;
          currentTeam.members[obj.id].abilityValue = newAbility;
          currentSpecies.selections.ability = abilityText;
          currentTeam.members[obj.id].ability = abilityText;
        };

        //sets the data in the current species
        currentSpecies.data = data;
        var moves = data.moves.map(function (move, index) {
          return {
            name: move.move.name,
            id: index //need to save the index to store it if the user picks it

          };
        }); //sets the default value for species to be the name picked

        speciesValue = data.name;
        ; //creates a div for choosing the Ability

        extraPieces.push( /*#__PURE__*/React.createElement("div", {
          key: "ability",
          className: "question"
        }, /*#__PURE__*/React.createElement("label", {
          className: "label"
        }, "Ability: "), /*#__PURE__*/React.createElement("select", {
          defaultValue: currentSpecies.selections.abilityValue,
          className: "select",
          id: "abilitySelect",
          onChange: handleAbilitySelect
        }, /*#__PURE__*/React.createElement(AbilitySelectOptions, {
          data: data
        })))); //makes 4 move choosers

        var _loop2 = function _loop2(i) {
          //selected move
          var searchValue = "";
          var tempSearchValue = currentSpecies.selections.moves[i];

          if (tempSearchValue && tempSearchValue !== "None") {
            searchValue = tempSearchValue;
          }

          var childMove = React.createRef(); //function for handling a move being searched for

          function handleMoveSearch(e) {
            var selected = document.querySelector("#moveSelect".concat(i));
            searchMove(selected, data, i, obj.id, e.target.value.trim().toLowerCase(), childMove);
          } //set up onchange event for the select list


          function handleMoveSelect(e) {
            //changes the move and move text
            var moveChoice = e.target.value;
            var moveText = e.target.options[e.target.selectedIndex].text;
            currentSpecies.selections.moveValues[i] = moveChoice;
            currentTeam.members[obj.id].moveValues[i] = moveChoice;
            currentSpecies.selections.moves[i] = moveText;
            currentTeam.members[obj.id].moves[i] = moveText;
          }

          extraPieces.push( /*#__PURE__*/React.createElement("div", {
            key: "move".concat(i),
            className: "question"
          }, /*#__PURE__*/React.createElement("label", {
            className: "label"
          }, "Move ".concat(i + 1, ": ")), /*#__PURE__*/React.createElement("input", {
            defaultValue: searchValue,
            className: "search",
            onChange: handleMoveSearch
          }), /*#__PURE__*/React.createElement("select", {
            onChange: handleMoveSelect,
            defaultValue: searchValue,
            className: "select",
            id: "moveSelect".concat(i)
          }, /*#__PURE__*/React.createElement(MoveSelectOptions, {
            ref: childMove,
            results: moves
          }))));
        };

        for (var i = 0; i < 4; i++) {
          _loop2(i);
        }
      }

      var selectRef = React.createRef();

      function handleResponseReceived(obj) {
        speciesSelectFunc(obj, selectRef);
      }

      function handleSpeciesSearch(e) {
        selectRef.current.handleResults([], true);
        sendAjax('GET', "/speciesSearch?q=".concat(encodeURIComponent(e.target.value)), null, handleResponseReceived);
      }

      sendAjax('GET', "/speciesSearch?q=".concat(speciesValue), null, handleResponseReceived);
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "question"
      }, /*#__PURE__*/React.createElement("label", {
        className: "label"
      }, "Pokemon Name: "), /*#__PURE__*/React.createElement("input", {
        defaultValue: speciesValue,
        id: "speciesSearch",
        className: "search",
        onChange: handleSpeciesSearch,
        onLoad: handleSpeciesSearch
      }), /*#__PURE__*/React.createElement("select", {
        defaultValue: speciesValue,
        className: "select",
        id: "speciesSelect",
        onChange: null
      }, /*#__PURE__*/React.createElement(SpeciesSelectOptions, {
        ref: selectRef,
        results: [],
        loading: true
      }))), extraPieces);
    }
  }]);

  return DetailsScreen;
}(React.Component);

;

var showSpeciesData = function showSpeciesData(obj) {
  var detailsDiv = document.querySelector("#detailsDiv"); //the user clicked somewhere else before the response got back, so don't do anything anymore

  if (!detailsDiv || obj.id !== currentSpecies.id) return; //resets the species if you are changing it to something new (and data is actually found)

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
    }; //sets the image and name for the react div based on the reference

    currentSpecies.ref.current.handleChange({
      image: newObj.image,
      name: newObj.name
    });
    currentSpecies.selections = newObj;
    currentTeam.members[obj.id] = newObj;
  } //callback for creating details page


  function callback() {
    //display it now
    detailsDiv.style.display = 'block'; //fill the value in

    var speciesSearch = document.querySelector("#speciesSearch");

    if (obj.data) {
      speciesSearch.value = obj.data.name;
    } else {
      speciesSearch.value = "";
    }

    window.scrollTo(0, document.body.scrollHeight); //scroll to bottom to show the changes (doesn't work?)
  } //renders or changes the state, depending on if it exists yet


  if (!detailsRef) {
    detailsRef = React.createRef();
    ReactDOM.render( /*#__PURE__*/React.createElement(DetailsScreen, {
      ref: detailsRef,
      obj: obj
    }), detailsDiv, callback);
  } else {
    detailsRef.current.handleNewSpecies(obj, callback);
  }
}; //pupulates the select list


var speciesSelectFunc = function speciesSelectFunc(obj, selectRef) {
  //makes sure it exists still first
  var speciesSelectList = document.querySelector("#speciesSelect");
  var results = obj.results; //changes the state

  selectRef.current.handleResults(results, false, function () {
    //sets up the onchange when it's done with the state change
    if (speciesSelectList && results && results.length > 0) {
      speciesSelectList.onchange = function (e) {
        //changes the species
        if (e.target.value !== "") {
          sendAjax('GET', "/getSpeciesData?species=".concat(e.target.value, "&id=").concat(currentSpecies.id, "&newSpecies=yes"), null, showSpeciesData);
        } else {
          //sets the image and name for the react div based on the reference
          currentSpecies.ref.current.handleChange({
            image: "/assets/img/transparent.gif",
            name: "Empty"
          });
          currentSpecies = {
            id: currentSpecies.id,
            ref: currentSpecies.ref
          };
          currentTeam.members[currentSpecies.id] = null; //this will empty out this div

          showSpeciesData({
            id: currentSpecies.id
          });
        }
      };

      var speciesCheck = false; //check if the selected one is included

      results.forEach(function (species) {
        if (currentSpecies.selections && species === currentSpecies.selections.name) speciesCheck = true;
      }); //if there's a selected species then set the current value

      if (speciesCheck) {
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

var searchMove = function searchMove(select, data) {
  var moveNumber = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var teamID = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var searchString = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
  var ref = arguments.length > 5 ? arguments[5] : undefined;
  if (!data.moves || !select) return []; //return if it won't work
  //check if the choice exists in the filter

  var choiceExistsCheck = false; //grabs all the moves that fit with the filter string

  var results = data.moves.map(function (move, index) {
    return {
      name: move.move.name,
      id: index //need to save the index to store it if the user picks it

    };
  }).filter(function (object) {
    if (object.name.includes(searchString)) {
      //check if this is the selected move
      if (currentSpecies.selections.moveValues[moveNumber] == object.id) {
        choiceExistsCheck = true;
      } //return true


      return true;
    }

    return false; //otherwise false
  }); //filters out to be only the ones searched for
  //sets the state for the reference

  ref.current.handleResults(results, function () {
    //this is a callback so it happens after the options are made (since it sets the value)
    if (results.length > 0) {
      //set up onchange event for the select list
      select.onchange = function (e) {
        //changes the move and move text
        var moveChoice = e.target.value;
        var moveText = e.target.options[e.target.selectedIndex].text;
        currentSpecies.selections.moveValues[moveNumber] = moveChoice;
        currentTeam.members[teamID].moveValues[moveNumber] = moveChoice;
        currentSpecies.selections.moves[moveNumber] = moveText;
        currentTeam.members[teamID].moves[moveNumber] = moveText;
      }; //if there's a selected move in this slot, set the value


      if (choiceExistsCheck) {
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

var saveTeam = function saveTeam(e) {
  var dataLoaded = function dataLoaded(e) {
    //This will essentially 'exit' the team editing page once it's done.
    ReactDOM.render( /*#__PURE__*/React.createElement(TeamList, {
      teams: []
    }), document.querySelector("#teams"));
    detailsRef = null;
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
