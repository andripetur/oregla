(function () {
  fluid.registerNamespace("utilities");

  // - - - - - - - - - - - - - - - - - - - - - - - - - Scaling and modifing nrs
  utilities.scale = function(i,il,ih,ol,oh) {
    return ((i - il) / (ih - il)) * (oh - ol) + ol;
  }

  utilities.scaleExp = function(i,il,ih,ol,oh) {
    return ((p = ((i - il) / (ih - il))) * p) * (oh - ol) + ol;
  }

  utilities.limit = function(v, l, h ) {
     return ( v < l ) ? l : (( v > h ) ? h : v);
   }

  utilities.round = function( toRound, val ) {
    return Math.floor(toRound / val) * val;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - Number range enquiries
  utilities.max = function( arr ) {
    var m = -Number.MAX_VALUE;
    for (var i = 0; i < arr.length; i++) {
      if( arr[i] > m ) m = arr[i];
    }
    return m;
  }

  utilities.min = function( arr ) {
    var m = Number.MAX_VALUE;
    for (var i = 0; i < arr.length; i++) {
      if( arr[i] < m ) m = arr[i];
    }
    return m;
  }

  utilities.range = function( arr ){
    var high = -Number.MAX_VALUE;
    var low = Number.MAX_VALUE;
    for (var i = 0; i < arr.length; i++) {
      if( arr[i] < low ) low = arr[i];
      if( arr[i] > high ) high = arr[i];
    }
    return {low: low, high: high};
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - Random functions
  utilities.randInt = function(low, high) {
    return Math.floor(utilities.scale(Math.random(), 0, 1, low, high));
  }

  utilities.randFloat = function(low, high) {
    return utilities.scale(Math.random(), 0, 1, low, high);
  }

  utilities.seq = function( low, high, stepSize ){
    var seq=[];
    for (var i = low; i < high+stepSize; i+=stepSize) seq.push(i);
    return seq;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - Misc
  utilities.pythagoras = function(a,b) {
    return Math.sqrt((a*a) + (b*b));
  }

  utilities.isFloat = function(nr){
    return nr - Math.floor(nr) !== 0;
  }

  utilities.argumentsToArray = function(args){
    return Array.prototype.slice.call(args);
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - String stuff
  utilities.getAllIndexesOf = function( str, char ){
    var indices = [];
    for(var i=0; i<str.length;i++) {
      if (str[i] === char) indices.push(i);
    }
    return indices;
  }

  utilities.rightPad = function(str, length, padder) {
    var p = padder || ' ';
    for (var i = str.length; i < length; i++) str += p;
    return str;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - Timer
  var t1, t2;
  utilities.startTimer = function() {
    t1 = new Date().getTime();
    return t1;
  }

  utilities.stopTimer = function() {
    t2 = new Date().getTime();
    return t2 - t1;
  }
}());
