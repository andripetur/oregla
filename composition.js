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

  var scales = {
    ionian: new Scale(2,2,1,2,2,2,1),
    dorian: new Scale(2,1,2,2,2,1,2),
    phrygian: new Scale(1,2,2,2,1,2,2),
    logydian: new Scale(2,2,2,1,2,2,1),
    mixolydian: new Scale(2,2,1,2,2,1,2),
    aeolian: new Scale(2,1,2,2,1,2,2),
    locrian: new Scale(1,2,2,1,2,2,2),
    none: new Scale()
  }

  sound.chaos = [];
  for(var i=0; i<10; i++) {
    sound.chaos.push(new Sequencer());
  }

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
      // reorder: "distanceFromEachother"
    });
    sound.chaos[i].mapBufferToNotes();
    sound.chaos[i].newRhythm("fast",[ i+1, 3, 5]);
    sound.coordinates.b -= 0.2;
  }

  sound.chaosToPlay = 0;

  sound.band.piano.pause();
  sound.band.scheduler.repeat(0.3, function () {
    if(sound.piano.isPlaying()){
      var n = sound.chaos[sound.chaosToPlay].getNote()
      if(n > 0){
        animatePoint(sound.chaos[sound.chaosToPlay].pos % sound.chaos[sound.chaosToPlay].notes.length+1);
        var pNote = "piano-"+n+".trigger.source";
        sound.band.piano.set( pNote , 1 );
      }
    }
  });

  sound.startSequence = function(){
    sound.band.piano.play();
  }
  sound.stopSequence = function(){
    sound.band.piano.pause();
  }

  sound.ffb.pause();
  sound.band.scheduler.repeat(0.25, function() {
    if(sound.ffb.isPlaying()) {
      sound.chaos[1].calculate();
      var n = Math.floor( sound.chaos[1].x * 1000 );
      n = utilities.limit( n , 20, 127 );
      sound.addNoteToFfb( flock.midiFreq(sound.lockToScale( n )) );
    }
  });

  var drumSeq = [];
  for (var drum in sound.drum){
     if(drum === "play") break;
     var l = drumSeq.length;
     drumSeq.push( { s: new Sequencer("rhythm"), d: drum });
     drumSeq[l].s.newRhythm("fast",[l,Math.floor(l*1.3),Math.floor(l*1.9)]);
   }

  sound.band.scheduler.repeat(0.125, function() {
    for (var i = 0; i < drumSeq.length; i++) {
      if(drumSeq[i].s.trigger()) sound.drum.play(drumSeq[i].d);
    }
  });

  sound.startAmbient = function(){
    sound.ffb.play();
  }
  sound.stopAmbient = function(){
    sound.ffb.pause();
  }
}());
