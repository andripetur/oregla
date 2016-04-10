// (function(){
  // fluid.registerNamespace("wSocket");

  var socket = null;
  var msgTypeActions = {};
  var isopen = false;
  var timeoutIdToReconnect = null;
  var lastUserToPost = '';

  function connectSocket() {

      msgTypeActions = {
        start_sequence : sound.startSequence,
        stop_sequence : sound.stopSequence,
      }

     socket = new WebSocket("ws://127.0.0.1:9000");
     socket.binaryType = "arraybuffer";

     socket.onopen = function() {
        console.log("Connected!");
        isopen = true;
     }

     socket.onmessage = function(e) {
        if (typeof e.data == "string") {
          var parsedObject = JSON.parse(e.data);

          if( parsedObject.type === 'message' ) {
            postMessage( parsedObject, 'green');
            console.log("Text message received: " + e.data);
          } else {
            msgTypeActions[parsedObject.type](parsedObject);
          }

        }
     }

     socket.onclose = function(e) {
        console.log("Connection closed. Trying to reconnect in 10 seconds. Cancel with: cancelRecon()");
        socket = null;
        isopen = false;
        timeoutIdToReconnect = setTimeout(connectSocket, 1000);
     }
  };

  window.onload = connectSocket;

  function cancelRecon(){
    window.clearTimeout(timeoutIdToReconnect);
    console.log("Reconnect cancelled.")
  }

  function sendText(_text) {
    var text = _text || "Hello, world!";
     if (isopen) {
        socket.send(text);
        console.log("Text message sent.");
     } else {
        console.log("Connection not opened.")
     }
  };

  function postMessage(msg,color){
   var mWindow = document.getElementById('splash');
   var line = '<br><font color='+color+'>';

   if(msg.userId != lastUserToPost) {
      line += msg.userId + ':';
      lastUserToPost = msg.userId;
   } else {
     var userToPostSpace = '';
     for (var i = 0; i < lastUserToPost.length+1; i++) {
       userToPostSpace+=' ';
     }
     line += userToPostSpace;
   }

   line += msg.content + '</font>';
   mWindow.innerHTML += line;
  }

  function sendMessage() {
    if(isopen){
     var msgContent = document.forms["message"]["message"].value;
     document.forms["message"]["message"].value = '';
     var id = document.forms["message"]["userId"].value;

     var msg = {
       userId: id,
       content: msgContent,
       type: 'message'
     }

    //  postMessage( msg, 'blue');

     var js = JSON.stringify(msg);
     sendText(js);
   } else {
     var msg = {
       userId: 'error',
       content: 'you are not connected'
     }
     postMessage( msg, 'red');
   }
  }
// }();)
