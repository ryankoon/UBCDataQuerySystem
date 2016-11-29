window.fbAsyncInit = function() {
    FB.init({
        appId      : 1742605689397521,
        xfbml      : true,
        version    : 'v2.7'
    });
    FB.AppEvents.logPageView();

 };

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));3

$(document).ready(function () {

    faceBookInitialLocalStorage = function(response){
        var localFacebookIds = JSON.parse(localStorage.getItem('facebookUserIds'));
        var currentUserId = response.authResponse.userID;
        if (localFacebookIds === null) {
            var arrayOfUserObjects = [];
            var userObject = {
                id : response.authResponse.userID,
                rating : null
            }
            arrayOfUserObjects.push(userObject);
            localStorage.setItem('facebookUserIds', JSON.stringify(arrayOfUserObjects));
        }
        else{
            // Mutate the userID to have the new user
            var unique = false;
            for (var i=0; i < localFacebookIds.length; i++){
                if (localStorage.getItem('facebookUserIds').indexOf(currentUserId) === -1){
                   unique = true;
                }
            }
            if (unique) { // dbl check this. indexof always messes with me.
                var userObject = {
                    id : response.authResponse.userID,
                    rating : null
                }
                localFacebookIds.push(userObject);
                localStorage.setItem('facebookUserIds', JSON.stringify(localFacebookIds));
            }
        }

        localStorage.setItem('currentFacebookUserId', currentUserId);
    }


    $('.fb-connect').on("click", function () {
        FB.getLoginStatus(function(response) {
            console.log('Entered get login status');
            if (response.status === 'connected') {
                faceBookInitialLocalStorage(response);
                alert('Already Logged in.');
                /*
                 GET /oauth/access_token
                 ?client_id={app-id}
                 &client_secret={app-secret}
                 &grant_type=client_credentials
                 Need to make a GRAPH API get to this address in order to get an APP access token
                 */

                var path = '/' + response.authResponse.userID + '/notifications';
                var params = {
                    access_token : response.authResponse.accessToken, // need APP access token.
                    href : 'http:localhost:4321/scheduler',
                    template: {Message : 'hello bob'}
                }
                var method = "post";
                FB.api(path, method, params, function (res, err){
                   console.log(res);
                });
/*
                FB.api('/' + response.authResponse.userId +
                    '/notifications?' +
                    'access_token=' + response.authResponse.accessToken + '&' +
                    'href="http://localhost:4321/scheduler&' +
                    '&template="hi im bob"'
                    , function (res) {
                        console.log(res);
                    });
                    */
            }
            else {
                FB.login(function (response) {
                    // need app access token
                    // We have current user-ID... but now ...
                    // can we notify users who are mutual friends?
                    faceBookInitialLocalStorage(response);
                });
            }
        });
    });
});