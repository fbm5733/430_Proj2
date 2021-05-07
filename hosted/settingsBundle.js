"use strict";

var handlePassChange = function handlePassChange(e) {
  e.preventDefault();
  $("#porygonMessage").animate({
    right: -250
  }, 350);

  if ($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
    handleError("No fields can be empty");
    return false;
  }

  sendAjax('POST', $("#passForm").attr("action"), $("#passForm").serialize(), redirect);
  return false;
};

var PremiumSection = function PremiumSection(props) {
  var button;

  if (props.result.premium && (props.result.premium === "true" || props.result.premium === true)) {
    //already has premium
    button = /*#__PURE__*/React.createElement("h2", {
      className: "big",
      id: "hasPremium"
    }, "You already have Premium");
  } else {
    var handleClick = function handleClick() {
      sendAjax('GET', '/makePremium', null, redirect);
    };

    button = /*#__PURE__*/React.createElement("button", {
      id: "premiumButton",
      onClick: handleClick
    }, "Get Premium Now!");
  }

  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Premium Mode!"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "No team limit!"), /*#__PURE__*/React.createElement("li", null, "Share teams with others!"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strike", null, "A monkey will be shipped to your house!"))), button);
};

var PassChange = function PassChange(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "passForm",
    name: "passForm",
    onSubmit: handlePassChange,
    action: "/passwordChange",
    method: "POST",
    className: "mainForm"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "big"
  }, "Change Password"), /*#__PURE__*/React.createElement("label", {
    htmlFor: "username"
  }, "Username: "), /*#__PURE__*/React.createElement("input", {
    id: "user",
    type: "text",
    name: "username",
    placeholder: "username"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "pass"
  }, "Old Password: "), /*#__PURE__*/React.createElement("input", {
    id: "pass",
    type: "password",
    name: "pass",
    placeholder: "old password"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "pass2"
  }, "New Password: "), /*#__PURE__*/React.createElement("input", {
    id: "pass2",
    type: "password",
    name: "pass2",
    placeholder: "new password"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Change Password"
  }));
};

var createLoginWindow = function createLoginWindow(result) {
  ReactDOM.render( /*#__PURE__*/React.createElement(PremiumSection, {
    result: result
  }), document.querySelector("#premium"));
  ReactDOM.render( /*#__PURE__*/React.createElement(PassChange, {
    csrf: result.csrfToken
  }), document.querySelector("#passChange"));
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    createLoginWindow(result);
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage span").text(message);
  $("#porygonMessage").animate({
    right: 100
  }, 350);
};

var redirect = function redirect(response) {
  $("#porygonMessage").animate({
    right: -250
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
      console.log(xhr.responseText);
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
