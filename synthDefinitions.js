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
