var Instrument = null; // make accesible to help
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

  var timeUnitToSeconds = function(unit){
    var val;
    if (unit.includes('n')) {
      val = getBpm(tempo, unit);
    } else if (unit.includes('b')) { // convert bars to seconds
      var barLength = getBpm(tempo, signature.lower) * signature.upper,
          nrOfBars = parseFloat(unit.replace('b', ''));
      val = barLength * nrOfBars;
    } else if(unit.includes('s') && !unit.includes('m')) {
      val = parseFloat(unit.replace('s', ''));
    } else if(unit.includes('ms')) {
      val = parseFloat(unit.replace('ms', ''))/1000;
    } else if(unit.includes('m') && !unit.includes('s')) {
      val = parseFloat(unit.replace('s', ''))*60;
    }
    return val;
  }

  function makeCoords(){
    return { x: 0.1, y: 0.1,
      a: utilities.randFloat(-100,100),
      t: utilities.randFloat(-100,100),
      b: utilities.randFloat(-100,100),
      o: utilities.randInt(-1,1),
    }
  }

  sound.instruments = [ "bass", "mel1", "mel2", "piano", "ambient"];
  synthDef.pseudoSynth = function(){
    return flock.synth({
      synthDef: {
        id: 'osc',
        ugen: "flock.ugen.saw",
        rate: "control",
        freq: 100, // we use range 100-200, and scale it to 0-100 because 0 is weird
        mul: 0 // keep it silent
      }
    });
  };

  Instrument = function( s ) {
    this.synth = s;
    this.isPlaying = false;
    var that = this;
    this.start = function(){
      that.isPlaying = true;
    };
    this.stop = function(){
      that.isPlaying = false;
    };

    this.detune = synthDef.pseudoSynth();
    this.offset = synthDef.pseudoSynth();
    var c = new Sequencer({});
    for (var foo in c) this[foo] = c[foo];

    this.quickStart = function(){
      this.fillChaosBuffer();
      this.mapBufferToNotes();
      this.newRhythm('fast', [utilities.randPrime(5),utilities.randPrime(10)]);
    };
    this.quickStart()
  }

  function getSynthValue(synth, val){
    var v = synth.get(val);
    return typeof v === 'object' ? v.model.value : v;
  }

  Instrument.prototype.noteOn = function( midi ) {
    var duration = duration || 200,
        freq = flock.midiFreq(midi),
        detune = getSynthValue(this.detune, 'osc.freq') - 100,
        osc2Offset = Math.round(getSynthValue(this.offset, 'osc.freq') - 100),
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
      applyParameters(parm, options, [options[parm]+=100, this[parm], 'osc.freq']);
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

  var toSchedule = [];
  toSchedule.push(sound.bass);
  toSchedule.push(sound.mel1);
  toSchedule.push(sound.mel2);
  toSchedule.push(sound.piano);
  toSchedule.push(sound.ambient);

  sound.stopAll = function(){
    for (var i of sound.instruments) sound[i].stop();
    sound.drums.stop();
  }

  for (var drum of sound.drums.list) {
    var c = new Sequencer("rhythm");     // copy sequencer into object
    for (var foo in c) sound.drums[drum][foo] = c[foo];

    sound.drums[drum].newRhythm("fast",[5,utilities.randInt(4,9)]);
    sound.drums[drum].isPlaying = sound.drums[drum].synth.isPlaying;
    (sound.drums[drum].start = sound.drums[drum].synth.play)();
    sound.drums[drum].stop = sound.drums[drum].synth.pause;
  }

  sound.drums.isPlaying = false;
  sound.drums.start = function(){ sound.drums.isPlaying = true; }
  sound.drums.stop = function(){ sound.drums.isPlaying = false; }

  sound.drums.do = function() {
    if(sound.drums.isPlaying){
      for (var i = 0; i < sound.drums.list.length; i++) {
        if( sound.drums[sound.drums.list[i]].trigger() && sound.drums[sound.drums.list[i]].isPlaying()){
          sound.drums.play(sound.drums.list[i]);
        }
      }
    }
  };

  toSchedule.push(sound.drums);

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
      synthDef.clock.clearAll();
      synthDef.clock.clearAll(); // <- called twice to make sure that everything gets cleared
      scheduleSequences(tempo);
    }
  }

  var scheduleSequences = function(bpm) {
    for (var i = 0; i < toSchedule.length; i++) {
      (function() {
        var temp = toSchedule[i];
        synthDef.clock.repeat(getBpm(tempo, '8n'), function(){ temp.do(); });
      })();
    }
    synthDef.clock.repeat(getBpm(tempo, '128n'),tempoChangeListener);
  }

  scheduleSequences();

}());
