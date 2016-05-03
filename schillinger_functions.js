fluid.registerNamespace("Schillinger");

Schillinger.permutation = function(seq){

}

Schillinger.reverse = function(seq){
  seq.notes.reverse();
  seq.rests.reverse();
  return seq;
}

// fills array with a "square wave" which switces t times in l length
Schillinger.monomialPeriodicGroup = function(t, l) {
  var mpg = [], waveLength = l / t;
  for (var i = 0; i < l; i++) {
    mpg.push( (i % (waveLength*2)) < waveLength ? 1 : 0 );
  }
  return mpg;
}

// fills array with a "square wave" with a period of t(switches every t times)
Schillinger.monomialPeriodicGroup2 = function(t, l) {
  var mpg = [];
  for (var i = 0; i < l; i++) mpg.push( (i % (t*2)) < t ? 1 : 0 );
  return mpg;
}

Schillinger.interference = function(){ // takes two or more arguments
  var tab = [], io = 1;
  var args = utilities.argumentsToArray(arguments);
  var impulses = args.map(Schillinger.fromMonomialsToImpulse);
  var l = Math.min(...impulses.map(function(el){ return el.length; }))

  for (var i = 0; i < l; i++) {
    for(var ai = 0; ai < impulses.length; ai++){
      if( impulses[ai][i] == 1){
         io^=1; //xor flips 1=>0 0=>1
         break;
       }
    }
    tab.push(io);
  }

  return tab;
}

Schillinger.interferenceOfMonomials = function(){ // as many as you want
  var args = utilities.argumentsToArray(arguments);
  var cd = args.reduce(function(a,b){ return a * b; }); // commonDenominator

  var t = args.map( function(el){ return Schillinger.monomialPeriodicGroup(el, cd); } );

  return Schillinger.interference(...t);
}

Schillinger.generalInterferenceOfMonomials = function(){ // as many as you want
  var args = utilities.argumentsToArray(arguments);
  var cd = args.reduce(function(a,b){ return a * b; }); // commonDenominator

  var t = args.map( function(el){ return Schillinger.monomialPeriodicGroup2(el, cd); } );

  return Schillinger.interference(...t);
}

// converts binary rythm to delta notations
// example : 1 1 1 0 1 1 0 0 1 0 0 0 =>  3 1 2 2 1 3
Schillinger.seriesToNumerators = function( s ) {
  var indxs = [];
   // find all indexes of a switch beetween 0 and 1
  for (var i = 1; i < s.length; i++) if( s[i] !== s[i-1] ) indxs.push(i);
  indxs.push(i); // add last index for the length of last chunk
  return Schillinger.fromNotesToIntervals(indxs); // check distance beetween changes
}

Schillinger.newRythm = function(type,monomials){
  return Schillinger.seriesToNumerators(
    type === 'slow' ? Schillinger.interferenceOfMonomials(...monomials)
                    : Schillinger.generalInterferenceOfMonomials(...monomials));
}

Schillinger.fromMonomialsToImpulse = function(mono) {
  return mono.map(function(el,i,arr){
    return i == 0 ? 0 : Math.abs( arr[i-1] - el);
  });
}

// - - - - - - - note domain
Schillinger.fromNotesToIntervals = function(notes) {
  return notes.map(function(el,i,arr){
    return i == 0 ? el : el - arr[i-1];
  })
}

Schillinger.fromIntervalsToNotes = function(intervals) {
  var n = intervals[0];
  return intervals.map(function(el,i){
    return i == 0 ? n : n += el;
  });
}

Schillinger.multiplyIntervals = function(seq, multi){
  var intervals = Schillinger.fromNotesToIntervals(seq);

  intervals = intervals.map(function(el, indx) {
    return indx != 0 ? (el * multi) : el;
  });

  return Schillinger.fromIntervalsToNotes(intervals);
}
