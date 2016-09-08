var Instrument = null; // make accesible to help
var timeUnitToSeconds;
(function () {
  "use strict";

  function Scale() {
    this.semitones = utilities.argumentsToArray(arguments);
    this.absolute = this.semitonesToAbsolute(this.semitones);
  }

  Scale.prototype.semitonesToAbsolute = function( semitonesArr ){
    return semitonesArr.map(
      function(el,indx,arr){
        var temp = arr.slice(0, indx);
        temp.push(0);
        return temp.reduce(function(a,b){ return a+b; })
    });
  }

  Scale.prototype.lockTo = function(n, baseNote){
    if(this.absolute.length === 0) return n;
    return this.absolute.indexOf(n) >= 0 ? n : n+1;
  }

  sound.scales = {
    ionian: new Scale(2,2,1,2,2,2,1),
    dorian: new Scale(2,1,2,2,2,1,2),
    phrygian: new Scale(1,2,2,2,1,2,2),
    lydian: new Scale(2,2,2,1,2,2,1),
    mixolydian: new Scale(2,2,1,2,2,1,2),
    aeolian: new Scale(2,1,2,2,1,2,2),
    locrian: new Scale(1,2,2,1,2,2,2),
    none: new Scale(),
    selected: def.scale,
    get: function() { return this[this.selected]; },
    see: function() { return this[this.selected].semitones; },
    set: function(scale){
      if( typeof this[scale] !== "undefined"){
    	  this.selected = scale;
        return scale + " scale is selected.";
  	  } else {
        return "You've tried to pick an nonexisting scale.";
  	  }
    },
    new: function(name,intervals) {
      this[name] = new Scale(...intervals);
      return "New scale " + name + " added."
    }
  }

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

  sound.makeCoords = function(){
    return { x: 0.00001, y: 0.000001,
      a: utilities.randFloat(-1000,1000),
      t: utilities.randFloat(-1000,1000),
      b: utilities.randFloat(-1000,1000),
      o: utilities.randInt(-1,1),
    }
  }

  sound.instruments = ["bass", "mel1", "mel2", "piano", "ambient"];

  var instrumentDo = function() {
    for (var i = 0; i < sound.instruments.length; i++) {
      var instr = sound.instruments[i];
      if( sound[instr].isPlaying ){
        var n = sound[instr].getNote();
        if(n > 0){
          n = sound.scales.get().lockTo( n );
          sound[instr].noteOn( n );
        }
      }
    }
  };

  Instrument = function( s ) {
    this.synth = s;
    var that = this,
        pauseID = null;
    that.isPlaying = false;
    this.start = function(){
      clearTimeout(pauseID);
      that.synth.play();
      that.isPlaying = true;
    };
    this.stop = function(){
      that.isPlaying = false;
      pauseID = setTimeout(function(){
        that.synth.pause() ; // give last note a chance to finish
      }, timeUnitToSeconds('8n') * 1000);
    };
    that.synth.pause();

    this.detune = synthDef.pseudoSynth();
    this.offset = synthDef.pseudoSynth();

    this.quickStart = function(){
      this.setCoords(sound.makeCoords());
      this.fillChaosBuffer({offset: utilities.randInt(0,1000)});
      this.mapBufferToNotes();
      this.newRhythm('fast', [utilities.randPrime(5),utilities.randPrime(10)]);
    };
    if(def.quickStartEnabled){
      this.quickStart();
    }
  }

  function getSynthValue(synth, val){
    var v = synth.get(val);
    return typeof v === 'object' ? v.model.value : v;
  }

  Instrument.prototype = new Sequencer();

  Instrument.prototype.noteOn = function( midi ) {
    var duration = duration || 200,
        freq = flock.midiFreq(midi),
        detune = getSynthValue(this.detune, 'line.mul') - 100,
        osc2Offset = Math.round(getSynthValue(this.offset, 'line.mul') - 100),
        freq2 = flock.midiFreq(midi + osc2Offset) * Math.pow(2, (detune)/1200);

    this.synth.set({
        "osc.freq": freq,
        "osc2.freq": freq2,
        "env.gate":  1,
        "env2.gate":  1,
    }); //<<set note

    var onSynth = this.synth;
    setTimeout(function(){ // put note out
      onSynth.set("env.gate", 0);
      onSynth.set("env2.gate", 0);
    }, duration)
  }

  function argsToOptions(){
    var options = {};
    if (arguments.length === 2 && typeof arguments[1] !== 'string'){ // args are 'parameter', value
      options[arguments[0]] = arguments[1];
    } else if( arguments.length === 3 ){ // args are 'parameter', value, time
      options[arguments[0]] = arguments[1];
      options['t'] = timeUnitToSeconds(arguments[2]);
    } else { // args are 'options object', time
      options = arguments[0];
      if(typeof arguments[1] !== 'undefined') options['t'] = timeUnitToSeconds(arguments[1]);
    }
    return options;
  }

  function applyParameters(parm, options, args){
    if( parm !== 't'){
      if (options.hasOwnProperty('t')) args.push(options.t);
      setSynthdefValue(...args);
    }
  }

  Instrument.prototype.envelope = function(){
    var options = argsToOptions(...arguments);
    for (var parm in options) {
      applyParameters(parm, options, [options[parm], this.synth, 'env.'+parm]);
      applyParameters(parm, options, [options[parm], this.synth, 'env2.'+parm]);
    }
  }

  Instrument.prototype.filter = function(){
    var options = argsToOptions(...arguments);
    for (var parm in options) {
      applyParameters(parm, options, [options[parm], this.synth, 'filter.'+parm]);
    }
  }

  Instrument.prototype.oscillators = function(){
    var options = argsToOptions(...arguments);
    for (var parm in options) {
      applyParameters(parm, options, [options[parm]+=100, this[parm], 'line.mul']);
    }
  }

  sound.bass = new Instrument( synthDef.synth() );
  sound.mel1 = new Instrument( synthDef.synth() );
  sound.mel2 = new Instrument( synthDef.synth() );

  sound.piano = new Instrument( synthDef.piano );
  sound.piano.noteOn = function( mNote ) {
    var pNote = "piano-"+mNote+".trigger.source";
    synthDef.piano.set( pNote , 1 );
  }

  sound.ambient = new Instrument( synthDef.ffb );
  sound.ambient.noteOn = function ( mNote ) {
    var freq = flock.midiFreq( mNote + 60 ),
        fltr = "f"+this.noteOn.counter,
        fCtoff = fltr + ".cutoff",
        fMul = fltr + ".mul";
    this.synth.set(fCtoff, freq);

    this.synth.set(fMul, synthDef.line(0.0001, 0.2));
    this.synth.set(fMul, synthDef.line(0.2, 0.0001, timeUnitToSeconds('4n')));

    this.noteOn.counter++;
    if( this.noteOn.counter > synthDef.ffBankSize-1 ) this.noteOn.counter = 0;
  }

  sound.ambient.noteOn.counter = 0;

  sound.stopAll = function(){
    for (var i of sound.instruments) sound[i].stop();
    sound.drums.stop();
  }

  var drumTimeouts = {};
  sound.drums = {
    isPlaying: false,
    list: [ "kick", "snare", "hh", "perc"],

    start: function(){
      sound.drums.isPlaying = true;
    },
    stop: function(){
      sound.drums.isPlaying = false;
    },
    stopAll: function(){
      for (var drum of sound.drums.list) sound.drums[drum].stop();
      sound.drums.stop();
    },
    startAll: function(){
      for (var i = 0; i < sound.drums.list.length; i++) sound.drums[sound.drums.list[i]].start();
      sound.drums.start();
    },

    play: function(which){
      // if (drumTimeouts.hasOwnProperty(which)) clearTimeout(drumTimeouts[which]);
      var duration = getSynthValue(sound.drums[which].duration, 'line.mul') - 100,
          on = { "volEnv.gate": 1 , "pitchEnv.gate": 1} , off = { "volEnv.gate": 0 , "pitchEnv.gate": 0};

      if(duration < 25) duration = 25;

      if(which === 'perc') {
        on["pitchEnv2.gate"] = 1;
        off["pitchEnv2.gate"] = 0;
      }

      sound.drums[which].synth.set( on );

      drumTimeouts[which] = setTimeout(function () {
        sound.drums[which].synth.set( off );
      }, duration);
    },

    do: function() {
      if(sound.drums.isPlaying){
        for (var i = 0; i < sound.drums.list.length; i++) {
          if( sound.drums[sound.drums.list[i]].isPlaying && sound.drums[sound.drums.list[i]].trigger()){
            sound.drums.play(sound.drums.list[i]);
          }
        }
      }
    }
  };

  function Drum(s){
    var that = this; // so it can be called from other classes
    this.start = function() {
      if (!sound.drums.isPlaying){
       for (var d of sound.drums.list) sound.drums[d].stop();
       sound.drums.start();
      }
      that.isPlaying = true;
    };

    this.stop = function() {
      that.isPlaying = false;
    }

    this.synth = s;
    this.duration = synthDef.pseudoSynth(20);

    this.newRhythm("fast",[5,utilities.randInt(4,9)], utilities.randInt(0,2));
    this.isPlaying = false;
  }

  Drum.prototype = new Sequencer("rhythm");

  Drum.prototype.ampEnv = function(){
    var options = argsToOptions(...arguments);
    for (var parm in options) {
      applyParameters(parm, options, [options[parm], this.synth, 'volEnv.'+parm]);
    }
  };

  Drum.prototype.pitchEnv = function(){
    var options = argsToOptions(...arguments);
    for (var parm in options) {
      applyParameters(parm, options, [options[parm], this.synth, 'pitchEnv.'+parm]);
      if(this.synth.options.nickName === "perc") {
        applyParameters(parm, options, [options[parm], this.synth, 'pitchEnv2.'+parm]);
      }
    }
  };

  Drum.prototype.set = function(){
    var options = argsToOptions(...arguments);
    for (var parm in options) {
      applyParameters(parm, options, [options[parm]+=100, this[parm], 'line.mul']);
    }
  };

  for (var drum of sound.drums.list) {
    sound.drums[drum] = new Drum(synthDef[drum]);
    sound[drum] = sound.drums[drum];
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
      onceArr = [];

  sound.schedule = {
    repeat: function(foo, t, n){
      repeatArr.push( { id: utilities.getTime(), name: n, function: foo, time: t })
    },
    once: function(foo, t, n){
      onceArr.push( { id: utilities.getTime(), name: n, function: foo, time: t })
    },

    clear: function(name){
      var cntr = 0;
      for (var i = 0; i < onceArr.length; i++) {
        if(onceArr[i].name === name){
          onceArr.splice(i--,1);
          cntr++;
        }
      }
      for (var i = 0; i < repeatArr.length; i++) {
        if(repeatArr[i].name === name){
          repeatArr.splice(i--,1);
          cntr++;
        }
      }

      if(cntr > 0){
        return "Cleared "+ cntr +" scheduled events with name: " + name + ".";
      } else {
        return "No events found with name: " + name + ".";
      }
    },

    clearAll: function(){
      repeatArr.splice(3,repeatArr.length); // first three are system repeats
      onceArr = [];
      return "Schedule cleared!"
    },

    show: function(){
      if ( repeatArr.length === 2 && onceArr.length < 1) {
        return "No scheduled events to show."
      } else {
        if(repeatArr.length > 2) {
          print('Repeats scheduled:');
          for (var i = 2; i < repeatArr.length; i++) {
            print('    '+repeatArr[i].name);
          }
        }
        if(onceArr.length > 0){
          print('Once scheduled:');
          for (var i = 0; i < onceArr.length; i++) {
            print('    '+onceArr[i].name);
          }
        }
      }
    },

    do: function(){
      var currentTime = utilities.getTime();

      for (var i = 0; i < onceArr.length; i++) {
        if((currentTime - onceArr[i].id) >= timeUnitToMilliseconds(onceArr[i].time)){
          try {
            onceArr[i].function();
          } catch (e) {
            print('Once function failed with error: ');
            print(e);
          }
          onceArr.splice(i--,1); // remove from arr and do this index again
        }
      }

      for (var i = 0; i < repeatArr.length; i++) {
        if((currentTime - repeatArr[i].id) >= timeUnitToMilliseconds(repeatArr[i].time)){
          try {
            repeatArr[i].function();
            repeatArr[i].id = currentTime;
          } catch (e) {
            print('Repeat function failed with error: ');
            print(e);
            print('Scheduling cancelled: ');
            repeatArr.splice(i--,1); // remove from arr and do this index again
          }
        }
      }


    }
  }

  // Assign lpSeq to drums
  // TODO make this a user accesible function
  for (var i = 0; i < playheads.length; i++) {
    (function(i){
      playheads[i].do = function(){ drums.play(drums.list[i]); }
    })(i);
  }

  scheduleSequences();
  sound.schedule.repeat(sound.drums.do, '8n', 'drums_schedule');
  sound.schedule.repeat(instrumentDo, '8n', 'instrument_schedule');
  sound.schedule.repeat(launchpadDo, '8n', 'launchpad_schedule');

  //TODO add cheat patterns: blue monday,
  var drumPatterns = {
    amen: {
      hh: (new Schillinger()).newRhythm('fast', [2,4,8]),
      snare: [0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,0,0,0,1,0],
      kick: [1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0]
    },

    disco: {
      kick:  Array(16).fill(0).map(function(n,i){ return (i % 4 === 0) ? 1 : 0; }),
      snare:  Array(16).fill(0).map(function(n,i){ return (i % 4 === 2) ? 1 : 0; }),
      hh:  Array(16).fill(0).map(function(n,i){ return (i % 2 === 1) ? 1 : 0; }),
    }

  }

  sound.loadDrumPattern = function(p){
    if (typeof drumPatterns[p] === "undefined") return "drum pattern name not valid."
    for (var v in drumPatterns[p]) {
      sound.drums[v].rhythm = utilities.copyArr(drumPatterns[p][v]);
      sound.drums[v].pos = 0;
    }
    return "pattern loaded"
  }
}());
