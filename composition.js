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
    logydian: new Scale(2,2,2,1,2,2,1),
    mixolydian: new Scale(2,2,1,2,2,1,2),
    aeolian: new Scale(2,1,2,2,1,2,2),
    locrian: new Scale(1,2,2,1,2,2,2),
    none: new Scale(),
    selected: 'ionian',
    get: function() { return this[this.selected]; },
    set: function(scale){
      if( typeof this[scale] !== "undefined"){
    	  this.selected = scale;
        return scale + " scale is selected.";
  	  } else {
        return "You've tried to pick an nonexisting scale.";
  	  }
    }
  }

  var tempo = 80;
  var divisor = {};
  for (var i = 0.25; i < 64; i*=2) divisor[(i*4)+'n'] = i;
  var getBpm = function(bpm,smallestDivisor){
    return (60 / bpm) / smallestDivisor;
  }

  function makeCoords(){
    return { x: 0.1, y: 0.1,
      a: utilities.randFloat(-100,100),
      t: utilities.randFloat(-100,100),
      b: utilities.randFloat(-100,100),
      o: utilities.randInt(-1,1),
    }
  }

  sound.instruments = [ "bass", "piano", "ambient"];
  var Instrument = function( s ) {
    this.synth = s;
    this.start = this.synth.play;
    (this.stop = this.synth.pause)();
    this.detune = 0; // 0 - 1
    this.osc2Offset = 0;
    var c = new Sequencer({});
    for (var foo in c) this[foo] = c[foo];

    this.quickStart = function(){
      this.fillChaosBuffer();
      this.mapBufferToNotes();
      this.newRhythm('fast', [2,3,7,11]);
    };
    this.quickStart()
  }

  Instrument.prototype.noteOn = function( midi ) {
    var duration = duration || 200;
    var freq = flock.midiFreq(midi);
    var freq2 = flock.midiFreq(midi+this.osc2Offset) * Math.pow(2, (this.detune*100)/1200);

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

  sound.bass = new Instrument( synthDef.bassSynth );
  sound.piano = new Instrument( synthDef.band.piano )
  sound.piano.noteOn = function( mNote ) {
    var pNote = "piano-"+mNote+".trigger.source";
    synthDef.band.piano.set( pNote , 1 );
  }

  sound.ambient = new Instrument( synthDef.ffb );
  sound.ambient.noteOn = synthDef.addNoteToFfb;

  var toSchedule = [];
  toSchedule.push(sound.bass);
  toSchedule.push(sound.piano);
  toSchedule.push(sound.ambient);

  var drumList = [];
  for (var drum in sound.drums){
    if(drum === "play") break;
    drumList.push(drum);

    // copy sequencer
    var c = new Sequencer("rhythm");
    for (var foo in c) sound.drums[drum][foo] = c[foo];

    sound.drums[drum].newRhythm("fast",[3,5,utilities.randInt(4,9)]);
    sound.drums[drum].isPlaying = sound.drums[drum].synth.isPlaying;
    (sound.drums[drum].start = sound.drums[drum].synth.play)();
    sound.drums[drum].stop = sound.drums[drum].synth.pause;
  }

  var drumsArePlaying = false;
  sound.drums.start = function(){ drumsArePlaying = true; }
  sound.drums.stop = function(){ drumsArePlaying = false; }

  sound.drums.do = function() {
    if(drumsArePlaying){
      for (var i = 0; i < drumList.length; i++) {
        if( sound.drums[drumList[i]].trigger() && sound.drums[drumList[i]].isPlaying()){
          sound.drums.play(drumList[i]);
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
      synthDef.band.scheduler.clearAll();
      synthDef.band.scheduler.clearAll(); // <- called twice to make sure that everything gets cleared
      scheduleSequences(tempo);
    }
  }

  var scheduleSequences = function(bpm) {
    for (var i = 0; i < toSchedule.length; i++) {
      (function() {
        var temp = toSchedule[i];
        synthDef.band.scheduler.repeat(getBpm(tempo, divisor['8n']), function(){ temp.do(); });
      })();
    }
    synthDef.band.scheduler.repeat(getBpm(tempo, divisor['128n']),tempoChangeListener);
  }

  scheduleSequences();

}());
