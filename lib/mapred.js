var mapreduce = require('mapred')(); // Leave blank for max performance
//var mapreduce = require('mapred')(1); // 1 = single core version (slowest)
//var mapreduce = require('mapred')(3); // Use a cluster of 3 processes

// Information to process =====================================================

var information = [
    ['frase primera', 'primer trozo de informacion para procesado primer trozo'],
    ['segunda frase', 'segundo trozo de informacion trozo de'],
    ['cacho 3', 'otro trozo para ser procesado otro otro otro trozo'],
    ['cuarta frase', 'primer trozo de informacion para procesado primer trozo'],
    ['frase 5', 'segundo trozo de informacion trozo de'],
    ['sexto cacho', 'otro trozo para ser procesado otro otro otro trozo']
];

// User map implementation =====================================================

var map = function(key, value){
    var list = [], aux = {};
    value = value.split(' ');
    value.forEach(function(w){
        aux[w] = (aux[w] || 0) + 1;
    });
    for(var k in aux){
        list.push([k, aux[k]]);
    }
    return list;
};

// User reduce implementation =================================================

var reduce = function(key, values){
    var sum = 0;
    values.forEach(function(e){
        sum += e;
    });
    return sum;
};

// MapReduce call =============================================================

mapreduce(information, map, reduce, function(result){
    console.log(result);
});