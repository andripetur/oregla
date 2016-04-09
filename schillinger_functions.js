function Sequence( seq ) {
  this.notes = seq.notes || [];
  this.rests = seq.rests || [];
  this.playbar = 0;
  this.restCount = 0;
  this.metro = seq.metro || 500;
  this.toId = 0;
  this.bPlaying = seq.bPlying || false;
  this.synth = seq.synth || 'synth';
}

Sequence.prototype.do = function(seq){
  if (seq.restCount === seq.rests[seq.playbar % seq.rests.length]) {
    sound.playNote( seq.synth, flock.midiFreq(sound.lockToScale( seq.notes[seq.playbar%seq.notes.length] )) );
    seq.restCount = 0;
    seq.playbar++;
  }
  seq.restCount++;
}

Sequence.prototype.play = function(){
  this.bPlaying = true;
  this.toId = setInterval( this.do, this.metro, this );
}

Sequence.prototype.stop = function(){
  this.bPlaying = false;
  clearInterval(this.toId);
}

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

// fills array with a "square wave" with a period of t
Schillinger.monomialPeriodicGroup2 = function(t, l) {
  var mpg = [];
  for (var i = 0; i < l; i++) mpg.push( (i % (t*2)) < t ? 1 : 0 );
  return mpg;
}

Schillinger.interference = function(){ // takes two or more arguments
  var tab = [], io = 1;
  var args = utilities.argumentsToArray(arguments);
  var impulses = args.map(Schillinger.fromMonomialsToImpulse);
  // var l = Math.min.apply(this, impulses.map(function(el){ return el.length; }));
  var l = Math.min(...impulses.map(function(el){ return el.length; }))
  // console.log(l)

  for (var i = 0; i < l; i++) {
    for(var ai = 0; ai < impulses.length; ai++){
      if( impulses[ai][i] == 1){
         io^=1; //xor flips 1=>0 0=>1
         break;
       }
      // io^=impulses[ai][i];
    }
    tab.push(io);
  }

  return tab;
}

Schillinger.interferenceOfMonomials = function(){ // as many as you want
  var args = Array.prototype.slice.call(arguments);   // convert args to array
  var cd = args.reduce(function(a,b){ return a * b; }); // commonDenominator

  var t = args.map( function(el){ return Schillinger.monomialPeriodicGroup(el, cd); } );

  return Schillinger.interference(...t);
}

Schillinger.generalInterferenceOfMonomials = function(){ // as many as you want
  var args = Array.prototype.slice.call(arguments);   // convert args to array
  var cd = args.reduce(function(a,b){ return a * b; }); // commonDenominator

  var t = args.map( function(el){ return Schillinger.monomialPeriodicGroup2(el, cd); } );

  return Schillinger.interference(...t);
}

// converts binary rythm to delta notations
// example : 1 1 1 0 1 1 0 0 1 0 0 0 =>  3 1 2 2 1 3
Schillinger.seriesToNumerators = function( s ) {
  var cnt=0, numerators = [];

  for (var i = 0; i < s.length; i++) {
    for (var y = i; y < s.length; y++) {
      if( s[y] == s[i] ){
        cnt++;
        if( y == s.length-1 ){ // we reached the end of possible comparisons
          numerators.push( cnt );  //push counter
          i = s.length; // 'break' outer loop
          break;
        }
      } else {
        numerators.push( cnt )
        cnt = 0;
        i = y-1; // start comparing again from the right place
        break;
      }
    }
  }
  return numerators;
}

Schillinger.fromMonomialsToImpulse = function(mono) {
  return mono.map(function(el,i,arr){
    return i == 0 ? 0 : Math.abs( arr[i-1] - el);
  });
}

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

var somewhere = [0, 12, 11, 7, 9, 11, 12, 0, 9, 7];

// melodie for testing
var rainbow = new Sequence( {
  notes: Schillinger.multiplyIntervals( somewhere, 2).map(function(a){return a + 60;}),
  rests: Schillinger.seriesToNumerators( Schillinger.generalInterferenceOfMonomials(2,3,5))
});

var rainbow2 = new Sequence( {
  notes: somewhere.map(function(a){return a + 48;}),
  rests: Schillinger.seriesToNumerators( Schillinger.interferenceOfMonomials(2,3,5)),
  synth: 'synth2'
});

function st(){
  rainbow.play();
  rainbow2.play();
}
