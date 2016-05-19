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

  sound.chaos = [];
  for(var i=0; i<10; i++) sound.chaos.push(new Sequencer());

  function makeCoords(){
    return { x: 0.1, y: 0.1,
      a: utilities.randFloat(-100,100),
      t: utilities.randFloat(-100,100),
      b: utilities.randFloat(-100,100),
      o: utilities.randInt(-1,1),
    }
  }
  sound.coordinates = makeCoords();

  for(var i=0; i<10; i++){
    sound.chaos[i].fillChaosBuffer({
      coords: sound.coordinates,
      offset: i*1000,
      length: 100,
    });
    sound.chaos[i].mapBufferToNotes();
    sound.chaos[i].newRhythm("fast",[ i+1, 3, 5]);
    sound.coordinates.b -= 0.2;
  }

  var Instrument = function( s ) {
    this.synth = s;
    this.start = this.synth.play;
    (this.stop = this.synth.pause)();
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
    this.synth.set({
        "osc.freq": freq,
        "osc2.freq": freq*1.02,
        "env.gate":  1,
        "env2.gate":  1,
    }); //<<set note
    var onSynth = this.synth;
    setTimeout(function(){ // put note out
      onSynth.set("env.gate", 0);
      onSynth.set("env2.gate", 0);
    }, duration)
  }

  sound.bass = new Instrument( sound.bassSynth );
  sound.piano = new Instrument( sound.band.piano )
  sound.piano.noteOn = function( mNote ) {
    var pNote = "piano-"+mNote+".trigger.source";
    sound.band.piano.set( pNote , 1 );
  }

  sound.ambient = new Instrument( sound.ffb );
  sound.ambient.noteOn = sound.addNoteToFfb;

  var toSchedule = [];
  toSchedule.push(sound.bass);
  toSchedule.push(sound.piano);
  toSchedule.push(sound.ambient);

  sound.chaosToPlay = 0;

  var drumSeq = [];
  for (var drum in sound.drums){
    if(drum === "play") break;
    var l = drumSeq.length;
    drumSeq.push( { s: new Sequencer("rhythm"), d: drum });
    drumSeq[l].s.newRhythm("fast",[3,5,l+4]);
    sound.drums[drum].isPlaying = sound.drums[drum].isPlaying;
    (sound.drums[drum].start = sound.drums[drum].play)();
    sound.drums[drum].stop = sound.drums[drum].pause;
  }

  drumSeq.isPlaying = false;
  sound.drums.start = function(){ drumSeq.isPlaying = true; }
  sound.drums.stop = function(){ drumSeq.isPlaying = false; }

  sound.drums.do = function() {
    if(drumSeq.isPlaying){
      for (var i = 0; i < drumSeq.length; i++) {
        if(drumSeq[i].s.trigger() && sound.drums[drumSeq[i].d].isPlaying()){
          sound.drums.play(drumSeq[i].d);
        }
      }
    }
  };

  toSchedule.push(sound.drums)

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
      sound.band.scheduler.clearAll();
      sound.band.scheduler.clearAll(); // <- called twice to make sure that everything gets cleared
      scheduleSequences(tempo);
    }
  }

  var scheduleSequences = function(bpm) {
    for (var i = 0; i < toSchedule.length; i++) {
      (function() {
        var temp = toSchedule[i];
        sound.band.scheduler.repeat(getBpm(tempo, divisor['8n']), function(){ temp.do(); });
      })();
    }
    sound.band.scheduler.repeat(getBpm(tempo, divisor['128n']),tempoChangeListener);
  }

  scheduleSequences();

}());
