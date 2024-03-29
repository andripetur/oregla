var timeUnitToSeconds;

(function(){
  var tempo = def.tempo;
  var divisor = {};
  var signature = def.signature;

  for (var i = 0.25; i < 64; i*=2){
    divisor[(i*4)+'nd'] = i*1.5;
    divisor[(i*4)+'n'] = i;
    divisor[(i*4)+'nt'] = (i*2)/3;
  }

  var getBpm = function(bpm,smallestDivisor){
    return (60 / bpm) / divisor[smallestDivisor];
  }

  timeUnitToSeconds = function(unit){
    if (unit.includes('n')) {
      return getBpm(tempo, unit);
    } else if (unit.includes('b')) { // convert bars to seconds
      var barLength = getBpm(tempo, signature.lower) * signature.upper,
          nrOfBars = parseFloat(unit.replace('b', ''));
      return barLength * nrOfBars;
    } else if(unit.includes('s') && !unit.includes('m')) {
      return parseFloat(unit.replace('s', ''));
    } else if(unit.includes('ms')) {
      return parseFloat(unit.replace('ms', ''))/1000;
    } else if(unit.includes('m') && !unit.includes('s')) {
      return parseFloat(unit.replace('s', ''))*60;
    }
  }

  var timeUnitToMilliseconds = function(unit){
    return timeUnitToSeconds(unit) * 1000;
  }

  var clock = flock.scheduler.async();

  var changeTempo = false;
  sound.setTempo = function(t) {
    if(t !== tempo){
      tempo = t;
      changeTempo = true;
    }
  }

  var tempoChangeListener = function(){
    if(changeTempo) {
      changeTempo = false;
      clock.clearAll();
      clock.clearAll(); // <- called twice to make sure that everything gets cleared
      scheduleSequences(tempo);
    }
    sound.schedule.do();
  }

  var scheduleSequences = function(bpm) {
    clock.repeat(getBpm(tempo, '128n'),tempoChangeListener);
  }

  var repeatArr = [],
      onceArr = [],
      failedArr = [];

  function Task(foo,t,n){
    this.id = utilities.getTime();
    this.name = n || utilities.getNextName();
    this.function = foo;
    this.time = t;
    this.paused = false;
    if (typeof drawBrowser !== "undefined") setTimeout(drawBrowser, 10);
  };

  sound.schedule = {
    repeat: function(foo, t, n){ // id is a bad confusing name, because it changes every do()
      repeatArr.push( new Task(...arguments) );
      return "Scheduled a new task: " + repeatArr[repeatArr.length-1].name;
    },
    once: function(foo, t, n){
      onceArr.push( new Task(...arguments) );
      return "Scheduled a new task: " + onceArr[repeatArr.length-1].name;
    },
    failed: function(task, comesFrom){
      task.belongs = comesFrom;
      failedArr.push(task);
    },

    clear: function(name){
      var cntr = 0;
      (seekAndDestroy = function(arr){
        for (var i = 0; i < arr.length; i++) {
          if(arr[i].name === name){
            arr.splice(i--,1);
            cntr++;
          }
        }
      })(onceArr);

      seekAndDestroy(repeatArr);
      seekAndDestroy(failedArr);

      if(document.getElementById('editingName').innerHTML === name){ // clear editor
        editor.commands.byName.newSchedule.exec(editor);
      }
      if (typeof drawBrowser !== "undefined") drawBrowser();

      if(cntr > 0){
        return "Cleared "+ cntr +" scheduled events with name: " + name + ".";
      } else {
        return "No events found with name: " + name + ".";
      }
    },

    clearAll: function(){
      repeatArr.splice(nrOfSystemRepeats,repeatArr.length); // first three are system repeats
      onceArr = [];
      failedArr = [];
      return "Schedule cleared!"
    },

    restore: function(name){
      for (var i = 0; i < failedArr.length; i++) {
        if(failedArr[i].name === name) {
          var f = failedArr.splice(i--,1)[0];
          if(f.belongs === onceArr) f.id = utilities.getTime(); // once gets new time.
          f.belongs.push(f);
        }
      }
      if (typeof drawBrowser !== "undefined") drawBrowser();
    },

    show: function(){
      if ( repeatArr.length === nrOfSystemRepeats && onceArr.length < 1 && failedArr.length < 1) {
        return "No scheduled events to show."
      } else {
        (showArr = function(arr, startIndex, msg){
          if(arr.length > nrOfSystemRepeats) {
            print(msg);
            for (var i = startIndex; i < arr.length; i++) {
              print('    '+arr[i].name);
            }
          }
        })(repeatArr, nrOfSystemRepeats, 'Repeats scheduled:');
        showArr(onceArr, 0, 'Once scheduled:');
        showArr(failedArr, 0, 'Failed tasks:');
      }
    },

    getLengthOfRepeatArr: function(){
      return repeatArr.length - nrOfSystemRepeats;
    },

    getFunction: function(name, f){ // returns the function body of a task
      var foo = f || this.findFunction(name);
      if(typeof foo !== 'undefined'){
        var fooStr = foo.function.toString();
        var body = fooStr.substring(fooStr.indexOf("{") + 1, fooStr.lastIndexOf("}"));
        document.getElementById('editingName').innerHTML = name;
        document.getElementById('editingTime').innerHTML = foo.time;
        editor.setValue(js_beautify(body));
      }
    },

    getFunctionByIndex: function(i){
      i += nrOfSystemRepeats;
      return this.getFunction(repeatArr[i].name, repeatArr[i].foo);
    },

    updateFunction: function(name, f){
      var foo = f || this.findFunction(name);
      if(typeof foo !== 'undefined') {
        foo.function = new Function(editor.getValue());
        foo.time = document.getElementById('editingTime').innerHTML; // updateTime
      }
    },

    togglePause: function(name, f){
      var foo = f || this.findFunction(name);
      if(typeof foo !== 'undefined') foo.paused = !foo.paused;
      if (typeof drawBrowser !== "undefined") drawBrowser();
    },

    findFunction: function(name){
      var bothArr = [ ...repeatArr, ...onceArr, ...failedArr ];
      for (var i = 0; i < bothArr.length; i++) if(bothArr[i].name === name) return bothArr[i];
    },

    getRepeatArr: function(){ return repeatArr; },
    getOnceArr:   function(){ return onceArr; },
    getFailedArr: function(){ return failedArr; },

    do: function(){
      var currentTime = utilities.getTime();

      for (var i = 0; i < onceArr.length; i++) {
        if((currentTime - onceArr[i].id) >= timeUnitToMilliseconds(onceArr[i].time)){
          try {
            onceArr[i].function();
          } catch (e) {
            print('Repeat function \"'+onceArr[i].name+'\" failed with error: ');
            print('    '+e);
            schedule.failed(onceArr.splice(i--,1)[0], onceArr);  // move to failed
          }
          onceArr.splice(i--,1); // remove from schedule and do this index again
          if (typeof drawBrowser !== "undefined") drawBrowser();
        }
      }

      for (var i = 0; i < repeatArr.length; i++) {
        if((currentTime - repeatArr[i].id) >= timeUnitToMilliseconds(repeatArr[i].time)){
          try {
            if(!repeatArr[i].paused) repeatArr[i].function();
            repeatArr[i].id = currentTime;
          } catch (e) {
            print('Repeat function \"'+repeatArr[i].name+'\" failed with error: ');
            print('    '+e);
            print('Scheduling cancelled.');
            schedule.failed(repeatArr.splice(i--,1)[0], repeatArr); //  move to failed and do this index again
            if (typeof drawBrowser !== "undefined") drawBrowser();
          }
        }
      }

    }
  }

  scheduleSequences();
  var nrOfSystemRepeats = 3;
  sound.schedule.repeat(sound.drums.do, '8n', 'drums_schedule');
  sound.schedule.repeat(Instrument.do, '8n', 'instrument_schedule');
  sound.schedule.repeat(lpseq.do, '8n', 'launchpad_schedule');
})();
