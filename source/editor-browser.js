var editor, beautify, drawBrowser; // get reference to extension

function setupEditorBrowser(){
  editor = ace.edit("editor");
  beautify = ace.require("ace/ext/beautify");
  editor.setTheme("ace/theme/chaos");
  editor.$blockScrolling = Infinity;
  document.getElementById('editor').style.fontFamily='Menlo';
  document.getElementById('editor').style.fontSize='15px';
  editor.setShowPrintMargin(false);
  editor.getSession().setUseSoftTabs(true);
  editor.getSession().setMode("ace/mode/javascript");

  editor.commands.addCommand({
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

      blinkEditorTitle();
    },
    readOnly: true // false if this command should not apply in readOnly mode
  });

  editor.commands.addCommand({
    name: 'newSchedule',
    bindKey: {win: 'Ctrl-n',  mac: 'Ctrl-n'},
    exec: function(editor) {
      editor.setValue('');
      document.getElementById('editingName').innerHTML='insertName';
      document.getElementById('editingTime').innerHTML='??';
    },
    readOnly: true // false if this command should not apply in readOnly mode
  });

  function blinkEditorTitle(){
    // blink editor title
    document.getElementById('editorTitle').style.backgroundColor = 'rgba(255,255,0,0.5)';
    setTimeout(function(){
      document.getElementById('editorTitle').style.backgroundColor = 'rgba(0,0,0,0)';
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
