#!/usr/bin/env node

module.exports = main

// Helper functions

/** Roll [n]-d-[sides] floating point dice */
function dice(n, sides){
	var agg = 0
	while(n){
		agg += Math.random() * sides
		--n
	}
	return agg
}
module.exports.dice = dice

/** Pick one provided argument at random */
function randomPick(){
	var n = Math.floor(Math.random() * arguments.length)
	return arguments[n]
}
module.exports.randomPick = randomPick

/** Execute a periodic function, whose results will be logged */
function logRandomly(n, sides, fn){
	var ms = dice(n, sides) * 1000
	setTimeout(function(){
		var value = fn(ms)
		printObject(value)
		// loop
		logRandomly(n, sides, fn)
	}, ms)
}
module.exports.logRandomly = logRandomly

/** Print out an object to the console as JSON, stamping with the epoch and sinceLast epoch */
function printObject(value){
	// epoch metric
	var epoch = (new Date()).getTime()
	value.epoch = epoch
	value.sinceLast = epoch - lastEpoch
	lastEpoch = epoch

	// log
	console.log(JSON.stringify(value))
}
var lastEpoch = (new Date()).getTime()
module.exports.printObject = printObject


/// Start periodic loggers

/** Run an assortment of three semi-periodic loggers */
function periodicLoggers(){
	// frequent firing messages, "ticks", in "a" and "b" stream
	logRandomly(3, 12, function(ms){ return {waited: ms, responseTime: dice(2, 0.1), tick: true, stream: "a" }})
	logRandomly(3, 12, function(ms){ return {waited: ms, responseTime: dice(2, 0.08), tick: true, stream: "b" }})
	// slow firing messages, one on all streams, plus two others, one that is missing a bunch of the attributes
	logRandomly(3, 40, function(ms){ return {waited: ms, responseTime: dice(4, 0.2), tick: false, stream: randomPick("a", "b", "c", "d")}})
	logRandomly(3, 40, function(ms){ return {waited: ms, responseTime: dice(5, 0.25)}})
}
module.exports.periodicLoggers = periodicLoggers

/// Setup lifecycle handlers

/** Create a function which will print a status, then exit */
var terminator = function(code){
	return function(){
		printObject({status: "terminte", code: code})
		terminate = function(){}
		process.exit(0)
	}
}
module.exports.terminator = terminator

/** Log startup, shutdown. Handle SIGTERM, SIGINT. */
function lifecycleBinder(){
	// Handle SIGTERM and SIGINT
	process.on('SIGTERM', terminator("terminate"))
	process.on('SIGINT', terminator("interrupt"))
	
	// Print our startup status
	printObject({status: "startup"})
}
module.exports.lifecycleBinder = lifecycleBinder

/** Start periodic loggers, run lifecycle-bindings */
function main(){
	module.exports.periodicLoggers()
	module.exports.lifecycleBinder()
}
// already exposed as module.exports

/** If we are the executed module, run main */
if(require.main === module){
	module.exports()
}
