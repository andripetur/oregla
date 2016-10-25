(function () {
  "use strict";
  // - - - - synths - - - -
  fluid.registerNamespace("sound");
  fluid.registerNamespace("synthDef")

  var environment = flock.init();
  environment.start();

  synthDef.synth = function(){
    return flock.synth({
    synthDef: {
      ugen: 'flock.ugen.out',
      id: 'vol',
      mul: 0.7,
      sources: {
        ugen: "flock.ugen.filter.moog",
        id: 'filter',
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
      }
    });
  }

  // - - - - samplers - - - -
  var drms = [ "kick", "snare", "hh", "perc"];

  function makeBufferDefs(){
    var note, id, defs = [];
    for (var i = 0; i < 16; i++) {
      note = ((i % 2) == 0 ? "C" : "Fis" ) + Math.floor(i/2);
      id = "pi-note-" + (i * 6);
      defs.push( { id: id, url: "./piano/" + note + ".wav" });
    }

    for (var d of drms) {
      defs.push( { id: d, url: "./drm/bss/" + d + '.WAV' });
    }
    return defs;
  }

  synthDef.loader = flock.bufferLoader({
    bufferDefs: makeBufferDefs()
  });

  var everySixUnder103 = [];
  for (var i = 0; i < 18; i++) everySixUnder103.push(i*6);
  // synthDef.loader.buffers[0].format.duration // to find length of samples

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

          mul: {
            ugen: "flock.ugen.asr",
            attack: 0.001,
            sustain: 0.5,
            release: 0.4,
            gate: 0,
          },

          speed: Math.pow(2, delta/12),
          loop: 0,
          start: 0,
        });
      }
      return synths;
    }

  synthDef.piano = flock.synth({
    synthDef: {
      id: 'vol',
      ugen: 'flock.ugen.freeverb',
      mul: 0.7,
      source: {
        ugen: 'flock.ugen.sum',
        sources: makePianoSamples(),
      }
    }
  });

  synthDef.line = function(from, goTo, _t){
    var t = _t || 0.03;
    return {
      ugen: 'flock.ugen.xLine',
      rate: 'control',
      start: from,
      end: goTo,
      duration: t
    };
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
        resonance: 8.9,
        source: {
         id: "n"+i,
         ugen: "flock.ugen.whiteNoise",
         mul: 1,
        },
        mul: 0
      });
    }
    return ffb;
  }

  synthDef.ffb = flock.synth( {
    synthDef: {
      id: 'vol',
      ugen: 'flock.ugen.sum',
      sources: fillFilterBank(),
    }
  })
   // drum defs

   for (var d of drms) {
     synthDef[d] = flock.synth({
       nickName: d,
       synthDef: {
         ugen: "flock.ugen.out",
         id: 'vol',
         mul: 0.7,
         bus: 5,
         sources: {
           ugen: "flock.ugen.playBuffer",
           buffer: d,

           trigger: {
             id: "trig",
             ugen: "flock.ugen.inputChangeTrigger",
             source: 0,
           },
         }
       }
     });
   }

  synthDef.drumBus = flock.synth({
    synthDef: {
      ugen: 'flock.ugen.out',
      id: 'vol',
      mul: 0.7,
      sources: {
        ugen: 'flock.ugen.in',
        bus: 5
      }
    }
  });

  synthDef.pseudoSynth = function(_init){
    var init = _init + 100 || 100;
    return flock.synth({
      synthDef: {
        ugen: 'flock.ugen.out',
        rate: "control",
        id: 'line',
        mul: init,
      }
    });
  };
}());

function setSynthdefValue(v,instrument,controls, t){
  var fr = instrument.get(controls);
  fr = typeof fr === "object" ? fr.inputs.end.inputs.value : fr;
  instrument.set( controls, synthDef.line( fr, v, t ) );
}
