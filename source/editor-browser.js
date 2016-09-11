var editor, beautify, drawBrowser; // get reference to extension

function setupEditorBrowser(){
  editor = ace.edit("editor");
  beautify = ace.require("ace/ext/beautify");
  editor.setTheme("ace/theme/chaos");
  editor.$blockScrolling = Infinity;
  var editorHTMLelement = document.getElementById('editor'),
      editingNameHTMLel = document.getElementById('editingName'),
      editingTimeHTMLel = document.getElementById('editingTime');
  editorHTMLelement.style.fontFamily='Menlo';
  editorHTMLelement.style.fontSize='15px';
  editorHTMLelement.style.background = 'rgba(20,20,20, 0.5)';
  editor.setShowPrintMargin(false);
  editor.getSession().setUseSoftTabs(true);
  editor.getSession().setMode("ace/mode/javascript");

  editor.commands.addCommands([{
    name: 'updateSchedule',
    bindKey: {win: 'Ctrl-S',  mac: 'Ctrl-s'},
    exec: function(editor) {
      var foo = editor.getValue(),
          name = editingNameHTMLel.innerHTML,
          time = editingTimeHTMLel.innerHTML;

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
      editingNameHTMLel.innerHTML='insertName';
      editingTimeHTMLel.innerHTML='??';
      drawBrowser();
      blinkEditorElement('editor', 'rgb(100,100,0)');
    },
  },
  { name: 'deleteSchedule',
    bindKey: {win: 'Ctrl-d',  mac: 'Ctrl-d'},
    exec: function(editor) {
      schedule.clear(editingNameHTMLel.innerHTML);
    },
  },
  { name: 'switchToConsole',
    bindKey: {win: 'Ctrl-x',  mac: 'Ctrl-x'},
    exec: function(editor) {
      jqconsole.Focus();
    }
  },
  { name: 'pauseSchedule',
    bindKey: {win: 'Ctrl-p',  mac: 'Ctrl-p'},
    exec: function(editor) {
      schedule.togglePause(editingNameHTMLel.innerHTML);
    }
  }]);

  for (var i = 1; i < 10; i++) {
    (function(i){
      editor.commands.addCommand({
        name: 'selectSchedule'+i,
        bindKey: {win: 'Ctrl-'+i,  mac: 'Ctrl-'+i},
        exec: function(editor) {
          if(i-1 < schedule.getLengthOfRepeatArr()){
            schedule.getFunctionByIndex(i-1);
            drawBrowser();
            blinkEditorElement('editor', 'rgb(100,100,0)');
          }
        },
      })
    })(i);
  }

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
    var tab='┃ ', browser, width = Math.floor(window.innerWidth / 30), eol = '┖─╴';
    browser ='╻̊<b>Schedule</b><br>';
    browser+='┃<br>';
    browser+="┣━┱╴<b>Repeats:</b> <br>";

    (foo = function(arr, emptyLength){
      var icon, name, select, cancel, pause, pcolor, foo, nr, fontColor;
      if(arr.length === emptyLength) browser += tab + eol + '<i>0. empty</i><br>';
      for (var i = emptyLength; i < arr.length; i++) {
        icon = i === arr.length-1 ? eol : '┠─╴';
        nr = '<i>' + (i+1 - emptyLength) + '. </i>'; // nr for select schedule shortcut
        name = arr[i].name;
        select = '<span onclick=sound.schedule.getFunction(\''+ name +'\')>' + utilities.rightPad(name, width-10, ' ') + '</span>';
        select += utilities.rightPad('('+arr[i].time+')', 10);
        cancel = '<span onclick=sound.schedule.clear(\''+ name +'\')>x</span>';
        if(emptyLength !== 0){ // dont show pause button on once tasks
          pcolor = arr[i].paused ? 'red' : 'green';
          pause = '<span onclick=sound.schedule.togglePause(\''+ name +'\') ';
          pause +='style=\"color:'+ pcolor +';\">▶</span> ';
        } else {
          pause = "  ";
        }
        // give that classic browser stripe look
        bcolor = i % 2 === 0 ? 'rgba(100, 100, 100, 0.5)' : 'rgba(100, 100, 100, 0.25)';
        fontColor = name === editingNameHTMLel.innerHTML ? 'yellow' : 'white';
        bcolor = '<span style=\"background:'+ bcolor +'; color:'+ fontColor +'\">';

        // compose dat line
        browser += tab + icon + bcolor + nr + select + pause + cancel + '</span><br>';
      }
    })(sound.schedule.getRepeatArr(), 3);

    browser+='┃<br>';
    browser+="┗━┱╴<b>Once:</b><br>";
    tab='  ';

    foo(sound.schedule.getOnceArr(), 0);

    document.getElementById('scheduleBrowser').innerHTML = browser;
  }
}
