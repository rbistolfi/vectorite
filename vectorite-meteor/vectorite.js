// vectorite - irc logger for #vectorlinux-admin
// by rbistolfi
// GNU GPLv3
// 2013


Messages = new Meteor.Collection("messages");


// Return a new Date instance for yesterday
Date.prototype.yesterday = function() {
    var d = new Date(this);
    return new Date(d.setDate(d.getDate() - 1));
}

// Return a new Date instance for two days ago
Date.prototype.twoDaysAgo = function() {
    var d = new Date(this);
    return new Date(d.setDate(d.getDate() - 2));
}

// Convert to string using the required format
Date.prototype.toString = function() {
    var month, day, year;
    month = ("0" + (this.getUTCMonth() + 1)).slice(-2);
    day = ("0" + this.getUTCDate()).slice(-2);
    year = this.getUTCFullYear();
    return month + "/" + day + "/" + year
}


// Routing
VectoriteRouter = Backbone.Router.extend({
    routes: {
        ":channel": "setChannel",
    },
    setChannel: function (channel) {
        Session.set('channel', channel);
	console.log(channel);
    }
});


Router = new VectoriteRouter;


if (Meteor.isClient) {


    // helper for setting date filter
    var setDateFilter = function() {
        var date = document.getElementById("datepicker").value;
        Session.set("date", date);
        Meteor.flush();
    }

    // set date to today
    var setCurrentDate = function() {
        Session.set("date", undefined);
    }

    // set date to yesterday
    var setYesterdayDate = function() {
        var d = new Date();
        Session.set("date", d.yesterday().toString());
    }

    // set date to two days ago
    var setTwoDaysAgoDate = function() {
        var d = new Date();
        Session.set("date", d.twoDaysAgo().toString());
    }
   
    // helper for scrolling down for showing new messages
    var scrollMessagesDivDown = function() {
        $("#messages").scrollTop(99999);
    }

    // helper for setting last msg time
    var setLastMessageTime = function(message) {
        if (message) {
            Session.set("lastMessageTime", message.time);
        }
    }

    // called when a new msg arrives
    var onNewMessageReceived = function(newMessage) {
        setLastMessageTime(newMessage);
        scrollMessagesDivDown();   
    }

    // return messages filtering by date - Default to all since today
    Template.messages.messages = function () {
        var query = { channel: Session.get("channel") };
        if (Session.equals("date", undefined)) {
            query.date = {$gte: new Date().toString()};
        } 
        else {
            query.date = Session.get("date");
        }
        return Messages.find(query);
    }

    // Pass name of the channel
    Template.header.channel = function () {
	return Session.get("channel");
    }

    // pass last message time
    Template.lastMessageTime.lastMessageTime = function() {
        return Session.get("lastMessageTime");
    }


    // bind controls 
    Template.controls.events({
        'blur input#datepicker': setDateFilter,
        'keyup input#datepicker': setDateFilter,
        'click #radio1': function() { 
            setCurrentDate();
            $("input#datepicker").val("");
        },
        'click #radio2': function() { 
            setYesterdayDate();
            $("input#datepicker").val("");
        },
         'click #radio3': function() { 
            setTwoDaysAgoDate();
            $("input#datepicker").val("");
        }
    });
 
    // XXX find an elegant way to handle these
    // auto-scroll div when new message arrives
    Messages.find().observe({
        added: onNewMessageReceived
    });
    // scroll also in startup
    Meteor.startup(function() {
        scrollMessagesDivDown();
	Backbone.history.start({pushState: true});
    });
    // and when template is rendered
    Template.messages.rendered = scrollMessagesDivDown;
    // pimp the controls
    Template.controls.rendered = function() { $("#datenav").buttonset() }


}
