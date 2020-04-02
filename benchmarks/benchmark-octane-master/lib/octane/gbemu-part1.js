// Portions copyright 2013 Google, Inc

// Copyright (C) 2010 - 2012 Grant Galitz
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License version 2 as
// published by the Free Software Foundation.
// The full license is available at http://www.gnu.org/licenses/gpl.html
// This program is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
// See the GNU General Public License for more details.

// The code has been adapted for use as a benchmark by Google.

var GameboyBenchmark = new BenchmarkSuite('Gameboy', [26288412],
                                          [new Benchmark('Gameboy',
                                                         false,
                                                         false,
                                                         20,
                                                         runGameboy,
                                                         setupGameboy,
                                                         tearDownGameboy,
                                                         null,
                                                         4)]);

var decoded_gameboy_rom = null;

function setupGameboy() {

  // Check if all the types required by the code are supported.
  // If not, throw exception and quit.
  if (!(typeof Uint8Array != "undefined" &&
      typeof Int8Array != "undefined" &&
      typeof Float32Array != "undefined" &&
      typeof Int32Array != "undefined") ) {
    throw "TypedArrayUnsupported";
  }
  decoded_gameboy_rom = base64_decode(gameboy_rom);
  rom = null;
}

function runGameboy() {
  start(new GameBoyCanvas(), decoded_gameboy_rom);

  gameboy.instructions = 0;
  gameboy.totalInstructions = 250000;

  while (gameboy.instructions <= gameboy.totalInstructions) {
    gameboy.run();
    GameBoyAudioNode.run();
  }

  resetGlobalVariables();
}

function tearDownGameboy() {
  decoded_gameboy_rom = null;
  expectedGameboyStateStr = null;
}

var expectedGameboyStateStr =
  '{"registerA":160,"registerB":255,"registerC":255,"registerE":11,' +
  '"registersHL":51600,"programCounter":24309,"stackPointer":49706,' +
  '"sumROM":10171578,"sumMemory":3435856,"sumMBCRam":234598,"sumVRam":0}';

// Start of browser emulation.

var GameBoyWindow = { };

function GameBoyContext() {
  this.createBuffer = function() {
    return new Buffer();
  }
  this.createImageData = function (w, h) {
    var result = {};
    // The following line was updated since Octane 1.0 to avoid OOB access.
    result.data = new Uint8Array(w * h * 4);
    return result;
  }
  this.putImageData = function (buffer, x, y) {
    var sum = 0;
    for (var i = 0; i < buffer.data.length; i++) {
      sum += i * buffer.data[i];
      sum = sum % 1000;
    }
  }
  this.drawImage = function () { }
};

function GameBoyCanvas() {
  this.getContext = function() {
    return new GameBoyContext();
  }
  this.width = 160;
  this.height = 144;
  this.style = { visibility: "visibile" };
}

function cout(message, colorIndex) {
}

function clear_terminal() {
}

var GameBoyAudioNode = {
  bufferSize : 0,
  onaudioprocess : null ,
  connect : function () {},
  run: function() {
    var event = {outputBuffer : this.outputBuffer};
    this.onaudioprocess(event);
  }
};

function GameBoyAudioContext () {
  this.createBufferSource = function() {
    return { noteOn : function () {}, connect : function() {}};
  }
  this.sampleRate = 48000;
  this.destination = {}
  this.createBuffer = function (channels, len, sampleRate) {
    return { gain : 1,
             numberOfChannels : 1,
             length : 1,
             duration : 0.000020833333110203966,
             sampleRate : 48000}
  }
  this.createJavaScriptNode = function (bufferSize, inputChannels, outputChannels) {
    GameBoyAudioNode.bufferSize = bufferSize;
    GameBoyAudioNode.outputBuffer = {
        getChannelData : function (i) {return this.channelData[i];},
        channelData    : []
    };
    for (var i = 0; i < outputChannels; i++) {
      GameBoyAudioNode.outputBuffer.channelData[i] = new Float32Array(bufferSize);
    }
    return GameBoyAudioNode;
  }
}

var mock_date_time_counter = 0;

function new_Date() {
  return {
    getTime: function() {
      mock_date_time_counter += 16;
      return mock_date_time_counter;
    }
  };
}

// End of browser emulation.

// Start of helper functions.

function checkFinalState() {
  function sum(a) {
    var result = 0;
    for (var i = 0; i < a.length; i++) {
      result += a[i];
    }
    return result;
  }
  var state = {
    registerA: gameboy.registerA,
    registerB: gameboy.registerB,
    registerC: gameboy.registerC,
    registerE: gameboy.registerE,
    registerF: gameboy.registerF,
    registersHL: gameboy.registersHL,
    programCounter: gameboy.programCounter,
    stackPointer: gameboy.stackPointer,
    sumROM : sum(gameboy.fromTypedArray(gameboy.ROM)),
    sumMemory: sum(gameboy.fromTypedArray(gameboy.memory)),
    sumMBCRam: sum(gameboy.fromTypedArray(gameboy.MBCRam)),
    sumVRam: sum(gameboy.fromTypedArray(gameboy.VRam))
  }
  var stateStr = JSON.stringify(state);
  if (typeof expectedGameboyStateStr != "undefined") {
    if (stateStr != expectedGameboyStateStr) {
      alert("Incorrect final state of processor:\n" +
            " actual   " + stateStr + "\n" +
            " expected " + expectedGameboyStateStr);
    }
  } else {
    alert(stateStr);
  }
}


function resetGlobalVariables () {
  //Audio API Event Handler:
  audioContextHandle = null;
  audioNode = null;
  audioSource = null;
  launchedContext = false;
  audioContextSampleBuffer = [];
  resampled = [];
  webAudioMinBufferSize = 15000;
  webAudioMaxBufferSize = 25000;
  webAudioActualSampleRate = 44100;
  XAudioJSSampleRate = 0;
  webAudioMono = false;
  XAudioJSVolume = 1;
  resampleControl = null;
  audioBufferSize = 0;
  resampleBufferStart = 0;
  resampleBufferEnd = 0;
  resampleBufferSize = 2;

  gameboy = null;           //GameBoyCore object.
  gbRunInterval = null;       //GameBoyCore Timer
}


// End of helper functions.

// Original code from Grant Galitz follows.
// Modifications by Google are marked in comments.

// Start of js/other/base64.js file.

var toBase64 = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+" , "/", "="];
var fromBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function base64(data) {
  try {
    // The following line was modified for benchmarking:
    var base64 = GameBoyWindow.btoa(data);  //Use this native function when it's available, as it's a magnitude faster than the non-native code below.
  }
  catch (error) {
    //Defaulting to non-native base64 encoding...
    var base64 = "";
    var dataLength = data.length;
    if (dataLength > 0) {
      var bytes = [0, 0, 0];
      var index = 0;
      var remainder = dataLength % 3;
      while (data.length % 3 > 0) {
        //Make sure we don't do fuzzy math in the next loop...
        data[data.length] = " ";
      }
      while (index < dataLength) {
        //Keep this loop small for speed.
        bytes = [data.charCodeAt(index++) & 0xFF, data.charCodeAt(index++) & 0xFF, data.charCodeAt(index++) & 0xFF];
        base64 += toBase64[bytes[0] >> 2] + toBase64[((bytes[0] & 0x3) << 4) | (bytes[1] >> 4)] + toBase64[((bytes[1] & 0xF) << 2) | (bytes[2] >> 6)] + toBase64[bytes[2] & 0x3F];
      }
      if (remainder > 0) {
        //Fill in the padding and recalulate the trailing six-bit group...
        base64[base64.length - 1] = "=";
        if (remainder == 2) {
          base64[base64.length - 2] = "=";
          base64[base64.length - 3] = toBase64[(bytes[0] & 0x3) << 4];
        }
        else {
          base64[base64.length - 2] = toBase64[(bytes[1] & 0xF) << 2];
        }
      }
    }
  }
  return base64;
}
function base64_decode(data) {
  try {
    // The following line was modified for benchmarking:
    var decode64 = GameBoyWindow.atob(data);  //Use this native function when it's available, as it's a magnitude faster than the non-native code below.
  }
  catch (error) {
    //Defaulting to non-native base64 decoding...
    var decode64 = "";
    var dataLength = data.length;
    if (dataLength > 3 && dataLength % 4 == 0) {
      var sixbits = [0, 0, 0, 0];  //Declare this out of the loop, to speed up the ops.
      var index = 0;
      while (index < dataLength) {
        //Keep this loop small for speed.
        sixbits = [fromBase64.indexOf(data.charAt(index++)), fromBase64.indexOf(data.charAt(index++)), fromBase64.indexOf(data.charAt(index++)), fromBase64.indexOf(data.charAt(index++))];
        decode64 += String.fromCharCode((sixbits[0] << 2) | (sixbits[1] >> 4)) + String.fromCharCode(((sixbits[1] & 0x0F) << 4) | (sixbits[2] >> 2)) + String.fromCharCode(((sixbits[2] & 0x03) << 6) | sixbits[3]);
      }
      //Check for the '=' character after the loop, so we don't hose it up.
      if (sixbits[3] >= 0x40) {
        decode64.length -= 1;
        if (sixbits[2] >= 0x40) {
          decode64.length -= 1;
        }
      }
    }
  }
  return decode64;
}
function to_little_endian_dword(str) {
  return to_little_endian_word(str) + String.fromCharCode((str >> 16) & 0xFF, (str >> 24) & 0xFF);
}
function to_little_endian_word(str) {
  return to_byte(str) + String.fromCharCode((str >> 8) & 0xFF);
}
function to_byte(str) {
  return String.fromCharCode(str & 0xFF);
}
function arrayToBase64(arrayIn) {
  var binString = "";
  var length = arrayIn.length;
  for (var index = 0; index < length; ++index) {
    if (typeof arrayIn[index] == "number") {
      binString += String.fromCharCode(arrayIn[index]);
    }
  }
  return base64(binString);
}
function base64ToArray(b64String) {
  var binString = base64_decode(b64String);
  var outArray = [];
  var length = binString.length;
  for (var index = 0; index < length;) {
    outArray.push(binString.charCodeAt(index++) & 0xFF);
  }
  return outArray;
}

// End of js/other/base64.js file.

// Start of js/other/resampler.js file.

//JavaScript Audio Resampler (c) 2011 - Grant Galitz
function Resampler(fromSampleRate, toSampleRate, channels, outputBufferSize, noReturn) {
  this.fromSampleRate = fromSampleRate;
  this.toSampleRate = toSampleRate;
  this.channels = channels | 0;
  this.outputBufferSize = outputBufferSize;
  this.noReturn = !!noReturn;
  this.initialize();
}
Resampler.prototype.initialize = function () {
  //Perform some checks:
  if (this.fromSampleRate > 0 && this.toSampleRate > 0 && this.channels > 0) {
    if (this.fromSampleRate == this.toSampleRate) {
      //Setup a resampler bypass:
      this.resampler = this.bypassResampler;    //Resampler just returns what was passed through.
      this.ratioWeight = 1;
    }
    else {
      //Setup the interpolation resampler:
      this.compileInterpolationFunction();
      this.resampler = this.interpolate;      //Resampler is a custom quality interpolation algorithm.
      this.ratioWeight = this.fromSampleRate / this.toSampleRate;
      this.tailExists = false;
      this.lastWeight = 0;
      this.initializeBuffers();
    }
  }
  else {
    throw(new Error("Invalid settings specified for the resampler."));
  }
}
Resampler.prototype.compileInterpolationFunction = function () {
  var toCompile = "var bufferLength = Math.min(buffer.length, this.outputBufferSize);\
  if ((bufferLength % " + this.channels + ") == 0) {\
    if (bufferLength > 0) {\
      var ratioWeight = this.ratioWeight;\
      var weight = 0;";
  for (var channel = 0; channel < this.channels; ++channel) {
    toCompile += "var output" + channel + " = 0;"
  }
  toCompile += "var actualPosition = 0;\
      var amountToNext = 0;\
      var alreadyProcessedTail = !this.tailExists;\
      this.tailExists = false;\
      var outputBuffer = this.outputBuffer;\
      var outputOffset = 0;\
      var currentPosition = 0;\
      do {\
        if (alreadyProcessedTail) {\
          weight = ratioWeight;";
  for (channel = 0; channel < this.channels; ++channel) {
    toCompile += "output" + channel + " = 0;"
  }
  toCompile += "}\
        else {\
          weight = this.lastWeight;";
  for (channel = 0; channel < this.channels; ++channel) {
    toCompile += "output" + channel + " = this.lastOutput[" + channel + "];"
  }
  toCompile += "alreadyProcessedTail = true;\
        }\
        while (weight > 0 && actualPosition < bufferLength) {\
          amountToNext = 1 + actualPosition - currentPosition;\
          if (weight >= amountToNext) {";
  for (channel = 0; channel < this.channels; ++channel) {
    toCompile += "output" + channel + " += buffer[actualPosition++] * amountToNext;"
  }
  toCompile += "currentPosition = actualPosition;\
            weight -= amountToNext;\
          }\
          else {";
  for (channel = 0; channel < this.channels; ++channel) {
    toCompile += "output" + channel + " += buffer[actualPosition" + ((channel > 0) ? (" + " + channel) : "") + "] * weight;"
  }
  toCompile += "currentPosition += weight;\
            weight = 0;\
            break;\
          }\
        }\
        if (weight == 0) {";
  for (channel = 0; channel < this.channels; ++channel) {
    toCompile += "outputBuffer[outputOffset++] = output" + channel + " / ratioWeight;"
  }
  toCompile += "}\
        else {\
          this.lastWeight = weight;";
  for (channel = 0; channel < this.channels; ++channel) {
    toCompile += "this.lastOutput[" + channel + "] = output" + channel + ";"
  }
  toCompile += "this.tailExists = true;\
          break;\
        }\
      } while (actualPosition < bufferLength);\
      return this.bufferSlice(outputOffset);\
    }\
    else {\
      return (this.noReturn) ? 0 : [];\
    }\
  }\
  else {\
    throw(new Error(\"Buffer was of incorrect sample length.\"));\
  }";
  this.interpolate = Function("buffer", toCompile);
}
Resampler.prototype.bypassResampler = function (buffer) {
  if (this.noReturn) {
    //Set the buffer passed as our own, as we don't need to resample it:
    this.outputBuffer = buffer;
    return buffer.length;
  }
  else {
    //Just return the buffer passsed:
    return buffer;
  }
}
Resampler.prototype.bufferSlice = function (sliceAmount) {
  if (this.noReturn) {
    //If we're going to access the properties directly from this object:
    return sliceAmount;
  }
  else {
    //Typed array and normal array buffer section referencing:
    try {
      return this.outputBuffer.subarray(0, sliceAmount);
    }
    catch (error) {
      try {
        //Regular array pass:
        this.outputBuffer.length = sliceAmount;
        return this.outputBuffer;
      }
      catch (error) {
        //Nightly Firefox 4 used to have the subarray function named as slice:
        return this.outputBuffer.slice(0, sliceAmount);
      }
    }
  }
}
Resampler.prototype.initializeBuffers = function () {
  //Initialize the internal buffer:
  try {
    this.outputBuffer = new Float32Array(this.outputBufferSize);
    this.lastOutput = new Float32Array(this.channels);
  }
  catch (error) {
    this.outputBuffer = [];
    this.lastOutput = [];
  }
}

// End of js/other/resampler.js file.

// Start of js/other/XAudioServer.js file.

/*Initialize here first:
  Example:
    Stereo audio with a sample rate of 70 khz, a minimum buffer of 15000 samples total, a maximum buffer of 25000 samples total and a starting volume level of 1.
      var parentObj = this;
      this.audioHandle = new XAudioServer(2, 70000, 15000, 25000, function (sampleCount) {
        return parentObj.audioUnderRun(sampleCount);
      }, 1);

  The callback is passed the number of samples requested, while it can return any number of samples it wants back.
*/
function XAudioServer(channels, sampleRate, minBufferSize, maxBufferSize, underRunCallback, volume) {
  this.audioChannels = (channels == 2) ? 2 : 1;
  webAudioMono = (this.audioChannels == 1);
  XAudioJSSampleRate = (sampleRate > 0 && sampleRate <= 0xFFFFFF) ? sampleRate : 44100;
  webAudioMinBufferSize = (minBufferSize >= (samplesPerCallback << 1) && minBufferSize < maxBufferSize) ? (minBufferSize & ((webAudioMono) ? 0xFFFFFFFF : 0xFFFFFFFE)) : (samplesPerCallback << 1);
  webAudioMaxBufferSize = (Math.floor(maxBufferSize) > webAudioMinBufferSize + this.audioChannels) ? (maxBufferSize & ((webAudioMono) ? 0xFFFFFFFF : 0xFFFFFFFE)) : (minBufferSize << 1);
  this.underRunCallback = (typeof underRunCallback == "function") ? underRunCallback : function () {};
  XAudioJSVolume = (volume >= 0 && volume <= 1) ? volume : 1;
  this.audioType = -1;
  this.mozAudioTail = [];
  this.audioHandleMoz = null;
  this.audioHandleFlash = null;
  this.flashInitialized = false;
  this.mozAudioFound = false;
  this.initializeAudio();
}
XAudioServer.prototype.MOZWriteAudio = function (buffer) {
  //mozAudio:
  this.MOZWriteAudioNoCallback(buffer);
  this.MOZExecuteCallback();
}
XAudioServer.prototype.MOZWriteAudioNoCallback = function (buffer) {
  //mozAudio:
  this.writeMozAudio(buffer);
}
XAudioServer.prototype.callbackBasedWriteAudio = function (buffer) {
  //Callback-centered audio APIs:
  this.callbackBasedWriteAudioNoCallback(buffer);
  this.callbackBasedExecuteCallback();
}
XAudioServer.prototype.callbackBasedWriteAudioNoCallback = function (buffer) {
  //Callback-centered audio APIs:
  var length = buffer.length;
  for (var bufferCounter = 0; bufferCounter < length && audioBufferSize < webAudioMaxBufferSize;) {
    audioContextSampleBuffer[audioBufferSize++] = buffer[bufferCounter++];
  }
}
/*Pass your samples into here!
Pack your samples as a one-dimenional array
With the channel samplea packed uniformly.
examples:
    mono - [left, left, left, left]
    stereo - [left, right, left, right, left, right, left, right]
*/
XAudioServer.prototype.writeAudio = function (buffer) {
  if (this.audioType == 0) {
    this.MOZWriteAudio(buffer);
  }
  else if (this.audioType == 1) {
    this.callbackBasedWriteAudio(buffer);
  }
  else if (this.audioType == 2) {
    if (this.checkFlashInit() || launchedContext) {
      this.callbackBasedWriteAudio(buffer);
    }
    else if (this.mozAudioFound) {
      this.MOZWriteAudio(buffer);
    }
  }
}
/*Pass your samples into here if you don't want automatic callback calling:
Pack your samples as a one-dimenional array
With the channel samplea packed uniformly.
examples:
    mono - [left, left, left, left]
    stereo - [left, right, left, right, left, right, left, right]
Useful in preventing infinite recursion issues with calling writeAudio inside your callback.
*/
XAudioServer.prototype.writeAudioNoCallback = function (buffer) {
  if (this.audioType == 0) {
    this.MOZWriteAudioNoCallback(buffer);
  }
  else if (this.audioType == 1) {
    this.callbackBasedWriteAudioNoCallback(buffer);
  }
  else if (this.audioType == 2) {
    if (this.checkFlashInit() || launchedContext) {
      this.callbackBasedWriteAudioNoCallback(buffer);
    }
    else if (this.mozAudioFound) {
      this.MOZWriteAudioNoCallback(buffer);
    }
  }
}
//Developer can use this to see how many samples to write (example: minimum buffer allotment minus remaining samples left returned from this function to make sure maximum buffering is done...)
//If -1 is returned, then that means metric could not be done.
XAudioServer.prototype.remainingBuffer = function () {
  if (this.audioType == 0) {
    //mozAudio:
    return this.samplesAlreadyWritten - this.audioHandleMoz.mozCurrentSampleOffset();
  }
  else if (this.audioType == 1) {
    //WebKit Audio:
    return (((resampledSamplesLeft() * resampleControl.ratioWeight) >> (this.audioChannels - 1)) << (this.audioChannels - 1)) + audioBufferSize;
  }
  else if (this.audioType == 2) {
    if (this.checkFlashInit() || launchedContext) {
      //Webkit Audio / Flash Plugin Audio:
      return (((resampledSamplesLeft() * resampleControl.ratioWeight) >> (this.audioChannels - 1)) << (this.audioChannels - 1)) + audioBufferSize;
    }
    else if (this.mozAudioFound) {
      //mozAudio:
      return this.samplesAlreadyWritten - this.audioHandleMoz.mozCurrentSampleOffset();
    }
  }
  //Default return:
  return 0;
}
XAudioServer.prototype.MOZExecuteCallback = function () {
  //mozAudio:
  var samplesRequested = webAudioMinBufferSize - this.remainingBuffer();
  if (samplesRequested > 0) {
    this.writeMozAudio(this.underRunCallback(samplesRequested));
  }
}
XAudioServer.prototype.callbackBasedExecuteCallback = function () {
  //WebKit /Flash Audio:
  var samplesRequested = webAudioMinBufferSize - this.remainingBuffer();
  if (samplesRequested > 0) {
    this.callbackBasedWriteAudioNoCallback(this.underRunCallback(samplesRequested));
  }
}
//If you just want your callback called for any possible refill (Execution of callback is still conditional):
XAudioServer.prototype.executeCallback = function () {
  if (this.audioType == 0) {
    this.MOZExecuteCallback();
  }
  else if (this.audioType == 1) {
    this.callbackBasedExecuteCallback();
  }
  else if (this.audioType == 2) {
    if (this.checkFlashInit() || launchedContext) {
      this.callbackBasedExecuteCallback();
    }
    else if (this.mozAudioFound) {
      this.MOZExecuteCallback();
    }
  }
}
//DO NOT CALL THIS, the lib calls this internally!
XAudioServer.prototype.initializeAudio = function () {
  try {
    throw (new Error("Select initializeWebAudio case"));  // Line added for benchmarking.
    this.preInitializeMozAudio();
    if (navigator.platform == "Linux i686") {
      //Block out mozaudio usage for Linux Firefox due to moz bugs:
      throw(new Error(""));
    }
    this.initializeMozAudio();
  }
  catch (error) {
    try {
      this.initializeWebAudio();
    }
    catch (error) {
      try {
        this.initializeFlashAudio();
      }
      catch (error) {
        throw(new Error("Browser does not support real time audio output."));
      }
    }
  }
}
XAudioServer.prototype.preInitializeMozAudio = function () {
  //mozAudio - Synchronous Audio API
  this.audioHandleMoz = new Audio();
  this.audioHandleMoz.mozSetup(this.audioChannels, XAudioJSSampleRate);
  this.samplesAlreadyWritten = 0;
  var emptySampleFrame = (this.audioChannels == 2) ? [0, 0] : [0];
  var prebufferAmount = 0;
  if (navigator.platform != "MacIntel" && navigator.platform != "MacPPC") {  //Mac OS X doesn't experience this moz-bug!
    while (this.audioHandleMoz.mozCurrentSampleOffset() == 0) {
      //Mozilla Audio Bugginess Workaround (Firefox freaks out if we don't give it a prebuffer under certain OSes):
      prebufferAmount += this.audioHandleMoz.mozWriteAudio(emptySampleFrame);
    }
    var samplesToDoubleBuffer = prebufferAmount / this.audioChannels;
    //Double the prebuffering for windows:
    for (var index = 0; index < samplesToDoubleBuffer; index++) {
      this.samplesAlreadyWritten += this.audioHandleMoz.mozWriteAudio(emptySampleFrame);
    }
  }
  this.samplesAlreadyWritten += prebufferAmount;
  webAudioMinBufferSize += this.samplesAlreadyWritten;
  this.mozAudioFound = true;
}
XAudioServer.prototype.initializeMozAudio = function () {
  //Fill in our own buffering up to the minimum specified:
  this.writeMozAudio(getFloat32(webAudioMinBufferSize));
  this.audioType = 0;
}
XAudioServer.prototype.initializeWebAudio = function () {
  if (launchedContext) {
    resetCallbackAPIAudioBuffer(webAudioActualSampleRate, samplesPerCallback);
    this.audioType = 1;
  }
  else {
    throw(new Error(""));
  }
}
XAudioServer.prototype.initializeFlashAudio = function () {
  var existingFlashload = document.getElementById("XAudioJS");
  if (existingFlashload == null) {
    var thisObj = this;
    var mainContainerNode = document.createElement("div");
    mainContainerNode.setAttribute("style", "position: fixed; bottom: 0px; right: 0px; margin: 0px; padding: 0px; border: none; width: 8px; height: 8px; overflow: hidden; z-index: -1000; ");
    var containerNode = document.createElement("div");
    containerNode.setAttribute("style", "position: static; border: none; width: 0px; height: 0px; visibility: hidden; margin: 8px; padding: 0px;");
    containerNode.setAttribute("id", "XAudioJS");
    mainContainerNode.appendChild(containerNode);
    document.getElementsByTagName("body")[0].appendChild(mainContainerNode);
    swfobject.embedSWF(
      "XAudioJS.swf",
      "XAudioJS",
      "8",
      "8",
      "9.0.0",
      "",
      {},
      {"allowscriptaccess":"always"},
      {"style":"position: static; visibility: hidden; margin: 8px; padding: 0px; border: none"},
      function (event) {
        if (event.success) {
          thisObj.audioHandleFlash = event.ref;
        }
        else {
          thisObj.audioType = 1;
        }
      }
    );
  }
  else {
    this.audioHandleFlash = existingFlashload;
  }
  this.audioType = 2;
}
XAudioServer.prototype.changeVolume = function (newVolume) {
  if (newVolume >= 0 && newVolume <= 1) {
    XAudioJSVolume = newVolume;
    if (this.checkFlashInit()) {
      this.audioHandleFlash.changeVolume(XAudioJSVolume);
    }
    if (this.mozAudioFound) {
      this.audioHandleMoz.volume = XAudioJSVolume;
    }
  }
}
//Moz Audio Buffer Writing Handler:
XAudioServer.prototype.writeMozAudio = function (buffer) {
  var length = this.mozAudioTail.length;
  if (length > 0) {
    var samplesAccepted = this.audioHandleMoz.mozWriteAudio(this.mozAudioTail);
    this.samplesAlreadyWritten += samplesAccepted;
    this.mozAudioTail.splice(0, samplesAccepted);
  }
  length = Math.min(buffer.length, webAudioMaxBufferSize - this.samplesAlreadyWritten + this.audioHandleMoz.mozCurrentSampleOffset());
  var samplesAccepted = this.audioHandleMoz.mozWriteAudio(buffer);
  this.samplesAlreadyWritten += samplesAccepted;
  for (var index = 0; length > samplesAccepted; --length) {
    //Moz Audio wants us saving the tail:
    this.mozAudioTail.push(buffer[index++]);
  }
}
//Checks to see if the NPAPI Adobe Flash bridge is ready yet:
XAudioServer.prototype.checkFlashInit = function () {
  if (!this.flashInitialized && this.audioHandleFlash && this.audioHandleFlash.initialize) {
    this.flashInitialized = true;
    this.audioHandleFlash.initialize(this.audioChannels, XAudioJSVolume);
    resetCallbackAPIAudioBuffer(44100, samplesPerCallback);
  }
  return this.flashInitialized;
}
/////////END LIB
function getFloat32(size) {
  try {
    return new Float32Array(size);
  }
  catch (error) {
    return new Array(size);
  }
}
function getFloat32Flat(size) {
  try {
    var newBuffer = new Float32Array(size);
  }
  catch (error) {
    var newBuffer = new Array(size);
    var audioSampleIndice = 0;
    do {
      newBuffer[audioSampleIndice] = 0;
    } while (++audioSampleIndice < size);
  }
  return newBuffer;
}
//Flash NPAPI Event Handler:
var samplesPerCallback = 2048;      //Has to be between 2048 and 4096 (If over, then samples are ignored, if under then silence is added).
var outputConvert = null;
function audioOutputFlashEvent() {    //The callback that flash calls...
  resampleRefill();
  return outputConvert();
}
function generateFlashStereoString() {  //Convert the arrays to one long string for speed.
  var copyBinaryStringLeft = "";
  var copyBinaryStringRight = "";
  for (var index = 0; index < samplesPerCallback && resampleBufferStart != resampleBufferEnd; ++index) {
    //Sanitize the buffer:
    copyBinaryStringLeft += String.fromCharCode(((Math.min(Math.max(resampled[resampleBufferStart++] + 1, 0), 2) * 0x3FFF) | 0) + 0x3000);
    copyBinaryStringRight += String.fromCharCode(((Math.min(Math.max(resampled[resampleBufferStart++] + 1, 0), 2) * 0x3FFF) | 0) + 0x3000);
    if (resampleBufferStart == resampleBufferSize) {
      resampleBufferStart = 0;
    }
  }
  return copyBinaryStringLeft + copyBinaryStringRight;
}
function generateFlashMonoString() {  //Convert the array to one long string for speed.
  var copyBinaryString = "";
  for (var index = 0; index < samplesPerCallback && resampleBufferStart != resampleBufferEnd; ++index) {
    //Sanitize the buffer:
    copyBinaryString += String.fromCharCode(((Math.min(Math.max(resampled[resampleBufferStart++] + 1, 0), 2) * 0x3FFF) | 0) + 0x3000);
    if (resampleBufferStart == resampleBufferSize) {
      resampleBufferStart = 0;
    }
  }
  return copyBinaryString;
}
//Audio API Event Handler:
var audioContextHandle = null;
var audioNode = null;
var audioSource = null;
var launchedContext = false;
var audioContextSampleBuffer = [];
var resampled = [];
var webAudioMinBufferSize = 15000;
var webAudioMaxBufferSize = 25000;
var webAudioActualSampleRate = 44100;
var XAudioJSSampleRate = 0;
var webAudioMono = false;
var XAudioJSVolume = 1;
var resampleControl = null;
var audioBufferSize = 0;
var resampleBufferStart = 0;
var resampleBufferEnd = 0;
var resampleBufferSize = 2;
function audioOutputEvent(event) {    //Web Audio API callback...
  var index = 0;
  var buffer1 = event.outputBuffer.getChannelData(0);
  var buffer2 = event.outputBuffer.getChannelData(1);
  resampleRefill();
  if (!webAudioMono) {
    //STEREO:
    while (index < samplesPerCallback && resampleBufferStart != resampleBufferEnd) {
      buffer1[index] = resampled[resampleBufferStart++] * XAudioJSVolume;
      buffer2[index++] = resampled[resampleBufferStart++] * XAudioJSVolume;
      if (resampleBufferStart == resampleBufferSize) {
        resampleBufferStart = 0;
      }
    }
  }
  else {
    //MONO:
    while (index < samplesPerCallback && resampleBufferStart != resampleBufferEnd) {
      buffer2[index] = buffer1[index] = resampled[resampleBufferStart++] * XAudioJSVolume;
      ++index;
      if (resampleBufferStart == resampleBufferSize) {
        resampleBufferStart = 0;
      }
    }
  }
  //Pad with silence if we're underrunning:
  while (index < samplesPerCallback) {
    buffer2[index] = buffer1[index] = 0;
    ++index;
  }
}
function resampleRefill() {
  if (audioBufferSize > 0) {
    //Resample a chunk of audio:
    var resampleLength = resampleControl.resampler(getBufferSamples());
    var resampledResult = resampleControl.outputBuffer;
    for (var index2 = 0; index2 < resampleLength; ++index2) {
      resampled[resampleBufferEnd++] = resampledResult[index2];
      if (resampleBufferEnd == resampleBufferSize) {
        resampleBufferEnd = 0;
      }
      if (resampleBufferStart == resampleBufferEnd) {
        ++resampleBufferStart;
        if (resampleBufferStart == resampleBufferSize) {
          resampleBufferStart = 0;
        }
      }
    }
    audioBufferSize = 0;
  }
}
function resampledSamplesLeft() {
  return ((resampleBufferStart <= resampleBufferEnd) ? 0 : resampleBufferSize) + resampleBufferEnd - resampleBufferStart;
}
function getBufferSamples() {
  //Typed array and normal array buffer section referencing:
  try {
    return audioContextSampleBuffer.subarray(0, audioBufferSize);
  }
  catch (error) {
    try {
      //Regular array pass:
      audioContextSampleBuffer.length = audioBufferSize;
      return audioContextSampleBuffer;
    }
    catch (error) {
      //Nightly Firefox 4 used to have the subarray function named as slice:
      return audioContextSampleBuffer.slice(0, audioBufferSize);
    }
  }
}
//Initialize WebKit Audio /Flash Audio Buffer:
function resetCallbackAPIAudioBuffer(APISampleRate, bufferAlloc) {
  audioContextSampleBuffer = getFloat32(webAudioMaxBufferSize);
  audioBufferSize = webAudioMaxBufferSize;
  resampleBufferStart = 0;
  resampleBufferEnd = 0;
  resampleBufferSize = Math.max(webAudioMaxBufferSize * Math.ceil(XAudioJSSampleRate / APISampleRate), samplesPerCallback) << 1;
  if (webAudioMono) {
    //MONO Handling:
    resampled = getFloat32Flat(resampleBufferSize);
    resampleControl = new Resampler(XAudioJSSampleRate, APISampleRate, 1, resampleBufferSize, true);
    outputConvert = generateFlashMonoString;
  }
  else {
    //STEREO Handling:
    resampleBufferSize  <<= 1;
    resampled = getFloat32Flat(resampleBufferSize);
    resampleControl = new Resampler(XAudioJSSampleRate, APISampleRate, 2, resampleBufferSize, true);
    outputConvert = generateFlashStereoString;
  }
}
//Initialize WebKit Audio:
(function () {
  if (!launchedContext) {
    try {
      // The following line was modified for benchmarking:
      audioContextHandle = new GameBoyAudioContext();              //Create a system audio context.
    }
    catch (error) {
      try {
        audioContextHandle = new AudioContext();                //Create a system audio context.
      }
      catch (error) {
        return;
      }
    }
    try {
      audioSource = audioContextHandle.createBufferSource();            //We need to create a false input to get the chain started.
      audioSource.loop = false;  //Keep this alive forever (Event handler will know when to ouput.)
      XAudioJSSampleRate = webAudioActualSampleRate = audioContextHandle.sampleRate;
      audioSource.buffer = audioContextHandle.createBuffer(1, 1, webAudioActualSampleRate);  //Create a zero'd input buffer for the input to be valid.
      audioNode = audioContextHandle.createJavaScriptNode(samplesPerCallback, 1, 2);      //Create 2 outputs and ignore the input buffer (Just copy buffer 1 over if mono)
      audioNode.onaudioprocess = audioOutputEvent;                //Connect the audio processing event to a handling function so we can manipulate output
      audioSource.connect(audioNode);                        //Send and chain the input to the audio manipulation.
      audioNode.connect(audioContextHandle.destination);              //Send and chain the output of the audio manipulation to the system audio output.
      audioSource.noteOn(0);                            //Start the loop!
    }
    catch (error) {
      return;
    }
    launchedContext = true;
  }
})();

// End of js/other/XAudioServer.js file.

// Start of js/other/resize.js file.

//JavaScript Image Resizer (c) 2012 - Grant Galitz
function Resize(widthOriginal, heightOriginal, targetWidth, targetHeight, blendAlpha, interpolationPass) {
  this.widthOriginal = Math.abs(parseInt(widthOriginal) || 0);
  this.heightOriginal = Math.abs(parseInt(heightOriginal) || 0);
  this.targetWidth = Math.abs(parseInt(targetWidth) || 0);
  this.targetHeight = Math.abs(parseInt(targetHeight) || 0);
  this.colorChannels = (!!blendAlpha) ? 4 : 3;
  this.interpolationPass = !!interpolationPass;
  this.targetWidthMultipliedByChannels = this.targetWidth * this.colorChannels;
  this.originalWidthMultipliedByChannels = this.widthOriginal * this.colorChannels;
  this.originalHeightMultipliedByChannels = this.heightOriginal * this.colorChannels;
  this.widthPassResultSize = this.targetWidthMultipliedByChannels * this.heightOriginal;
  this.finalResultSize = this.targetWidthMultipliedByChannels * this.targetHeight;
  this.initialize();
}
Resize.prototype.initialize = function () {
  //Perform some checks:
  if (this.widthOriginal > 0 && this.heightOriginal > 0 && this.targetWidth > 0 && this.targetHeight > 0) {
    if (this.widthOriginal == this.targetWidth) {
      //Bypass the width resizer pass:
      this.resizeWidth = this.bypassResizer;
    }
    else {
      //Setup the width resizer pass:
      this.ratioWeightWidthPass = this.widthOriginal / this.targetWidth;
      if (this.ratioWeightWidthPass < 1 && this.interpolationPass) {
        this.initializeFirstPassBuffers(true);
        this.resizeWidth = (this.colorChannels == 4) ? this.resizeWidthInterpolatedRGBA : this.resizeWidthInterpolatedRGB;
      }
      else {
        this.initializeFirstPassBuffers(false);
        this.resizeWidth = (this.colorChannels == 4) ? this.resizeWidthRGBA : this.resizeWidthRGB;
      }
    }
    if (this.heightOriginal == this.targetHeight) {
      //Bypass the height resizer pass:
      this.resizeHeight = this.bypassResizer;
    }
    else {
      //Setup the height resizer pass:
      this.ratioWeightHeightPass = this.heightOriginal / this.targetHeight;
      if (this.ratioWeightHeightPass < 1 && this.interpolationPass) {
        this.initializeSecondPassBuffers(true);
        this.resizeHeight = this.resizeHeightInterpolated;
      }
      else {
        this.initializeSecondPassBuffers(false);
        this.resizeHeight = (this.colorChannels == 4) ? this.resizeHeightRGBA : this.resizeHeightRGB;
      }
    }
  }
  else {
    throw(new Error("Invalid settings specified for the resizer."));
  }
}
Resize.prototype.resizeWidthRGB = function (buffer) {
  var ratioWeight = this.ratioWeightWidthPass;
  var weight = 0;
  var amountToNext = 0;
  var actualPosition = 0;
  var currentPosition = 0;
  var line = 0;
  var pixelOffset = 0;
  var outputOffset = 0;
  var nextLineOffsetOriginalWidth = this.originalWidthMultipliedByChannels - 2;
  var nextLineOffsetTargetWidth = this.targetWidthMultipliedByChannels - 2;
  var output = this.outputWidthWorkBench;
  var outputBuffer = this.widthBuffer;
  do {
    for (line = 0; line < this.originalHeightMultipliedByChannels;) {
      output[line++] = 0;
      output[line++] = 0;
      output[line++] = 0;
    }
    weight = ratioWeight;
    do {
      amountToNext = 1 + actualPosition - currentPosition;
      if (weight >= amountToNext) {
        for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
          output[line++] += buffer[pixelOffset++] * amountToNext;
          output[line++] += buffer[pixelOffset++] * amountToNext;
          output[line++] += buffer[pixelOffset] * amountToNext;
        }
        currentPosition = actualPosition = actualPosition + 3;
        weight -= amountToNext;
      }
      else {
        for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
          output[line++] += buffer[pixelOffset++] * weight;
          output[line++] += buffer[pixelOffset++] * weight;
          output[line++] += buffer[pixelOffset] * weight;
        }
        currentPosition += weight;
        break;
      }
    } while (weight > 0 && actualPosition < this.originalWidthMultipliedByChannels);
    for (line = 0, pixelOffset = outputOffset; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetTargetWidth) {
      outputBuffer[pixelOffset++] = output[line++] / ratioWeight;
      outputBuffer[pixelOffset++] = output[line++] / ratioWeight;
      outputBuffer[pixelOffset] = output[line++] / ratioWeight;
    }
    outputOffset += 3;
  } while (outputOffset < this.targetWidthMultipliedByChannels);
  return outputBuffer;
}
Resize.prototype.resizeWidthInterpolatedRGB = function (buffer) {
  var ratioWeight = (this.widthOriginal - 1) / this.targetWidth;
  var weight = 0;
  var finalOffset = 0;
  var pixelOffset = 0;
  var outputBuffer = this.widthBuffer;
  for (var targetPosition = 0; targetPosition < this.targetWidthMultipliedByChannels; targetPosition += 3, weight += ratioWeight) {
    //Calculate weightings:
    secondWeight = weight % 1;
    firstWeight = 1 - secondWeight;
    //Interpolate:
    for (finalOffset = targetPosition, pixelOffset = Math.floor(weight) * 3; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
      outputBuffer[finalOffset] = (buffer[pixelOffset] * firstWeight) + (buffer[pixelOffset + 3] * secondWeight);
      outputBuffer[finalOffset + 1] = (buffer[pixelOffset + 1] * firstWeight) + (buffer[pixelOffset + 4] * secondWeight);
      outputBuffer[finalOffset + 2] = (buffer[pixelOffset + 2] * firstWeight) + (buffer[pixelOffset + 5] * secondWeight);
    }
  }
  return outputBuffer;
}
Resize.prototype.resizeWidthRGBA = function (buffer) {
  var ratioWeight = this.ratioWeightWidthPass;
  var weight = 0;
  var amountToNext = 0;
  var actualPosition = 0;
  var currentPosition = 0;
  var line = 0;
  var pixelOffset = 0;
  var outputOffset = 0;
  var nextLineOffsetOriginalWidth = this.originalWidthMultipliedByChannels - 3;
  var nextLineOffsetTargetWidth = this.targetWidthMultipliedByChannels - 3;
  var output = this.outputWidthWorkBench;
  var outputBuffer = this.widthBuffer;
  do {
    for (line = 0; line < this.originalHeightMultipliedByChannels;) {
      output[line++] = 0;
      output[line++] = 0;
      output[line++] = 0;
      output[line++] = 0;
    }
    weight = ratioWeight;
    do {
      amountToNext = 1 + actualPosition - currentPosition;
      if (weight >= amountToNext) {
        for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
          output[line++] += buffer[pixelOffset++] * amountToNext;
          output[line++] += buffer[pixelOffset++] * amountToNext;
          output[line++] += buffer[pixelOffset++] * amountToNext;
          output[line++] += buffer[pixelOffset] * amountToNext;
        }
        currentPosition = actualPosition = actualPosition + 4;
        weight -= amountToNext;
      }
      else {
        for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
          output[line++] += buffer[pixelOffset++] * weight;
          output[line++] += buffer[pixelOffset++] * weight;
          output[line++] += buffer[pixelOffset++] * weight;
          output[line++] += buffer[pixelOffset] * weight;
        }
        currentPosition += weight;
        break;
      }
    } while (weight > 0 && actualPosition < this.originalWidthMultipliedByChannels);
    for (line = 0, pixelOffset = outputOffset; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetTargetWidth) {
      outputBuffer[pixelOffset++] = output[line++] / ratioWeight;
      outputBuffer[pixelOffset++] = output[line++] / ratioWeight;
      outputBuffer[pixelOffset++] = output[line++] / ratioWeight;
      outputBuffer[pixelOffset] = output[line++] / ratioWeight;
    }
    outputOffset += 4;
  } while (outputOffset < this.targetWidthMultipliedByChannels);
  return outputBuffer;
}
Resize.prototype.resizeWidthInterpolatedRGBA = function (buffer) {
  var ratioWeight = (this.widthOriginal - 1) / this.targetWidth;
  var weight = 0;
  var finalOffset = 0;
  var pixelOffset = 0;
  var outputBuffer = this.widthBuffer;
  for (var targetPosition = 0; targetPosition < this.targetWidthMultipliedByChannels; targetPosition += 4, weight += ratioWeight) {
    //Calculate weightings:
    secondWeight = weight % 1;
    firstWeight = 1 - secondWeight;
    //Interpolate:
    for (finalOffset = targetPosition, pixelOffset = Math.floor(weight) * 4; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
      outputBuffer[finalOffset] = (buffer[pixelOffset] * firstWeight) + (buffer[pixelOffset + 4] * secondWeight);
      outputBuffer[finalOffset + 1] = (buffer[pixelOffset + 1] * firstWeight) + (buffer[pixelOffset + 5] * secondWeight);
      outputBuffer[finalOffset + 2] = (buffer[pixelOffset + 2] * firstWeight) + (buffer[pixelOffset + 6] * secondWeight);
      outputBuffer[finalOffset + 3] = (buffer[pixelOffset + 3] * firstWeight) + (buffer[pixelOffset + 7] * secondWeight);
    }
  }
  return outputBuffer;
}
Resize.prototype.resizeHeightRGB = function (buffer) {
  var ratioWeight = this.ratioWeightHeightPass;
  var weight = 0;
  var amountToNext = 0;
  var actualPosition = 0;
  var currentPosition = 0;
  var pixelOffset = 0;
  var outputOffset = 0;
  var output = this.outputHeightWorkBench;
  var outputBuffer = this.heightBuffer;
  do {
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;
    }
    weight = ratioWeight;
    do {
      amountToNext = 1 + actualPosition - currentPosition;
      if (weight >= amountToNext) {
        for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
        }
        currentPosition = actualPosition;
        weight -= amountToNext;
      }
      else {
        for (pixelOffset = 0, amountToNext = actualPosition; pixelOffset < this.targetWidthMultipliedByChannels;) {
          output[pixelOffset++] += buffer[amountToNext++] * weight;
          output[pixelOffset++] += buffer[amountToNext++] * weight;
          output[pixelOffset++] += buffer[amountToNext++] * weight;
        }
        currentPosition += weight;
        break;
      }
    } while (weight > 0 && actualPosition < this.widthPassResultSize);
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] / ratioWeight);
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] / ratioWeight);
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] / ratioWeight);
    }
  } while (outputOffset < this.finalResultSize);
  return outputBuffer;
}
Resize.prototype.resizeHeightInterpolated = function (buffer) {
  var ratioWeight = (this.heightOriginal - 1) / this.targetHeight;
  var weight = 0;
  var finalOffset = 0;
  var pixelOffset = 0;
  var pixelOffsetAccumulated = 0;
  var pixelOffsetAccumulated2 = 0;
  var outputBuffer = this.heightBuffer;
  do {
    //Calculate weightings:
    secondWeight = weight % 1;
    firstWeight = 1 - secondWeight;
    //Interpolate:
    pixelOffsetAccumulated = Math.floor(weight) * this.targetWidthMultipliedByChannels;
    pixelOffsetAccumulated2 = pixelOffsetAccumulated + this.targetWidthMultipliedByChannels;
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels; ++pixelOffset) {
      outputBuffer[finalOffset++] = (buffer[pixelOffsetAccumulated + pixelOffset] * firstWeight) + (buffer[pixelOffsetAccumulated2 + pixelOffset] * secondWeight);
    }
    weight += ratioWeight;
  } while (finalOffset < this.finalResultSize);
  return outputBuffer;
}
Resize.prototype.resizeHeightRGBA = function (buffer) {
  var ratioWeight = this.ratioWeightHeightPass;
  var weight = 0;
  var amountToNext = 0;
  var actualPosition = 0;
  var currentPosition = 0;
  var pixelOffset = 0;
  var outputOffset = 0;
  var output = this.outputHeightWorkBench;
  var outputBuffer = this.heightBuffer;
  do {
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;
      output[pixelOffset++] = 0;
    }
    weight = ratioWeight;
    do {
      amountToNext = 1 + actualPosition - currentPosition;
      if (weight >= amountToNext) {
        for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
          output[pixelOffset++] += buffer[actualPosition++] * amountToNext;
        }
        currentPosition = actualPosition;
        weight -= amountToNext;
      }
      else {
        for (pixelOffset = 0, amountToNext = actualPosition; pixelOffset < this.targetWidthMultipliedByChannels;) {
          output[pixelOffset++] += buffer[amountToNext++] * weight;
          output[pixelOffset++] += buffer[amountToNext++] * weight;
          output[pixelOffset++] += buffer[amountToNext++] * weight;
          output[pixelOffset++] += buffer[amountToNext++] * weight;
        }
        currentPosition += weight;
        break;
      }
    } while (weight > 0 && actualPosition < this.widthPassResultSize);
    for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] / ratioWeight);
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] / ratioWeight);
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] / ratioWeight);
      outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] / ratioWeight);
    }
  } while (outputOffset < this.finalResultSize);
  return outputBuffer;
}
Resize.prototype.resizeHeightInterpolatedRGBA = function (buffer) {
  var ratioWeight = (this.heightOriginal - 1) / this.targetHeight;
  var weight = 0;
  var finalOffset = 0;
  var pixelOffset = 0;
  var outputBuffer = this.heightBuffer;
  while (pixelOffset < this.finalResultSize) {
    //Calculate weightings:
    secondWeight = weight % 1;
    firstWeight = 1 - secondWeight;
    //Interpolate:
    for (pixelOffset = Math.floor(weight) * 4; pixelOffset < this.targetWidthMultipliedByChannels; pixelOffset += 4) {
      outputBuffer[finalOffset++] = (buffer[pixelOffset] * firstWeight) + (buffer[pixelOffset + 4] * secondWeight);
      outputBuffer[finalOffset++] = (buffer[pixelOffset + 1] * firstWeight) + (buffer[pixelOffset + 5] * secondWeight);
      outputBuffer[finalOffset++] = (buffer[pixelOffset + 2] * firstWeight) + (buffer[pixelOffset + 6] * secondWeight);
      outputBuffer[finalOffset++] = (buffer[pixelOffset + 3] * firstWeight) + (buffer[pixelOffset + 7] * secondWeight);
    }
    weight += ratioWeight;
  }
  return outputBuffer;
}
Resize.prototype.resize = function (buffer) {
  return this.resizeHeight(this.resizeWidth(buffer));
}
Resize.prototype.bypassResizer = function (buffer) {
  //Just return the buffer passsed:
  return buffer;
}
Resize.prototype.initializeFirstPassBuffers = function (BILINEARAlgo) {
  //Initialize the internal width pass buffers:
  this.widthBuffer = this.generateFloatBuffer(this.widthPassResultSize);
  if (!BILINEARAlgo) {
    this.outputWidthWorkBench = this.generateFloatBuffer(this.originalHeightMultipliedByChannels);
  }
}
Resize.prototype.initializeSecondPassBuffers = function (BILINEARAlgo) {
  //Initialize the internal height pass buffers:
  this.heightBuffer = this.generateUint8Buffer(this.finalResultSize);
  if (!BILINEARAlgo) {
    this.outputHeightWorkBench = this.generateFloatBuffer(this.targetWidthMultipliedByChannels);
  }
}
Resize.prototype.generateFloatBuffer = function (bufferLength) {
  //Generate a float32 typed array buffer:
  try {
    return new Float32Array(bufferLength);
  }
  catch (error) {
    return [];
  }
}
Resize.prototype.generateUint8Buffer = function (bufferLength) {
  //Generate a uint8 typed array buffer:
  try {
    return this.checkForOperaMathBug(new Uint8Array(bufferLength));
  }
  catch (error) {
    return [];
  }
}
Resize.prototype.checkForOperaMathBug = function (typedArray) {
  typedArray[0] = -1;
  typedArray[0] >>= 0;
  if (typedArray[0] != 0xFF) {
    return [];
  }
  else {
    return typedArray;
  }
}

// End of js/other/resize.js file.

// Remaining files are in gbemu-part2.js, since they run in strict mode.

