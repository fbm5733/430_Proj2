const handleError = (message) => {
    $("#errorMessage span").text(message); 
    $("#porygonMessage").animate({right:100},350); 
}; 
    
const redirect = (response) => { 
    $("#porygonMessage").animate({right:-250}, 350);
    window.location = response.redirect; 
};

const sendAjax = (type, action, data, success) => {
    $.ajax({ 
        cache: false, 
        type: type, 
        url: action, 
        data: data, 
        dataType: "json", 
        success: success, 
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};   