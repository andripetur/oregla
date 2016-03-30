fluid.registerNamespace("utilities");

utilities.scale = function(i,il,ih,ol,oh) {
  return ((i - il) / (ih - il)) * (oh - ol) + ol;
}

utilities.limit = function(v, l, h ) {
   return ( v < l ) ? l : (( v > h ) ? h : v);
 }

utilities.max = function( arr ) {
  var m = 0;
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

utilities.round = function( toRound, val ) {
  return Math.floor(toRound / val) * val;
}

utilities.argumentsToArray = function(args){
  return Array.prototype.slice.call(args);
}
