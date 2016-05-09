(function () {
  "use strict";

  fluid.registerNamespace("sound");

  var environment = flock.init();
  environment.start();

  sound.set_coordinates = function (data) {
    sound.coordinates.x = parseFloat(data.x);
    sound.coordinates.y = parseFloat(data.y);
    sound.coordinates.a = parseFloat(data.a);
    sound.coordinates.t = parseFloat(data.t);
    sound.coordinates.b = parseFloat(data.b);
    sound.coordinates.o = parseInt(data.o);
  }

  var clock = flock.scheduler.async();

  var my_scale = [0, 2, 4, 5, 7, 9, 11];

  sound.lockToScale = function(n){
    return my_scale.indexOf(n) >= 0 ? n : n+1;
  }

  sound.chaos = [];
  for(var i=0; i<10; i++) {
    sound.chaos.push(
      new Chaos({
        x: 0.1, y: 0.1,
        a: 0, t: -10,
        b: -1.9, o: 1
    }));
  }

  sound.coordinates = {
    x: 0.1, y: 0.1,
    a: 0, t: -4.1,
    b: utilities.randInt(-100,100), o: 1
  }

  for(var i=0; i<10; i++){
    sound.chaos[i].fillBuffer(
      { coords: sound.coordinates,
        length: 100,
        reorder: "distanceFromEachother"
      });
    sound.coordinates.b -= 0.2;
  }

  sound.chaosToPlay = 0;

  // console.log(clock.clear)
  sound.stopSequence = function() {
    clock.clearAll();
  }

  sound.startSequence = function() {

    var sequenceId = clock.repeat(0.25, function() {
      var nArr = [], n, s, offset=0, noteAbove;
      for(var i=0; i<10; i++) {
        nArr[i] = sound.chaos[sound.chaosToPlay].getNote();
      }

      n = nArr[sound.chaosToPlay];

      // sound.playNote( 'synth', flock.midiFreq(midiNote) );
      // sound.playOboe( midiNote - 24 );
      if(n > 0 && n < 128){
        animatePoint(sound.chaos[sound.chaosToPlay].pos % sound.chaos[sound.chaosToPlay].notes.length+1);
        var pNote = "piano-"+n+".trigger.source";
        sound.piano.set( pNote , 1 );
      }
    });
  }

  sound.startFfb = function(){
    // play filterbank
    clock.repeat(0.125, function() {
        sound.chaos[1].calculate();
        var n = Math.floor( sound.chaos[1].getNormalized('x', 20, 120));
        n = utilities.limit( n , 20, 127 );
        sound.addNoteToFfb( flock.midiFreq(sound.lockToScale( n )) );
        blink();
      })
  }

}());
