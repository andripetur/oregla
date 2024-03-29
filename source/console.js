var initConsole = null;
var initSuggestions = null;

(function(){
  // some keywords will not be suggested, but are still reachable via the console
  var suggestionBlacklist = [
    'trigger', 'do', 'seqType', // Sequencer
    'calculate', 'buffer', // Chaos
    'synth', 'isPlaying', 'detune', 'offset', // Instrument class
    'duration' // Drum class
  ];

  var propStartingWith = function (obj, prefix) {
    var res = [];
    for(var m in obj) {
      if(m.indexOf(prefix) === 0 && !suggestionBlacklist.includes(m)) {
        res.push(m);
      }
    }
    return res;
  };

  var originalWindow = [];
  initSuggestions = function() {
    // copy a reference for every object in sound to window
    for (var foo in sound) window[foo] = sound[foo];

    // save originalWindow
    for (var foo in window) originalWindow.push(foo);
  }

  function somethingAddedToWindow(){
    var newWindow = [];
    for (var foo in window) newWindow.push(foo);

    for (var i = 0; i < originalWindow.length; i++) {
      newWindow.splice(newWindow.indexOf(originalWindow[i]), 1);
    }

    for (var i = 0; i < newWindow.length; i++) { // add new things to sound. so it can be suggested
      originalWindow.push(newWindow[i]);
      sound[newWindow[i]] = window[newWindow[i]];
    }
    // console.log(newWindow)
  }

  initConsole = function() {
    // Creating the console.
    var header = 'Welcome to (ó)regla. Start typing for suggestions.\nPress ctrl+h for info on the console.\nOr take a look at the ';
    window.jqconsole = $('#console').jqconsole(header, '>>> ');
    $('.jqconsole-header').append( '<a class=docLink href=documentation.html target=_blank>Documentation</a>\n');

    // load history from localStorage
    if(typeof localStorage.history !== "undefined"){
       jqconsole.history = localStorage.history.split(';');
       jqconsole.history_index = jqconsole.history.length;
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

    shortcuts['ctrl+s'] = "Move selected suggestion down."
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

    shortcuts['ctrl+x'] = "Switch beetween schedule editor and console.";
    jqconsole.RegisterShortcut('x', function() {
      editor.focus();
    });

    shortcuts['ctrl+h'] = "Show shortcut list."
    jqconsole.RegisterShortcut('H', function() {
      jqconsole.Write('\n');
      for (var key in shortcuts) {
        jqconsole.Write('    '+utilities.rightPad(key,10) + ': ' + shortcuts[key] + '\n');
      }
      jqconsole.Write('\n');
    });

    // create a print function
    var isPrinting = false;
    window.print = function(str) {
      var string = str || "";
      isPrinting = true;
      jqconsole.Write('==> ' + string + '\n');
    }

    jqconsole.RegisterMatching('{', '}', 'brace');
    jqconsole.RegisterMatching('(', ')', 'paran');
    jqconsole.RegisterMatching('[', ']', 'bracket');
    // Handle a command.
    var handler = function(command) {
      if (command) {
        try {
          var returns = window.eval(command);
          if(!isPrinting) {
            jqconsole.Write('==> ' + returns + '\n');
          } else {
            isPrinting = false;
          }
        } catch (e) {
          isPrinting = false;
          jqconsole.Write('ERROR: ' + e.message + '\n');
        }
        localStorage.history = jqconsole.history.join(';');
        if(/var|=|function/.test(command)){
          somethingAddedToWindow();
        }
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
      if( typeof hlp.type !== "undefined") $('#help-title').append(" [" + hlp.type +"]");
      $('#help-content').html('> '+hlp.content);
      if( typeof hlp.options !== "undefined") {
        $('#help-options').text( 'Options object: ');
        hlp.options.map(function(el){
          $('#help-options-cont').append( el[0] + ': '+ el[1] + '</br>');
        });
      } else {
        $('#help-options').text('');
        $('#help-options-cont').text('');
      }
      if( typeof hlp.docLink !== "undefined"){ // add link to documentation
        $('#help-content').append( '</br><a class=docLink href=\"'+hlp.docLink+'\" target=_blank>DocLink</a>');
      }
    }

    function highlightSelectedSuggestion() {
      $('.suggest div').each(function( index ) {
        if(index == selectedSuggestion){
           $( this ).addClass('sel-sugg');
         } else {
           $( this ).removeClass('sel-sugg');
         }
      });
    }

    var isDotted = false;
    var isParenthesisd = false;
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
      if (text.match(/[\s\(\)\{\}\=]/)) { // bail on [], (), = and whitespace
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
      selectedSuggestion = 0;
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
