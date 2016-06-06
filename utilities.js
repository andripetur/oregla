(function () {
  "use strict";
  fluid.registerNamespace("utilities");

  var randomStream = new Random(parseInt(Date().split(' ')[4].split(':').join(''))),
      random = function(){ return randomStream.random(); };

  // - - - - - - - - - - - - - - - - - - - - - - - - - Scaling and modifing nrs
  utilities.scale = function(i,il,ih,ol,oh) {
    return ((i - il) / (ih - il)) * (oh - ol) + ol;
  }

  utilities.scaleExp = function(i,il,ih,ol,oh) {
    var p = 0;
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
    return Math.floor(utilities.scale(random(), 0, 1, low, high));
  }

  utilities.randFloat = function(low, high) {
    return utilities.scale(random(), 0, 1, low, high);
  }

  utilities.seq = function( low, high, stepSize ){
    var seq=[], stepSize = stepSize || 1;
    for (var i = low; i < high+stepSize; i+=stepSize) seq.push(i);
    return seq;
  }

  var primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];

  utilities.randPrime = function(_underNth){
    var underNth = _underNth > primes.length-1 ? _underNth-1 : _underNth;
    return primes[utilities.randInt(0, underNth)];
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - Wondrous
  function makeWondrousArray(){
    var wondrous = [0], n, cntr;

    for (var i = 1; i < 128; i++) {
      cntr = 0;
      n = i;

      while (n !== 1) {
        if(n & 1){ // is odd
          n*=3;
          n++;
        } else {
          n*=0.5;
        }
        cntr++;
      }

      wondrous.push(cntr)
    }
    return wondrous;
  }

  // Calculate if not in localstorage
  if(typeof localStorage.wondrous === "undefined"){
    var wondrous = makeWondrousArray();
    localStorage.wondrous = wondrous;
  } else { // load from localstorage
    var wondrous = localStorage.wondrous.split(',').map(function(el){ return parseInt(el); });
  }

  utilities.howWonderous = function(nr){
    if(nr > 127) nr = 127;
    if(nr < 0) nr = 0;
    return wondrous[nr];
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - Misc
  utilities.copyObj = function(ob) {
    return Object.assign({}, coords);
  }

  utilities.copyArr = function(arr){
    return arr.slice(0, arr.length);
  }

  utilities.shiftArrRight = function(arr, steps){
    for (var i = 0; i < steps; i++) arr.push(arr.splice(0,1)[0]);
  }

  utilities.getTime = function(){
    return (new Date()).getTime();
  }

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

  utilities.swap = function(chars, i, j) {
    var tmp = chars[i];
    chars[i] = chars[j];
    chars[j] = tmp;
  }

  utilities.getAnagrams = function(input) {
    var counter = [],
        anagrams = [],
        chars = input.split(''),
        length = chars.length,
        i;

    for (i = 0; i < length; i++) counter[i] = 0;

    anagrams.push(input);
    i = 0;
    while (i < length) {
      if (counter[i] < i) {
        utilities.swap(chars, i % 2 === 1 ? counter[i] : 0, i);
        counter[i]++;
        i = 0;
        anagrams.push(chars.join(''));
      } else {
        counter[i] = 0;
        i++;
      }
    }

    var seen = {}; // remove duplicates
    return anagrams.filter(function(item) {
      return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
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
