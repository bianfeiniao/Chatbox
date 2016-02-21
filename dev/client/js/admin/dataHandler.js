(function() {
    "use strict";

    var utils = chatbox.utils;



    var dataHandler = chatboxAdmin.dataHandler;

    // userDict and socketDict contains all of online users and sockets
    var userDict = {};
    var socketDict = {};

    // selectedUsers are users whose all sockets are selected
    var selectedUsers = {};

    // selectedSockets are selected sockets whose users are not in selectedUsers
    var selectedSockets = {};
    // partiallyselectedUsers are users of selectedSocket
    var partiallyselectedUsers = {};

    // if a user is in partiallyselectedUsers, he's not in selectedUsers
    // if no socket of a user is selected, he's in neither partiallyselectedUsers nor selectedUsers



    // this removes the user and his sockets from all lists
    function clearUserSocketFromSelection(userID) {
        // remove user
        var user = userDict[userID];
        delete selectedUsers[userID];
        delete partiallyselectedUsers[userID];

        // remove his sockets
        user.selectedSocketCount = 0;
        for(var i = 0; i < user.socketList.length; i++) {
            var s = user.socketList[i];
            s.selected = false;
            delete selectedSockets[s.id];
        }
    }

    // fully select the user
    function selectUser(userID) {

        var user = userDict[userID];
        selectedUsers[userID] = user;
        delete partiallyselectedUsers[userID];

        user.selectedSocketCount = user.count;
        for(var i = 0; i < user.socketList.length; i++) {
            var s = user.socketList[i];
            s.selected = true;
            delete selectedSockets[s.id];
        }

    }

    // if already fully selected, deselect; 
    // if not selected or partially selected, fully select now
    function toggleUserSelection(userID) {

        if (userID in selectedUsers){

            clearUserSocketFromSelection(userID);

        }else {
            
            clearUserSocketFromSelection(userID);
            selectUser(userID);

        }

    }

    function toggleSocketSelection(socketID) {

        var s = socketDict[socketID];
        var user = s.user;

        if (s.selected) {

            s.selected = false;
            user.selectedSocketCount--;

        }else {

            s.selected = true;
            user.selectedSocketCount++;

        }

        cleanUp(user);

    }

    // decide where the socket/user go base on selectedUserCount

    function cleanUp(user) {

        if (user.selectedUserCount === user.count) {

            clearUserSocketFromSelection(userID);
            selectUser(userID);

        }else if (user.selectedSocketCount > 0) {

            partiallyselectedUsers[user.id] = user;
            addSelectedSockets(user);

        }else {

            clearUserSocketFromSelection(userID);

        }
    }


    function selectNoSocketNorUser() {
        selectedUsers = {};
        selectedSockets = {};
        partiallyselectedUsers = {};
        for(var userKey in userDict) {
            var user = userDict[userKey];
            clearUserSocketFromSelection(user.id);
        }
    }

    function selectAllUsers() {

        for(var userKey in userDict) {
            var user = userDict[userKey];
            selectUser(user.id);
        }
    }


    function addSelectedSockets(user) {
        for(var i=0; i<user.socketList.length; i++) {
            var s = user.socketList[i];
            if (s.selected)
                selectedSockets[s.id] = s;
        }
    }

    function handleDataTransition() {

        // handle selected users
        for (var userID in selectedUsers) {
            // if user still online
            if (userID in userDict) {

                selectUser(userID);

            }else {

                delete selectedUsers[userID];
            }
        }

        // handle partially selected users
        // they may be gone, but they may also become fully selected users 

        for (var userID in partiallyselectedUsers) {
            // if user still online
            if (userID in userDict) {

                // check to see if he should stay in partiallyselectedUsers or 
                // go to selectedUsers

                var user = userDict[userID];

                for (var i = 0; i < user.socketList.length; i++) {

                    var s = user.socketList[i];
                    if (s.id in selectedSockets) {

                        s.selected = true;
                        user.selectedSocketCount++;
                    }

                }

                cleanUp(user);

            }else {

                delete partiallyselectedUsers[userID];
            }
        }




        // remove sockets that no longer alive

        for (var socketID in selectedSockets) {
            if (!(socketID in socketDict)) {
                delete selectedSockets[socketID];
            }
        }


    }


    function loadUserSocketFromServer(userdict) {


        // load new data about users and their sockets
        userDict = userdict;
        socketDict = {};
 
        // add selectedSocketCount to user
        // link socket to user, put socket in socketDict

        for (var key in userDict) {

            var user = userDict[key];

            user.selectedSocketCount = 0; // for socket/user selection purpose

            for (var i = 0; i < user.socketList.length; i++) {

                var s = user.socketList[i];
                s.user = user;
                s.selected = false;
                socketDict[s.id] = s;

            }

        }

        handleDataTransition();

    }

    dataHandler.loadUserSocketFromServer = loadUserSocketFromServer;




    
})();
