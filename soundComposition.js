// Wrap everything in a function to keep your stuff private.
(function () {

  // JavaScript strict mode is a good thing.
  "use strict";

  // Define a unique global namespace for your stuff.
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

  sound.playNote = function (synth, f, _duration) {
    var duration = duration || 200;
    sound[synth].set({
        "osc.freq": f,
        "osc2.freq": f*1.02,
        "env.gate":  1,
        "env2.gate":  1,

    }); //<<set note
    setTimeout(function(){ // put note out
      sound[synth].set("env.gate", 0);
      sound[synth].set("env2.gate", 0);
    }, duration)
  }

  var clock = flock.scheduler.async();

  // var my_scale = [0, 2, 3, 5, 7, 9, 10];
  var my_scale = [0, 2, 4, 5, 7, 9, 11];

  sound.lockToScale = function(n){
    return my_scale.indexOf(n) >= 0 ? n : n+1;
  }

  sound.chaos = [];
  for(var i=0; i<10; i++) sound.chaos.push(new Chaos(0.1, 0.1, 0, -5, 0.9, 1));

  // sound.coordinates = {
  //   x: 0.1, y: 0.1,
  //   a: 0, t: -10,
  //   b: -1.9, o: 1
  // }
  sound.coordinates = {
    x: 0.1, y: 0.1,
    a: 0, t: -4.1,
    b: -1.9, o: 1
  }

  for(var i=0; i<4; i++){
    // sound.chaos[i].calculatePhrase(sound.coordinates);
    sound.chaos[i].calculateBufferedPhrase(sound.coordinates);

    sound.coordinates.b -= 0.002;
  }

  sound.chaosToPlay = 0;

  function blink(){
    var splash = document.getElementById('splash');
    splash.style.background = 'black';
    splash.style.color = 'white';
    setTimeout(function(){
      splash.style.background = 'white';
      splash.style.color = 'black';
    }, 200);
  }

  sound.stopSequence = function() {
    clock.clearAll();
  }

  sound.startSequence = function() {

    clock.repeat(0.25, function() {
      var nArr = [], n, s, offset=0, noteAbove;
      for(var i=0; i<10; i++) {
        nArr[i] = sound.chaos[sound.chaosToPlay].getNote();
      }

      noteAbove = nArr[(sound.chaosToPlay+1) % nArr.length];
      n = nArr[sound.chaosToPlay];

      if( n >= 0 ){ // note is valid
        // if(sound.chaosToPlay % 2 == 0){
        //   s = 'synth';
        // } else {
        //   s = 'synth2';
        //   offset += 12;
        // }

        // if( noteAbove > 0 ){ // if note above is valid check if it false
        //   // check the space beetween playing note and the one above it.
        //   var noteDelta = Math.abs( n - noteAbove);
        //
        //   if( noteDelta == 0 ) { // up an octave
        //     offset += 12;
        //   } else if ( noteDelta == 1) {
        //     offset += 2
        //   } else if ( noteDelta == 2) {
        //     offset += 1
        //   }
        // }

        var midiNote = sound.lockToScale( n + offset );
        animatePoint(sound.chaos[0].pos);

        // sound.playNote( 'synth', flock.midiFreq(midiNote) );
        // sound.playOboe( midiNote - 24 );
        var pNote = "piano-"+midiNote+".trigger.source";
        sound.piano.set( pNote , 1 );

        // blink();
      }
    });
  }
  // // play filterbank
  // clock.repeat(0.125, function() {
  //     sound.chaos[1].calculate();
  //     var n = Math.floor( sound.chaos[1].getNormalized('x', 20, 120));
  //     n = utilities.limit( n , 20, 127 );
  //     sound.addNoteToFfb( flock.midiFreq(sound.lockToScale( n )) );
  //     blink();
  //   })

}());
