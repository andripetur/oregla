var initConsole = null;

(function(){
  propStartingWith = function (obj, prefix) {
    var res = [];
    for(var m in obj) {
      if(m.indexOf(prefix) === 0) {
        res.push(m);
      }
    }
    return res;
  };

  initConsole = function() {
    // Creating the console.
    var header = 'Welcome to (ó)regla\n';
    window.jqconsole = $('#console').jqconsole(header, '>>> ');

    // load history from cookies
    if(document.cookie !== ""){
        try{
         jqconsole.history = JSON.parse(document.cookie);
         jqconsole.history_index = jqconsole.history.length;
       } catch (e) {
         document.cookie = ""; 
       }
     }

    // Abort prompt on Ctrl+Z.
    jqconsole.RegisterShortcut('Z', function() {
      jqconsole.AbortPrompt();
      handler();
    });
    // Move to line start Ctrl+A.
    jqconsole.RegisterShortcut('A', function() {
      jqconsole.MoveToStart();
      handler();
    });
    // Move to line end Ctrl+E.
    jqconsole.RegisterShortcut('E', function() {
      jqconsole.MoveToEnd();
      handler();
    });
    jqconsole.RegisterMatching('{', '}', 'brace');
    jqconsole.RegisterMatching('(', ')', 'paran');
    jqconsole.RegisterMatching('[', ']', 'bracket');
    // Handle a command.
    var handler = function(command) {
      if (command) {
        try {
          jqconsole.Write('==> ' + window.eval(command) + '\n');
        } catch (e) {
          try { // if it fails check first if it will run on sound object
            jqconsole.Write('==> ' + window.eval('sound.'+command) + '\n');
            // TODO maybe add regex to handle if we are trying to compile
            // something else than single function.
          } catch (ee) {
            jqconsole.Write('ERROR: ' + e.message + '\n');
          }
        }
        document.cookie = JSON.stringify(jqconsole.history);
      }
      jqconsole.Prompt(true, handler, function(command) {
        // Continue line if can't compile the command.
        try {
          Function(command);
        } catch (e) {
          if (/[\[\{\(]$/.test(command)) {
            return 1;
          } else {
            return 0;
          }
        }
        return false;
      });
    };

    function canIshowHelp(beingTypedOrSuggested){
      if( typeof suggestionObject === "undefined" ) return;
      var obj = suggestionObject[beingTypedOrSuggested];
      if (typeof obj !== "undefined") {
        if (typeof obj.help !== "undefined") {
          fillHelp(obj.help);
        }
      }
    }

    function fillHelp(hlp){
      $('#help-title').text(hlp.title);
      $('#help-content').html('> '+hlp.content);
    }

    var isDotted = false;
    var isParenthesisd = false
    var suggestionObject = null;

    jqconsole.SetKeyPressHandler(function(e) {
      var text = "sound." + jqconsole.GetPromptText() + String.fromCharCode(e.which);
      var dot = null;
      isDotted = false;
      isParenthesisd = false;
      suggestionObject = window;

       // TODO if there are paranthesis, begin suggestions from start, so add input to functions)
      if (text.match(/[\(\)\{\}\=]/)) { // bail on [], (), and =
        isParenthesisd = true;
        return -1;
      }

      if (/\./.test(text)) { // to suggest nested objects
        var objectNames = text.match(/[a-zA-Z\d]+/g);
        var lastDotIndex = text.lastIndexOf('.');
        isDotted = true;
        var tempText = text.slice(lastDotIndex+1); // behind dot

        var suggString = "window";
        for (var i = 0; i < objectNames.length-1; i++) {
          suggString+= '["' + objectNames[i] + '"]';
          if(/\b\d+/g.test(objectNames[i+1])){ // in case of array
            i++;
            suggString += '["' + objectNames[i] + '"]';
          }
        }
        suggestionObject = eval(suggString);
        text = tempText;

        canIshowHelp(objectNames[objectNames.length-1]);
      }

      var props = propStartingWith(suggestionObject, text); // or your namespace
      if (props.length) {
        if (!$('.suggest').length) {
          $('<div/>').addClass('suggest').appendTo($('.jqconsole'));
        }
        $('.suggest').empty().show();
        props.forEach(function(prop) {
          $('.suggest').append('<div>' + prop + '</div>');
        });
        var pos = $('.jqconsole-cursor').offset();
        pos.left += 20;
        $('.suggest').offset(pos);
      } else {
        $('.suggest').hide();
      }
    });

    jqconsole.SetControlKeyHandler(function(e) {
      $('.suggest').hide();
      if(e.which === 9 && $('.suggest div').length) {
        var suggestion = $('.suggest div').first().text();

        if( isDotted ){
          var text = $('.jqconsole-prompt-text').text();
          jqconsole.SetPromptText(
            text.slice(0, text.lastIndexOf('.') + 1) // erase everything after the last '.'
            + suggestion // append suggestion
          );

        } else {
          jqconsole.SetPromptText(suggestion);
        }
        canIshowHelp(suggestion);

        return false;
      }
    });
    // Initiate the first prompt.
    handler();
  }
})();
