var editor, beautify, drawBrowser; // get reference to extension

function setupEditorBrowser(){
  editor = ace.edit("editor");
  beautify = ace.require("ace/ext/beautify");
  editor.setTheme("ace/theme/chaos");
  editor.$blockScrolling = Infinity;
  var editorHTMLelement = document.getElementById('editor');
  editorHTMLelement.style.fontFamily='Menlo';
  editorHTMLelement.style.fontSize='15px';
  editor.setShowPrintMargin(false);
  editor.getSession().setUseSoftTabs(true);
  editor.getSession().setMode("ace/mode/javascript");

  editor.commands.addCommands([{
    name: 'updateSchedule',
    bindKey: {win: 'Ctrl-S',  mac: 'Ctrl-s'},
    exec: function(editor) {
      var foo = editor.getValue();
      var name = document.getElementById('editingName').innerHTML;
      var time = document.getElementById('editingTime').innerHTML;

      var lookingForFoo = schedule.findFunction(name);
      if(typeof lookingForFoo === 'undefined' && time !== '??'){
        schedule.repeat(new Function(editor.getValue()), time, name );
      } else {
        schedule.updateFunction(name, lookingForFoo);
      }

      blinkEditorElement('editorTitle', 'rgba(255,255,0,0.5)');
      // blinkEditorElement('editor', 'rgb(100,100,0)');
    },
  },
  { name: 'newSchedule',
    bindKey: {win: 'Ctrl-n',  mac: 'Ctrl-n'},
    exec: function(editor) {
      editor.setValue('');
      document.getElementById('editingName').innerHTML='insertName';
      document.getElementById('editingTime').innerHTML='??';
    },
  },
  { name: 'switchToConsole',
    bindKey: {win: 'Ctrl-x',  mac: 'Ctrl-x'},
    exec: function(editor) {
      jqconsole.Focus();
    }
  }]);

  function blinkEditorElement(id, color){
    var editor = document.getElementById(id);
    var oldColor = editor.style.backgroundColor;
    editor.style.transition = 'background-color 0.15s ease-in-out';
    editor.style.backgroundColor = color;
    setTimeout(function(){
      document.getElementById(id).style.backgroundColor = oldColor;
    }, 150);
  }

  drawBrowser = function(){
    var tab='┃ ', browser, width = 30, eol = '┖─╴', foo;
    browser ='╻̊<b>Schedule</b><br>';
    browser+='┃<br>';
    browser+="┣━┱╴<b>Repeats:</b> <br>";

    (foo = function(arr, emptyLength){
      var icon, name, select, cancel;
      if(arr.length === emptyLength) browser += tab + eol + '<i>empty</i>' + '<br>';
      for (var i = emptyLength; i < arr.length; i++) {
        icon = i === arr.length-1 ? eol : '┠─╴';
        name = arr[i].name;
        select = '<span onclick=sound.schedule.getFunction(\''+ name +'\')>' + utilities.rightPad(name, width-10, ' ') + '</span>';
        select += utilities.rightPad('('+arr[i].time+')', 10);
        cancel = '<span onclick=sound.schedule.clear(\''+ name +'\')>x</span>';
        browser += tab + icon + select + cancel + '<br>';
      }
    })(sound.schedule.getRepeatArr(), 3);

    browser+='┃<br>';
    browser+="┗━┱╴<b>Once:</b> <br>";
    tab='  ';

    foo(sound.schedule.getOnceArr(), 0);

    document.getElementById('scheduleBrowser').innerHTML = browser;
  }
}
