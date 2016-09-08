(function(){
  // schillinger.js
  Schillinger.prototype.newRhythm.help = {
    title:'New Rhythm',
    type: 'Generator',
    content: 'A new rhythm.<br> a1(str): fast,slow. arg2: an array of numbers.'
  };

  Schillinger.prototype.reverse.help = {
    title: 'Reverse',
    type: 'Modifier',
    content: 'If called without an argument reverses the whole sequence. Optional <string>arg1 what you want reversed: notes or rhythm.'
  };

  Schillinger.prototype.multiplyIntervals.help = {
    title: 'Multiply intervals',
    type: 'Modifier',
    content: 'Multiply all intervals with scalar of <int>arg1.'
  };

  Schillinger.prototype.transpose.help = {
    title: 'Transpose',
    type: 'Modifier',
    content: 'Transpose the sequence horisontally by <int>arg1.'
  };

  Schillinger.prototype.clampToRange.help = {
    title: 'Clamp',
    type: 'Modifier',
    content: 'Notes are transposed by an octave until they fit in range between <int>arg1(low) and <int>arg2(high).'
  };

  var mirror = {
    title: 'Mirror',
    type: 'Modifier',
    content: 'Maps the highest value in the sequence to lowest value. 2nd highest to 2nd lowest and so forth.'
  };

  Schillinger.prototype.mirrorNotes.help = mirror;
  Schillinger.prototype.mirrorIntervals.help = mirror;
  Schillinger.prototype.mirrorRhythm.help = mirror;

  var sort = {
    title: 'Sort',
    type: 'Modifier',
    content: 'Sort based on given type of sort.',
    options: [ ["ascending", "low to high"],
            ["descending", "high to low"],
            ["average-deviation-ascending", "delta from avg h2l"],
            ["average-deviation-descending", , "delta from avg l2h"],
            ["wondrous-ascending", "howWonderous h2l"],
            ["wondrous-descending", "howWonderous l2h"]]
  };

  Schillinger.prototype.sortNotes.help = sort;
  Schillinger.prototype.sortIntervals.help = sort;
  Schillinger.prototype.sortRhythm.help = sort;

  // Chaos.js----------------------------------------------------------------------
  Chaos.prototype.getAllFromBuffer.help = {
    title: 'Get all from buffer',
    type: 'Data',
    content: 'Returns an array with all elements of requested value <string>arg1 from the chaos buffer.'
  };

  Chaos.prototype.fillChaosBuffer.help = {
    title: 'Fill Chaos Buffer',
    type: 'Generator',
    content: 'Fills a buffer with iterations from chaos. Takes an option object as argument.',
    options: [ ['length', 'int'],
              ['offset', 'int'],
              ['coords', 'object { a: f, t: f, b: f, o: f}'],
              ['reorder', 'string'],
              ['release', 'float'],
              ['t', 'time value'] ],
  };

  Sequencer.prototype.mapBufferToNotes.help = {
    title: 'Map buffer to notes',
    type: 'Modifier',
    content: 'Maps chaos buffer to note values. Making them playable.',
    options: [ ['valueToMap', 'x, y, length'],
              ['mapTo', 'object { low: i, high: i }']],
  };

  Sequencer.prototype.mapBufferToRhythm.help = {
    title: 'Map buffer to rhythm',
    type: 'Modifier',
    content: 'Maps chaos buffer to rhytmic values. Making them playable.',
    options: [ ['valueToMap', 'x, y, length'],
              ['mapTo', 'object { low: i, high: i }']],
  };

  // Composition.js----------------------------------------------------------------------
  sound.scales.set.help = {
    title: 'Set scale',
    type: 'Modifier',
    content: 'Selects the scale to tune notes too.',
    docLink: 'documentation.html#scales'
  };

  Instrument.prototype.envelope.help = {
    title: 'Envelope',
    type: 'Sound',
    content: 'Edit the envelope. To edit a single value: <string>arg1 pm to edit, <float> pm value, <opt string> Change transition time. For multiple values at once pass an option object.',
    options: [ ['attack', 'float'],
              ['sustain', 'float 0-1'],
              ['release', 'float'],
              ['t', 'time value'] ],
  };

  Instrument.prototype.filter.help = {
    title: 'Filter',
    type: 'Sound',
    content: 'Edit the filter. To edit a single value: <string>arg1 pm to edit, <float> pm value, <opt string> Change transition time. For multiple values at once pass an option object.',
    options: [ ['cutoff', 'frequence'],
              ['resonance', 'float'],
              ['t', 'time value'] ],
  };

  Instrument.prototype.oscillators.help = {
    title: 'Oscillators',
    type: 'Sound',
    content: 'Edit the oscillators. To edit a single value: <string>arg1 pm to edit, <float> pm value, <opt string> Change transition time. For multiple values at once pass an option object.',
    options: [ ['detune', 'float 0-100'],
              ['offset', 'int'],
              ['t', 'time value'] ],
  };

  // Instrument.start.help = {
  //   title: 'Start',
  //   type: 'Schedule',
  //   content: 'The instruments sequence starts playing.',
  // }
  //
  // Drum.start.help = {
  //   title: 'Start',
  //   type: 'Schedule',
  //   content: 'The drums sequence starts playing.',
  // }

  sound.drums.start.help = {
    title: 'Start',
    type: 'Schedule',
    content: 'The drum sequences start playing, individual drum states remain the same.',
  }

  sound.drums.startAll.help = {
    title: 'Start all',
    type: 'Schedule',
    content: 'All drums start playing.',
  }
  //
  // Instrument.stop.help = {
  //   title: 'Stop',
  //   type: 'Schedule',
  //   content: 'The instruments sequence stops playing.',
  // }
  //
  // Drum.stop.help = {
  //   title: 'Stop',
  //   type: 'Schedule',
  //   content: 'The drums sequence stops playing.',
  // }

  sound.drums.stop.help = {
    title: 'Stop',
    type: 'Schedule',
    content: 'The drum sequences stop playing, individual drum states remain the same.',
  }

  sound.drums.stopAll.help = {
    title: 'Stop all',
    type: 'Schedule',
    content: 'All drums stop playing.',
  }

})();
