// YOUR CODE HERE:
var events = _.clone(Backbone.Events);
var urlz = 'https://api.parse.com/1/classes/chatterbox';

var NewMessageView = function(options){

  events.on('message:post', this.postMessage, this);
  events.on('message:p', this.postMessage, this);






  // this.messages = options.messages;
  // this.users = options.users || {};
  // this.chatrooms = options.chatrooms || {};
  // this.friends = options.friends || {};
  // this.refreshInterval = options.timeInterval || 5000;
  // this.currentRoom = options.currentRoom || "lobby";

  // var submit = $.proxy(this.postMessage, this);
  // var login = $.proxy(this.changeUser, this);
  // var toggle = $.proxy(this.toggleFriend, this);
  // var change = $.proxy(this.changeRoom, this);
  // var that = this;

  // $('.submitButton').on('click', submit);
  // $('.inputField').on('keydown', function(event){
  //   if(event.which === 13){submit(event);} });
  // $('.loginButton').on('click', login);
  // $(document).on('click','.user', toggle);
  // $(document).on('click', '.room', change);

  // var opt = this.messages.retrieveOptions();
  // opt.success = function(data){
  //       that.render(data.results, that);
  // };
  // that.messages.retrieve(opt);
  // setInterval(function(){
  //   that.messages.retrieve(opt);
  // }, that.refreshInterval);
};

NewMessageView.prototype.changeRoom = function(event){
  this.currentRoom = event.currentTarget.dataset.chatroom;
  this.messages.retrieve(this.messages.retrieveOptions());
};

NewMessageView.prototype.postMessage = function(event){
  //var options = this.messages.postOptions();
  var options = {
    data: JSON.stringify({
      'username': location.search.split("=")[1],
      'text': $('.inputField').text(),
      'roomname': 'lobby' //change this!
    }),
    error: function(data){
      console.error("You're fucked ", data);
    }
  };
  options.success = function(data){ events.trigger('message:post', data);};
  this.messages.post(options);
  this.clearInputField();
};

NewMessageView.prototype.changeUser = function(event){
  var name = prompt("You must be logged in to view this page. Please enter a username.");
  location.search = "?username=" + name;
};

NewMessageView.prototype.toggleFriend = function(event){
  var that = this;
  var name = event.currentTarget.innerText.slice(0,-1);
  console.log('name', name);
  if (!that.friends[name]){
    that.friends[name] = true;
    that.populateFriendsList();
    that.messages.retrieve(that.messages.retrieveOptions());
  } else{
    delete that.friends[name];
    that.populateFriendsList();
    that.messages.retrieve(that.messages.retrieveOptions());
  }
};



// render loops though recieved message data
// then delegates tasks for populating parts of the chat room
// such as messages, users, chatrooms
NewMessageView.prototype.render = function(messageData, that){
  messageData = messageData.reverse();
  that.clearMessageList();
  this.clearRoomList();
  _(messageData).each(function(msg){
    var chatroom = that.escapez(msg.roomname);
    var user = that.escapez(msg.username);
    var message = that.escapez(msg.text); //replace
    var time = moment(msg.createdAt).fromNow();
    if(chatroom === that.currentRoom){that.populateMessages(user, message, time);}
    that.populateRoomList(chatroom);
  });
  that.scrollToBottom();
};

// -------------------  DOM WORK

NewMessageView.prototype.scrollToBottom = function(){
  $('.messageBox').scrollTop(9000);
};

NewMessageView.prototype.clearMessageList = function(){
  $('.messageList').html("");
};

NewMessageView.prototype.clearInputField = function(){
  $('.inputField').text('');
};

NewMessageView.prototype.clearFriendsList = function(){
  $('.users').html('');
};

NewMessageView.prototype.clearRoomList = function(){
  $('.chatrooms').html("");
  this.chatrooms = {};
};

NewMessageView.prototype.populateMessages =function(user, message, time){
  var output = $('<li></li>');
  output.append('<em class="user">' + user + ':</em>\t');
  output.append('<span class="message">' + message + '</span>\t');
  output.append('<span class="time">' + time + '</span>');
  if(this.friends[user]){ output.addClass('highlight');}
  $('.messageList').append(output);
};

NewMessageView.prototype.populateFriendsList = function(){
  this.clearFriendsList();
  for (var name in this.friends){
    var output = $('<li>' + this.curtail(name) + '</li>');
    $('.users').append(output);
  }
};

NewMessageView.prototype.populateRoomList = function(chatroom){
  if(this.chatrooms[chatroom]){return;}
  var output = $('<li class="room" data-chatroom="'+ chatroom +'">' + this.curtail(chatroom) + '</li>');
  if(this.currentRoom === chatroom){output.addClass('highlight');}
  $('.chatrooms').append(output);
  this.chatrooms[chatroom] = true;
};
//-------- END DOM WORK

//-------- here be helpers
NewMessageView.prototype.curtail = function(string){
  if(string.length < 12){return string;}
  return(string.slice(0,12) + '..');
};

NewMessageView.prototype.escapez = function(string){
  if(!string){return "";}
  return string.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
};
//-------- end of helpers



var Messages = function(){};

Messages.prototype.retrieve = function(options){
  $.ajax({
    url: urlz,
    type: 'GET',
    data: options.data,
    success: options.success,
    error: options.error
  });
};

Messages.prototype.post = function(options){
   $.ajax({
      url: urlz,
      type: 'POST',
      data: options.data,
      contentType: 'application/json',
      success: options.success,
      error: options.error
   });
};

Messages.prototype.postOptions = function(){
  return 
  };
};

Messages.prototype.retrieveOptions= function(){
    return {
      data: {order: '-createdAt'},
      error: function(data){
        console.error("You're fucked ", data);
      }
    };
};


$('document').ready(function(){
  var messages = new Messages();
  new NewMessageView({messages: messages});

});
