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
}(document, 'script', 'facebook-jssdk'));

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
        var params = {
            client_id : 1742605689397521,
            client_secret : '5b6416dcd978b547263135c130757dd3',
            grant_type : response.authResponse.accessToken
        }
        /*
        var queryString = 'client_id=' + params.client_id + '?client_secret=' + params.client_secret + '?grant_type=' + params.grant_type
        FB.api('/oauth/access_token?' + queryString, 'GET', function (err, res){
           console.log(res);
        });
        */
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
                var permToken = 'EAAYw5AEZAoREBAMQ0YlZATZCCsZCpnGUhzASzPEaKRVdxfK6960qFlobKkdAsa2JQoHccVHMaLFsgw7z5wW5k5chrp86ZBKOJLvfEHhRkNY6yTCEPYgBZAyqmh7n9raeOjSTPKEaycJsBvSOT2F4wf';
               // https://graph.facebook.com/v2.2/319036708483383/notifications?access_token=1742605689397521|F-vL6J-Q0jTYAYfFcp8vCMI5ch8
                if (localStorage.getItem('newRatingFound') !== null) {
                var valueOfRatedUser = JSON.parse(localStorage.getItem('newRatingFound'));
                var allfbusers = JSON.parse(localStorage.getItem('facebookUserIds'));
                allfbusers.forEach(function(fbuser)
                    {
                        var path = '/' + fbuser.id + '/notifications?access_token=' + '1742605689397521|F-vL6J-Q0jTYAYfFcp8vCMI5ch8';
                        var params;
                        if (fbuser.id == valueOfRatedUser.id) {
                            params = {
                                href: 'http:localhost:4321/scheduler',
                                template: 'You achieved a high schedule score of ' + valueOfRatedUser.rating + '!'
                            }
                        } else {
                            params = {
                                href: 'http:localhost:4321/scheduler',
                                template: '@['+ valueOfRatedUser.id + '] achieved a high schedule score of ' + valueOfRatedUser.rating + '!'
                            }
                        }
                        var method = "post";
                        FB.api(path, method, params, function (res, err) {
                            console.log(res);
                        });
                    });
                localStorage.removeItem('newRatingFound');
                }


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

    function loginfbAndUpdate() {
        FB.getLoginStatus(function(response) {
            console.log('Entered get login status');
            if (response.status === 'connected') {
                faceBookInitialLocalStorage(response);
                /*
                 GET /oauth/access_token
                 ?client_id={app-id}
                 &client_secret={app-secret}
                 &grant_type=client_credentials
                 Need to make a GRAPH API get to this address in order to get an APP access token
                 */
                var permToken = 'EAAYw5AEZAoREBAMQ0YlZATZCCsZCpnGUhzASzPEaKRVdxfK6960qFlobKkdAsa2JQoHccVHMaLFsgw7z5wW5k5chrp86ZBKOJLvfEHhRkNY6yTCEPYgBZAyqmh7n9raeOjSTPKEaycJsBvSOT2F4wf';
                // https://graph.facebook.com/v2.2/319036708483383/notifications?access_token=1742605689397521|F-vL6J-Q0jTYAYfFcp8vCMI5ch8
                if (localStorage.getItem('newRatingFound') !== null) {
                    var valueOfRatedUser = JSON.parse(localStorage.getItem('newRatingFound'));
                    var allfbusers = JSON.parse(localStorage.getItem('facebookUserIds'));
                    allfbusers.forEach(function(fbuser)
                    {
                        var path = '/' + fbuser.id + '/notifications?access_token=' + '1742605689397521|F-vL6J-Q0jTYAYfFcp8vCMI5ch8';
                        var params;
                        if (fbuser.id == valueOfRatedUser.id) {
                            params = {
                                href: 'http:localhost:4321/scheduler',
                                template: 'You achieved a high schedule score of ' + valueOfRatedUser.rating + '!'
                            }
                        } else {
                            params = {
                                href: 'http:localhost:4321/scheduler',
                                template: '@['+ valueOfRatedUser.id + '] achieved a high schedule score of ' + valueOfRatedUser.rating + '!'
                            }
                        }
                        var method = "post";
                        FB.api(path, method, params, function (res, err) {
                            console.log(res);
                        });
                    });
                    localStorage.removeItem('newRatingFound');
                }


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
    }
    var si;
    $('#react-tabs-4').on("click", function () {
            si = setInterval(function() {
                if ($('.react-bs-table') && $('.react-bs-table').length > 0) {
                    console.log("trying");
                    loginfbAndUpdate();
                    clearInterval(si);
                }
            }, 1000);
        });

});