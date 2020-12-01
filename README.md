# digilogOSC #
* Control guitar pedals via OSC-messages
* Code editor for the [Mercury](https://github.com/tmhglnd/mercury) live-codig environment by Timo Hoogland 

## install ##
* Clone or download
* Go to folder in terminal
* `npm install`
* `npm run dev` (for now)
* Go to __localhost:3000__ in the browser for the web-interface

At this moment this software is capable of converting OSC messages to serial message that control modified guitar pedals. 

The webinterface is a code editor for the Mercury live-coding environment. It has syntax highlighting for the Mercury Language and it has automatich helper-files for the Digilog-part of it.

## add your own midi-enabled devices ##
If you want to add some of your own devices you can add them to `server/assets/pedals.json`:

```
"particle": { //name of the pedal & first part of OSC-address
    "number":1, // midi-channel
    "name":"Particle", //Full name, used for the web interface
    "id":"particle", 
    "midiName":"Particle", //name of the midi-device, not necessarily same as pedal-name
    "online":1, //needs to be 1 to pop-up in web interface and to be able to send messages to it
    "type":"delay/pitch", //info for in the web-interface
    "midi":1, //needs to be one if it's a midi-device. 
    "param": { //add parameters here
      "blend": { //name of the parameter, second part of OSC-address
        "number":12, //cc-number
        "value":0, // default value
        "name":"Blend" //name for web-interface
      },[....] //add more parameters here..
```

## functions ##

### default control ###
control the pedals with OSC-messages:  
`/pedal/param <value>`  

for example:  
`/canyon/delaytime 40` set the delaytime to 40 (in a 0 - 255 range for this specific pedal)

#### pedal-specific functions ####

`/pedal/sample <time [slot]>`

Record a sample for one of the following pedals:  
Tensor, Volante, Looper (22500, slot: a || b), Canyon  

`/tensor/sample 5000`  
`/looper/sample 5000 a`

------

`/pedal/stopSample 1`
stop the looping sample (both for 22500)


### createSeq ###
Function for creating sequencer values for the Ottobit jr. Generates random notes for the 6 sequencer steps:  
`/ottobit/createSeq <scale [chance]>`  

The scale can be:  

* major  
* minor
* minor_harmonic  
* minor_melodic  
* dorian
* phrygian
* lydian
* mixolydian
* locrian
* gypsy_spanish
* gypsy
* hexatonic
* hexatonic_prometheus
* hexatonic_blues
* pentatonic_major
* pentatonic_minor
* chromatic

[chance] is optional and can be used to give the chance from 0-100 to choose a note. If no note is chosen the step will be skipped or muted (50/50 chance on one of these two). Default is 70.

### fade ###
Go from the first value to the second in x amount of time:  
`/pedalname/param/fade start stop time`  

for example:  
`/canyon/delaytime/fade 0 255 5000` -> set delaytime from 0 to 255 in 5000ms

### oscillate ###
Set an LFO on the value from on value to another in x amount of time per cycle:  
`/pedalname/param oscillate start stop time`  

for example:  
`/canyon/delaytime/oscillate 0 255 5000` -> go from 0 to 255 and back to 0 in 5000ms  

#### stop ####
stop the oscillation, use [optional] up or down to end the oscillation at the lowest or highest given point:  
`/pedal/param/stop [up down]`  

for example:   
`/canyon/delaytime/stop up`

### famous last words ###

#### change ####
ignore incoming OSC data on that pedal/parameter-combination until value changes:  
`/pedal/param 40 change`  

for example:  
`/canyon/delaytime 40 change` -> message is processed  
`/canyon/delaytime 40 change` -> message is ignored  
`/canyon/delaytime 41 change` -> message is processed  
`/canyon/delaytime 41 change` -> message is ignored

#### once ####
(only for oscillate & fade messages)  
Oscillate messages are looped until the stop message is received. 
Fade messages are processed only once, until fade is done.  
`/pedal/oscillate param start stop time loop` 
 
for example:  
`/canyon/delaytime oscillate 0 255 5000 loop` -> message is processed  
`/canyon/delaytime oscillate 0 255 5000 loop` -> message is ignored  
`/canyon/delaytime oscillate 0 255 5000 loop` -> message is ignored  
`/canyon/delaytime stop` -> message is processed once (because it's a stop message)  
`/canyon/delaytime oscillate 0 255 500 loop` -> message is processed  
`/canyon/delaytime oscillate 0 255 500 loop` -> message is ignored (etc.)