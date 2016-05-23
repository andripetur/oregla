(function () {
  // - - - - synths - - - -
  fluid.registerNamespace("sound");
  fluid.registerNamespace("synthDef")

  var environment = flock.init();
  environment.start();

  synthDef.bassSynth = flock.synth({
    nickName: "square-synth",
    synthDef: {
      ugen: "flock.ugen.filter.moog",
       cutoff: {
           ugen: "flock.ugen.sinOsc",
           freq: 1/8,
           mul: 5000,
           add: 6000
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

  // - - - - samplers - - - -

  function makeBufferDefs(){
    var note, id, defs = [];
    for (var i = 0; i < 16; i++) {
      note = ((i % 2) == 0 ? "C" : "Fis" ) + Math.floor(i/2);
      id = "pi-note-" + (i * 6);
      defs.push( { id: id, url: "./piano/" + note + ".wav" });
    }
    // defs.push( {id: 'oboe', url: "./audio/oboe_C4.wav"});
    return defs;
  }

  synthDef.loader = flock.bufferLoader({
    bufferDefs: makeBufferDefs()
  });

  var everySixUnder103 = [];
  for (var i = 0; i < 18; i++) everySixUnder103.push(i*6);

  function makePianoSamples(){
    var bufferId, delta, synths = [];
      for (var i = 0; i < 128; i++) {
        if( everySixUnder103.indexOf(i) > -1){
          delta = 1;
          bufferId = "pi-note-"+ i;
        } else {
          var diffs = everySixUnder103.map(function(el){ return { diff: Math.abs(el - i), val: el }; });
          diffs.sort(function(a,b){
            return a.diff - b.diff;
          });
          var baseNote = diffs[0].val;
          bufferId = "pi-note-"+ baseNote;
          delta = i - baseNote;
        }

        synths.push({
            ugen: "flock.ugen.playBuffer",
            id: "piano-"+i,
            buffer: bufferId,

            trigger: {
              id: "trig",
              ugen: "flock.ugen.inputChangeTrigger",
              source: 0,
            },

            speed: Math.pow(2, delta/12),
            loop: 0,
            start: 0,
          });
      }
      return synths;
    }

  var pianoStartVol = 0.7637795275590551;
  sound.line = function(from, goTo){
    var line = {
      ugen: 'flock.ugen.xLine',
      rate: 'control',
      start: from,
      end: goTo,
      duration: 0.03
    };
    return line;
  }

  // - - - - filterbanks - - - -

  synthDef.ffBankSize = 10;
  function fillFilterBank() {
    var ffb = [];
    for(var i=0; i<synthDef.ffBankSize; i++){
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

  synthDef.ffb = flock.synth( {
    synthDef: {
      // ugen: 'flock.ugen.freeverb',
      // ugen: 'flock.ugen.distortion',
      ugen: 'flock.ugen.sum',
      sources: fillFilterBank(),
    }
  })


  sound.drums = {};

  sound.drums.kick = {};
  sound.drums.kick.synth = flock.synth({
    nickName: "kick",
    synthDef: {
      ugen: 'flock.ugen.distortion',
        source: {
         id: 'osc',
         ugen: "flock.ugen.sinOsc",
         mul: {
           id: "volEnv",
           ugen: "flock.ugen.asr",
           attack: 0.001,
           sustain: 0.5,
           release: 0.4,
           mul: 0.9,
         },

         freq: {
           id: "pitchEnv",
           ugen: "flock.ugen.asr",
           attack: 0.001,
           sustain: 0.1,
           release: 0.2,
           gate: 0,
           mul: 1000,
           add: 60,
         },
       },
       gain: 2,
     },
  });

  sound.drums.snare = {};
  sound.drums.snare.synth = flock.synth({
    nickName: "snare",
    synthDef: {
      ugen: 'flock.ugen.distortion',
      source: {
        ugen: "flock.ugen.filter.biquad.bp",
        source: {
            ugen: "flock.ugen.whiteNoise",
            mul: {
              id: "volEnv",
              ugen: "flock.ugen.asr",
              attack: 0.001,
              sustain: 1,
              release: 0.4,
              gate: 0,
              mul: 0.5,
            },
        },

        freq: {
          id: "pitchEnv",
          ugen: "flock.ugen.asr",
          attack: 0.001,
          sustain: 0.1,
          release: 0.2,
          gate: 0,
          mul: 18000,
          add: 400,
        },

        q: 2.0
      },
      gain: 2
    }
  });

  sound.drums.hh = {};
  sound.drums.hh.synth = flock.synth({
    nickName: "hh",
    synthDef: {
        ugen: "flock.ugen.filter.biquad.bp",
        source: {
            ugen: "flock.ugen.whiteNoise",
            mul: {
              id: "volEnv",
              ugen: "flock.ugen.asr",
              attack: 0.001,
              sustain: 1,
              release: 0.02,
              gate: 0,
            },
        },

        freq: {
          id: "pitchEnv",
          ugen: "flock.ugen.asr",
          attack: 0.001,
          sustain: 1,
          release: 0.02,
          gate: 0,
          mul: 9000,
          add: 2000,
        },

        q: 3.0
    }
  });

  sound.drums.perc = {};
  sound.drums.perc.synth = flock.synth({
    nickName: "perc",
    synthDef: {
      ugen: 'flock.ugen.distortion',
        source: {
         ugen: "flock.ugen.sum",
         sources: [
           {
             ugen: "flock.ugen.square",
             mul: 0.5,
             freq: 587
           },
           {
             ugen: "flock.ugen.square",
             mul: 0.5,
             freq: 845
           }
         ],
       },
       mul: {
         id: "volEnv",
         ugen: "flock.ugen.asr",
         attack: 0.001,
         sustain: 0.5,
         release: 0.2,
         gate: 0,
       },
     },
  });

  sound.drums.play = function(which){
    var on = { "volEnv.gate": 1 } , off = { "volEnv.gate": 0 };
    if(which != 'perc') {
      on["pitchEnv.gate"] = 0;
      off["pitchEnv.gate"] = 0;
    }
    sound.drums[which].synth.set( on );
    setTimeout(function () {
      sound.drums[which].synth.set( off );
    }, 10);
  }

  synthDef.band = flock.band({
    components: {
      piano: {
        type: "flock.synth",
        options: {
          synthDef: {
            id: 'verb',
            ugen: 'flock.ugen.freeverb',
            mul: pianoStartVol,
            source: {
              ugen: 'flock.ugen.sum',
              sources: makePianoSamples(),
            }
          }
        }
      },

      scheduler: {
        type: "flock.scheduler.async",
        options: {
            components: {
                synthContext: "{piano}"
            },

            score: [{
              interval: "once",
              time: 1.0,
              change: {
                  values: {
                      "piano-0.loop": {
                          synthDef: {
                              ugen: "flock.ugen.sequence",
                              values: [0]
                          }
                      }
                  }
              }
          }]
        }
    }
  }
});

synthDef.piano = synthDef.band.piano;

}());

function setSoundValue(v,instrument,controls){
  var fr = sound[instrument].get(controls);
  fr = typeof fr === "object" ? fr.inputs.end.inputs.value : fr;
  sound[instrument].set( controls, sound.line( fr, v ) );
}
