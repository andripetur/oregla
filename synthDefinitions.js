(function () {

  sound.synth = flock.synth({
    nickName: "square-synth",
    synthDef: {
      ugen: "flock.ugen.filter.moog",
       cutoff: {
           ugen: "flock.ugen.sinOsc",
           freq: 1/8,
           mul: 5000,
           add: 7000
       },
       resonance: 2,
       source: {
         ugen: 'flock.ugen.sum',
         sources: [{
           id: 'osc',
           ugen: "flock.ugen.saw",
           mul: {
               id: "env",
               ugen: "flock.ugen.asr",
               attack: 0.001,
               sustain: 0.5,
               release: 0.4,
               gate: 0,
           }
         },
         {
         id: 'osc2',
         ugen: "flock.ugen.saw",
         mul: {
             id: "env2",
             ugen: "flock.ugen.asr",
             attack: 0.001,
             sustain: 0.5,
             release: 0.4,
             gate: 0,
         }
       }
         ],
       },
      },
  });

  sound.synth2 = flock.synth({
    nickName: "square-synth",
    synthDef: {
      ugen: "flock.ugen.filter.moog",
       cutoff: 8000,
       resonance: 2,
       source: {
         ugen: 'flock.ugen.sum',
         sources: [{
           id: 'osc',
           ugen: "flock.ugen.saw",
           mul: {
               id: "env",
               ugen: "flock.ugen.asr",
               attack: 0.001,
               sustain: 0.5,
               release: 0.4,
               gate: 0,
           }
         },
         {
         id: 'osc2',
         ugen: "flock.ugen.saw",
         mul: {
             id: "env2",
             ugen: "flock.ugen.asr",
             attack: 0.001,
             sustain: 0.5,
             release: 0.4,
             gate: 0,
         }
       }
         ],
       },
      },
  });

  sound.pianoSamples = [];

  for (var i = 0; i < 16; i++) {
    var url = (i < 8 ? "./piano/C" + i : "./piano/Fis" + (i-8)) + ".wav";
    sound.pianoSamples.push( flock.synth({
        synthDef: {
            ugen: "flock.ugen.playBuffer",
            id: "buffer",
            buffer: {
                id: "n"+Math.random(),
                url: url
            },

            trigger: {
              id: "trig",
              ugen: "flock.ugen.inputChangeTrigger",
              source: 0,
            },
            speed: 1,
            loop: 0,
            start: 0,
        }
    }));
  }

  sound.cMidiNrs = [0, 12, 24, 36, 48, 60, 72, 84, 96];
  sound.fisMidiNrs = [6, 18, 30, 42, 54, 66, 78, 90, 102];

  sound.midiNrsOfNotes = [0,12,24,36,48,60,72,84,96,6,18,30,42,54,66,78,90,102];

  // returns the index of the number, closest to the provided number
  sound.closestIndex = function( n, arr ){
    var diffs = arr.map(function(el){ return Math.abs(el - n); });
    var lowest = Number.MAX_VALUE, indx = 0;
    for (var i = 0; i < diffs.length; i++) {
      if( diffs[i] < lowest ){
        lowest = diffs[i];
        indx = i;
      }
    }
    return indx;
  }

  sound.pianoPlayNote = function(n){
    var tempIndx = 0;

    if( (tempIndx = sound.midiNrsOfNotes.indexOf(n)) > -1) {
      sound.pianoSamples[tempIndx].set({"trig.source": 1, "buffer.speed": 1});
    } else { // pitch chaaange
      tempIndx = sound.closestIndex(n,sound.midiNrsOfNotes);
      var delta = n - sound.midiNrsOfNotes[tempIndx];
      sound.pianoSamples[tempIndx].set({"trig.source": 1, "buffer.speed": Math.pow(2, delta/12)});
    }
  }

  var ffBankSize = 10;
  function fillFilterBank() {
    var ffb = [];
    for(var i=0; i<ffBankSize; i++){
      ffb.push( {
        id: "f"+i,
        ugen: "flock.ugen.filter.moog",
        cutoff: 4000,
        resonance: 3.6,
        source: {
         id: "n"+i,
         ugen: "flock.ugen.whiteNoise",
         mul: 0,
        },
        mul: 0
      })
    }
    return ffb;
  }

  sound.ffb = flock.synth( {
    synthDef: {
      // ugen: 'flock.ugen.freeverb',
      // ugen: 'flock.ugen.distortion',
      ugen: 'flock.ugen.sum',
      sources: fillFilterBank(),
    }
  })

  sound.addNoteToFfb = function ( freq ) {
    var fltr = "f"+sound.addNoteToFfb.counter;
    var nsMul = "n"+sound.addNoteToFfb.counter+".mul";
    var fCtoff = fltr + ".cutoff";
    var fMul = fltr + ".mul";

    sound.ffb.set(fCtoff, freq);
    sound.ffb.set(nsMul, 1);
    sound.ffb.set(fMul, 0.4);

    sound.addNoteToFfb.counter++;
    if( sound.addNoteToFfb.counter > ffBankSize-1 ){
      sound.addNoteToFfb.counter = 0;
    }
  }

  sound.addNoteToFfb.counter = 0;

}());
