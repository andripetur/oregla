var Schillinger = null;

(function(){
  "use strict";
  Schillinger = function(){}

  var monomialPeriodicGroup = function(t, l) {
  // fills array with a "square wave" which switces t times in l length
    var a = [], waveLength = l / t;
    for (var i=0; i<l; i++) a.push( (i % (waveLength*2)) < waveLength ? 1 : 0 );
    return a;
  };

  var monomialPeriodicGroup2 = function(t, l) {
  // fills array with a "square wave" with a period of t(switches every t times)
    var a = [];
    for (var i = 0; i < l; i++) a.push( (i % (t*2)) < t ? 1 : 0 );
    return a;
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
    var args = utilities.argumentsToArray(arguments),
        type = args.pop(),
        cd = args.reduce(function(a,b){ return a * b; }); // commonDenominator

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
      function(a,b){ return a - b;
    });

    var revSortedSeq = sortedArr.slice(0,sortedArr.length).reverse(),
        dict = {};

    for (var i = 0; i < arr.length; i++) {
      dict[sortedArr[i]] = revSortedSeq[i];
      dict[revSortedSeq[i]] = sortedArr[i];
    }

    return arr.map(function(n){ return dict[n] });
  }

  var sort = function(arr, type){
    var sortFunction;

    switch (type) {
      case "asc":
      case "ascending":
        sortFunction = function(a,b){
          return a - b;
        }
        break;
      case "desc":
      case "descending":
        sortFunction = function(a,b){
          return b - a;
        }
        break;

      case "avg-dev-asc":
      case "average-deviation-ascending":
        var avg = arr.reduce( function(a,b) { return a+b; })/arr.length;
        sortFunction = function(a,b){
          return Math.abs(avg - a) - Math.abs(avg - b);
        }
        break;
      case "avg-dev-desc":
      case "average-deviation-descending":
        var avg = arr.reduce( function(a,b) { return a+b; })/arr.length;
        sortFunction = function(a,b){
          return Math.abs(avg - b) - Math.abs(avg - a);
        }
        break;

      case "wond-asc":
      case "wondrous-ascending":
        sortFunction = function(a,b){
          return utilities.howWonderous(a) - utilities.howWonderous(b);
        }
        break;
      case "wond-desc":
      case "wondrous-descending":
        sortFunction = function(a,b){
          return utilities.howWonderous(b) - utilities.howWonderous(a);
        }
        break;
      // case "real-length":
      // case "realnumbers-length":
      //   var arr2 = [];
      //   for (var i = 0; i < arr.length; i+=2) {
      //     arr2.push(utilities.pythagoras( arr[i], arr[ i+1 < arr.length ? i+1 : 0 ] ));
      //   }
      //   sortFunction = function(a,b){
      //     return utilities.howWonderous(b) - utilities.howWonderous(a);
      //   }
      //   break;
    }

    return arr.sort(sortFunction);
  };

  // accessable to public
  Schillinger.prototype.newRhythm = function(_t,_m){
    var type = _t || "slow",
        monomials = _m || [utilities.randPrime(5),utilities.randPrime(10)],
        r = seriesToNumerators(interferenceOfMonomials(...monomials,type));

    if( typeof this.rhythm !== "undefined"){
       this.rhythm = r;
       this.beatCounter = 0;
       this.pos = 0;
       return "New "+type+" rhythm generated from monomials: "+monomials+"\n    " + r;
     } else {
       return r;
     }
  };

  Schillinger.prototype.reverse = function(which){
    if (typeof which !== "undefined") {
      if( typeof this[which] !== "undefined"){
        this[which].reverse();
        return which +" reversed.";
      } else {
        return "No "+ which +" to reverse.";
      }
    } else { // if no argument reverse whatever you have
      if( typeof this.rhythm !== "undefined") this.rhythm.reverse();
      if( typeof this.notes !== "undefined") this.notes.reverse();
      return 'Sequence reversed.'
    }
  };

  Schillinger.prototype.multiplyIntervals = function(multi){
    if(typeof multi === "undefined") return "Oeps, this function needs an argument."
    var intervals = fromNotesToIntervals(this.notes);

    intervals = intervals.map(function(el, indx) {
      var res = indx != 0 ? (el * multi) : el;
      return multi < 1 || utilities.isFloat(multi) ? Math.floor(res) : res;
    });

    this.notes = fromIntervalsToNotes(intervals);
    return "Intervals multiplied by: " + multi + "amount.";
  };

  Schillinger.prototype.transpose = function(_d){
    if(typeof _d === "undefined") return "Oeps, this function needs an argument.";
    var delta = _d;
    this.notes = this.notes.map(function(n){ return n + delta; });
    return "Transposed by: " + delta + " semitones";
  };

  Schillinger.prototype.clampToRange = function(low, high){
    //if note exceeds range, it's transposed an octave down until it reaches allowed range,
    // if note is below range ,transpose it up, into range
    if(typeof low === "undefined" || typeof high === "undefined") return "Oeps, this function needs two arguments."
    this.notes = this.notes.map( function( el ) {
      if( el < low ) {
        var octavesToMove = Math.ceil((low - el) / 12);
        return el + (12 * octavesToMove);
      } else if ( el > high ) {
        var octavesToMove = Math.ceil((el - high) / 12);
        return el - (12 * octavesToMove);
      } else {
        return el;
      }
    });
    return "Note range clamped to " + low + " and " + high + '.';
  }

  Schillinger.prototype.mirrorNotes = function(){
    this.notes = mirror(this.notes);
    return "Notes mirrored.";
  };

  Schillinger.prototype.mirrorIntervals = function(){
    this.notes = fromIntervalsToNotes(mirror(fromNotesToIntervals(this.notes)));
    return "Intervals mirrored.";
  };

  Schillinger.prototype.mirrorRhythm = function(){
    this.rhythm = mirror(this.rhythm);
    return "Rhythm mirrored."
  };

  Schillinger.prototype.sortNotes = function(type){
    this.notes = sort(this.notes, type);
    return "Notes sorted."
  };

  Schillinger.prototype.sortIntervals = function(type){
    this.notes = fromIntervalsToNotes(sort(fromNotesToIntervals(this.notes), type));
    return "Intervals sorted."
  };

  Schillinger.prototype.sortRhythm = function(type){
    this.rhythm = sort(this.rhythm, type);
    return "Rhythm sorted."
  };

})();
