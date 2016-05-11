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

  var mirror = {
    title: 'Mirror',
    content: 'Modifier.<br> Maps the highest value in the sequence to lowest value. 2nd highest to 2nd lowest and so forth.'
  };

  Schillinger.prototype.mirrorNotes.help = mirror;
  Schillinger.prototype.mirrorIntervals.help = mirror;
  Schillinger.prototype.mirrorRhythm.help = mirror;
})();
