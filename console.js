
// figure out a good way to do suggestion list
var suggestions = {
  drum: {kick: 0,
         snare:0,
         tom:0,
         hihat:0,
         perc:0,
       },
  modifySequence: 0,
  generateNewMelodie: 0,
}

propStartingWith = function (obj, prefix) {
  var res = [];
  for(var m in obj) {
    if(m.indexOf(prefix) === 0) {
      res.push(m);
    }
  }
  return res;
};

function initConsole() {
  // Creating the console.
  var header = 'Welcome to (ó)regla\n'+
               'lets compose! \n';
  window.jqconsole = $('#console').jqconsole(header, '>>> ');

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
        jqconsole.Write('ERROR: ' + e.message + '\n');
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

  jqconsole.SetKeyPressHandler(function(e) {
    var text = jqconsole.GetPromptText() + String.fromCharCode(e.which);
    var dot = null;
    // We'll only suggest things on the window object.
    if (dot = text.match(/\./)) {
      console.log(text.slice(dot.index+1)); // behind dot

      console.log(text.slice(0, dot.index)); // in front of dot

      return;
    }

    var props = propStartingWith(suggestions, text); // or your namespace
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
    if (e.which === 9 && $('.suggest div').length) {
      jqconsole.SetPromptText($('.suggest div').first().text());
      return false;
    }
  });
  // Initiate the first prompt.
  handler();
}
