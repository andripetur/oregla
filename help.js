(function(){
  // schillinger.js
  Schillinger.prototype.newRhythm.help = {
    title:'New Rhythm',
    content: 'Generator.<br> A new rhythm.<br> a1(str): fast,slow. arg2: an array of numbers '
  };

  Schillinger.prototype.reverse.help = {
    title: 'Reverse',
    content: 'Modifier.<br> Reverses the whole sequence.'
  };

  Schillinger.prototype.multiplyIntervals.help = {
    title: 'Reverse',
    content: 'Modifier.<br> Multiply all intervals of intervals with <int>arg1.'
  };

  Schillinger.prototype.transpose.help = {
    title: 'Transpose',
    content: 'Modifier.<br>Transpose the sequence horisontally by <int>arg1.'
  };

  Schillinger.prototype.clampToRange.help = {
    title: 'Clamp',
    content: 'Modifier.<br> Notes are transposed by an octave until they fit in range between <int>arg1(low) and <int>arg2(high).'
  };

  var mirror = {
    title: 'Mirror',
    content: 'Modifier.<br> Maps the highest value in the sequence to lowest value. 2nd highest to 2nd lowest and so forth.'
  };

  Schillinger.prototype.mirrorNotes.help = mirror;
  Schillinger.prototype.mirrorIntervals.help = mirror;
  Schillinger.prototype.mirrorRhythm.help = mirror;

  // Chaos----------------------------------------------------------------------
  Chaos.prototype.getAllFromBuffer.help = {
    title: 'Get all from buffer',
    content: 'Data.<br> Returns an array with all elements of requested value <string>arg1 from the chaos buffer.'
  };

  Chaos.prototype.fillChaosBuffer.help = {
    title: 'Fill Chaos Buffer',
    content: 'Generator.<br> Fills a buffer with iterations from chaos. Takes an option object as argument.'
  };

  Sequencer.prototype.mapBufferToNotes.help = {
    title: 'Map buffer to notes',
    content: 'Modifier.<br> Maps chaos buffer to note values. Making them playable.'
  };
    // Chaos----------------------------------------------------------------------
  sound.selectScale.help = {
    title: 'Select scale',
    content: 'Modifier.<br> Selects a scale to tune notes too.'
  };
})();
