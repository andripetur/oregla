var editor, drawBrowser; // get reference to extension

function Constant(name, initValue){ // make declaring constants easier from the editor
  if(typeof window[name] === 'undefined') window[name] = initValue;
}

function setupEditorBrowser(){
  var langTools = ace.require("ace/ext/language_tools");
  editor = ace.edit("editor");
  editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true
  });
  editor.setTheme("ace/theme/chaos");
  editor.$blockScrolling = Infinity;
  var editorHTMLelement = document.getElementById('editor'),
      editingNameHTMLel = document.getElementById('editingName'),
      editingTimeHTMLel = document.getElementById('editingTime');
  editorHTMLelement.style.fontFamily='Menlo';
  editorHTMLelement.style.fontSize='15px';
  editorHTMLelement.style.background='rgba(20,20,20, 0.5)';
  editor.setShowPrintMargin(false);
  editor.getSession().setUseSoftTabs(true);
  editor.getSession().setTabSize(2);
  editor.getSession().setMode("ace/mode/javascript");

  //TODO implement this autocomplete+fuzzy matching in console too(I think it's neater).
  var autoCompleteObject = function(obj, flatten) {
    var res = {}, objContent, value;

    for (var key in obj) {
      value = obj[key];
      if( value.typeName !== "flock.synth" ){ // ignore flocking synths, they are to huge

        if(typeof value === "object"){ // strip the data from the objects.
          if(value instanceof Array){
            res[key] = "[]";
          } else if( typeof value === "number"){
            res[key] = "number";
          } else if( typeof value === "boolean"){
            res[key] = "boolean";
          } else {
            objContent = autoCompleteObject(value, flatten);
            if(flatten){
              res[key] = "object";
              for(var x in objContent) {
                res[key + '.' + x] = objContent[x];
              }
            } else {
              res[key] = objContent;
            }
          }
        } else if( typeof value === "function") {
          res[key] = "function()";
        } else {
          res[key] = value;
        }
      }
    }

    return res;
  };

  var getAllKeys = function(obj){
    var res = [];
    for ( var i in obj ) res.push(i);
    return res;
  };

  var getKeysStartingWith = function(obj, pref){
    var res = [];
    for ( var i in obj ) if(i.includes(pref)) res.push(i.replace(pref, ""));
    return res;
  }

  var oreglaList = autoCompleteObject(sound, true);
  var oreglaKeyWordList = getAllKeys(oreglaList);

  var oreglaCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        var keyWordList,
            index = editor.session.getTokenAt(pos.row, pos.column).index,
            currLine = editor.session.getTokens(pos.row);

        if(currLine.length > 2){ // if it is possible that we have entered a namespace
          var startPoint = index,
              subLine, pre = "";

          while(typeof currLine[startPoint-1] !== "undefined" &&
                (currLine[startPoint-1].type === "punctuation.operator" ||
                currLine[startPoint-1].type === "identifier" )){
            startPoint--; // find startpoint
          }

          subLine = currLine.slice(startPoint, index); // extract our line
          for (var i = 0; i < line.length; i++) pre += subLine[i].value; // compose string

          keyWordList = getKeysStartingWith(oreglaList, pre); // get keys in that object
        } else {
          keyWordList = oreglaKeyWordList;
        }

        callback(null, keyWordList.map(function(word) {
          return {
            caption: word,
            value: word,
            meta: "oregla"
          };
        }));
    }
  };

  langTools.addCompleter(oreglaCompleter);

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
  { name: 'restoreSchedule',
    bindKey: {win: 'Ctrl-r',  mac: 'Ctrl-r'},
    exec: function(editor) {
      editor.commands.byName["updateSchedule"].exec(editor);
      schedule.restore(editingNameHTMLel.innerHTML);
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
    var tab='┃ ', browser, width = Math.ceil(window.innerWidth / 41), eol = '┖─╴';
    browser ='╻̊<b>Scheduled tasks:</b><br>';
    (addTitle = function(title, last){
      browser+='┃<br>';
      browser+= last ? '┗━┱╴' : '┣━┱╴';
      browser+= '<b>'+title+':</b><br>';
      if(last) tab='  ';
    })('Repeats', false);

    (drawArr = function(arr, emptyLength, f){
      var tree, paddedname, name, select, cancel, pause, restore, pcolor, foo, nr, fontColor;

      if(arr.length === emptyLength) {
        browser += tab + eol + '<i>0. empty</i><br>';
      }

      for (var i = emptyLength; i < arr.length; i++) {
        tree = i === arr.length-1 ? eol : '┠─╴';
        nr = '<i>' + (i+1 - emptyLength) + '. </i>'; // nr for select schedule shortcut
        name = arr[i].name;
        paddedname = utilities.rightPad(name, Math.floor(width*0.2), ' ');
        select = '<span onclick=sound.schedule.getFunction(\''+ name +'\')>' + paddedname + '</span>';
        select += utilities.rightPad('('+arr[i].time+')', Math.floor(width*0.4) - paddedname.length + 5);
        cancel = '<span onclick=sound.schedule.clear(\''+ name +'\')>x</span>';
        restore = '<span onclick=sound.schedule.restore(\''+ name +'\') style=\"color:orange;\">▲</span> ';

        if(emptyLength !== 0){ // only show pause button on repeat tasks
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
        if(typeof f !== "undefined") pause = restore;
        browser += tab + tree + bcolor + nr + select + pause + cancel + '</span><br>';
      }
    })(sound.schedule.getRepeatArr(), 3);

    addTitle('Once', sound.schedule.getFailedArr().length === 0);
    drawArr(sound.schedule.getOnceArr(), 0);

    if(sound.schedule.getFailedArr().length !== 0) {
      addTitle('Failed', true);
      drawArr(sound.schedule.getFailedArr(), 0, 'f');
    }

    document.getElementById('scheduleBrowser').innerHTML = browser;
  }
}
