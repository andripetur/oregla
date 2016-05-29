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
    var header = 'Welcome to (ó)regla. Start typing for suggestions.\nPress ctrl+h for info on the console.\nOr take a look at the ';
    window.jqconsole = $('#console').jqconsole(header, '>>> ');
    $('.jqconsole-header').append( '<a class=docLink href=documentation.html target=_blank>Documentation</a>\n');

    // load history from cookies
    if(document.cookie !== ""){
        try{
         jqconsole.history = JSON.parse(document.cookie);
         jqconsole.history_index = jqconsole.history.length;
       } catch (e) { // if the json craps out we just nuke it.
         document.cookie = "";
       }
     }

     var shortcuts = {};

    shortcuts['ctrl+z'] = "Abort prompt."
    jqconsole.RegisterShortcut('Z', function() {
      jqconsole.AbortPrompt();
      handler();
      $('.suggest').hide();
    });
    shortcuts['ctrl+a'] = "Move to line start."
    jqconsole.RegisterShortcut('A', function() {
      jqconsole.MoveToStart();
      handler();
      $('.suggest').hide();
    });
    shortcuts['ctrl+a'] = "Move to line end."
    jqconsole.RegisterShortcut('E', function() {
      jqconsole.MoveToEnd();
      handler();
      $('.suggest').hide();
    });

    shortcuts['ctrl+w'] = "Move selected suggestion up."
    jqconsole.RegisterShortcut('w', function() {
      selectedSuggestion--;
      if(selectedSuggestion < 0) selectedSuggestion = 0;
      handler();
      $('.suggest').show();
      highlightSelectedSuggestion();
    });

    shortcuts['ctrl+w'] = "Move selected suggestion down."
    jqconsole.RegisterShortcut('s', function() { // move suggestionDown
      selectedSuggestion++;
      if(selectedSuggestion > $('.suggest div').size()) selectedSuggestion = 0;
      handler();
      $('.suggest').show();
      highlightSelectedSuggestion();
    });

    shortcuts['tab'] = "Select suggestion."
    shortcuts['ctrl+enter'] = "Select suggestion."
    jqconsole.RegisterShortcut(13, function(){
      jqconsole.custom_control_key_handler({ which: 9 }); // call ctrl key handler as tab has been entered
    });

    shortcuts['ctrl+d'] = "Open the docLink in helpwindow in a new tab.";
    jqconsole.RegisterShortcut('D', function() {
      if($('#help-content a' ).length > 0) {
        var hash = $('#help-content a' )[0].hash;
        window.open('documentation.html'+hash);
      }
    });

    shortcuts['ctrl+h'] = "Show shortcut list."
    jqconsole.RegisterShortcut('H', function() {
      jqconsole.Write('\n');
      for (var key in shortcuts) {
        jqconsole.Write('    '+utilities.rightPad(key,10) + ': ' + shortcuts[key] + '\n');
      }
      jqconsole.Write('\n');
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
      if( typeof hlp.docLink !== "undefined"){ // add link to documentation
        $('#help-content').append( '</br><a class=docLink href=\"'+hlp.docLink+'\" target=_blank>DocLink</a>');
      }
    }

    var highlightSelectedSuggestion = function() {
      $('.suggest div').each(function( index ) {
        if(index == selectedSuggestion){
           $( this ).addClass('sel-sugg');
         } else {
           $( this ).removeClass('sel-sugg');
         }
      });
    }

    var isDotted = false;
    var isParenthesisd = false
    var suggestionObject = null;
    var selectedSuggestion = 0;

    jqconsole.SetKeyPressHandler(function(e) {
      var text = "sound." + jqconsole.GetPromptText() + String.fromCharCode(e.which);
      if( String.fromCharCode(e.which) === '.') return; // start typing before suggesting

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
      var selectedSuggestion = 0;
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
      if(e.which !== 17) $('.suggest').hide(); // hide suggestions on non ctrl events

      if(e.which === 9 && $('.suggest div').length) { // tab or ctr+enter
        var suggestion = $('.suggest div').eq(selectedSuggestion).text();

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
