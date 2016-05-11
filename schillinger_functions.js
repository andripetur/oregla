var Schillinger = null;

(function(){
  Schillinger = function(){}

  // fills array with a "square wave" which switces t times in l length
  var monomialPeriodicGroup = function(t, l) {
    var mpg = [], waveLength = l / t;
    for (var i = 0; i < l; i++) {
      mpg.push( (i % (waveLength*2)) < waveLength ? 1 : 0 );
    }
    return mpg;
  };

  // fills array with a "square wave" with a period of t(switches every t times)
  var monomialPeriodicGroup2 = function(t, l) {
    var mpg = [];
    for (var i = 0; i < l; i++) mpg.push( (i % (t*2)) < t ? 1 : 0 );
    return mpg;
  };

  var interference = function(){ // takes two or more arguments
    var tab = [], io = 1;
    var args = utilities.argumentsToArray(arguments);
    var impulses = args.map(fromMonomialsToImpulse);
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
  };

  var interferenceOfMonomials = function(){ // as many as you want, last determines type
    var args = utilities.argumentsToArray(arguments);
    var type = args.pop();
    var cd = args.reduce(function(a,b){ return a * b; }); // commonDenominator

    if(type === 'slow' ) {
      var t = args.map( function(el){ return monomialPeriodicGroup(el, cd); } ); // interference
    } else {
      var t = args.map( function(el){ return monomialPeriodicGroup2(el, cd); } ); // generalInterference
    }

    return interference(...t);
  };

  var fromMonomialsToImpulse = function(mono) {
    return mono.map(function(el,i,arr){
      return i == 0 ? 0 : Math.abs( arr[i-1] - el);
    });
  };

  // converts binary rythm to delta notations
  // example : 1 1 1 0 1 1 0 0 1 0 0 0 =>  3 1 2 2 1 3
  var seriesToNumerators = function( s ) {
    var indxs = [];
     // find all indexes of a switch beetween 0 and 1
    for (var i = 1; i < s.length; i++) if( s[i] !== s[i-1] ) indxs.push(i);
    indxs.push(i); // add last index for the length of last chunk
    return fromNotesToIntervals(indxs); // check distance beetween changes
  };

  var fromNotesToIntervals = function(notes) {
    return notes.map(function(el,i,arr){
      return i == 0 ? el : el - arr[i-1];
    });
  };

  var fromIntervalsToNotes = function(intervals) {
    var n = intervals[0];
    return intervals.map(function(el,i){
      return i == 0 ? n : n += el;
    });
  };

  var mirror = function(arr){
    var sortedArr = arr.slice(0,arr.length).sort(
      function(a,b){
        return a - b;
    });

    var revSortedSeq = sortedArr.slice(0,sortedArr.length).reverse();
    var dict = {};

    for (var i = 0; i < arr.length; i++) {
      dict[sortedArr[i]] = revSortedSeq[i];
      dict[revSortedSeq[i]] = sortedArr[i];
    }

    return arr.map(function(n){ return dict[n] });
  }

  // accessable to public
  Schillinger.prototype.newRhythm = function(type,monomials){
    var r = seriesToNumerators(interferenceOfMonomials(...monomials,type));

    if( typeof this.rhythm !== "undefined"){
       this.rhythm = r;
       return "new rhythm generated: " + r;
     } else {
       return r;
     }
  };

  Schillinger.prototype.reverse = function(){
    if( typeof this.rhythm !== "undefined") rhythm.reverse();
    if( typeof this.notes !== "undefined") notes.reverse();
    return "sequence reversed";
  };

  Schillinger.prototype.multiplyIntervals = function(multi){
    var intervals = fromNotesToIntervals(this.notes);

    intervals = intervals.map(function(el, indx) {
      return indx != 0 ? (el * multi) : el;
    });

    return fromIntervalsToNotes(intervals);
  };

  Schillinger.prototype.transpose = function(delta){
    this.notes = this.notes.map(function(n){ return n + delta; });
  };

  Schillinger.prototype.mirrorNotes = function(){
    this.notes = mirror(this.notes);
  };

  Schillinger.prototype.mirrorIntervals = function(){
    this.notes = fromIntervalsToNotes(mirror(fromNotesToIntervals(this.notes)));
  };

  Schillinger.prototype.mirrorRhythm = function(){
    this.rhythm = mirror(this.rhythm);
  };

})();

var schil = new Schillinger();
