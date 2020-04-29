# digilogOSC
control guitar pedals via OSC-messages

## install ##
* clone or download
* go to folder in terminal
* npm install
* npm start
* go to localhost:8001 in the browser for the web-editor

at this moment this software is theoretical capable of converting OSC messages to serial message that control modified guitar pedals. 

The web interface show some information about the pedals and the possible OSC-messages and the ranges of their values. 

The pedals shown are the current active pedals with a serial connection. I need to add the pedals with midi control. 

##functions##

###normal control###
control the pedals with OSC-messages:  
`/pedal/param value`  
for example:  
`/canyon/delaytime 40`

###fade###
Go from the first value to the second in x amount of time:
`/pedalname/fade param start stop time`  
for example:  
`/canyon/fade delaytime 0 255 5000` -> go from 0 to 255 in 5000ms

###oscillate###
Set an LFO on the value from on value to another in x amount of time per cycle:  
`/pedalname/oscillate param start stop time`  
for example:  
`/canyon/oscillate delaytime 0 255 5000` -> go from 0 to 255 and back to 0 in 5000ms  

####stop####
stop the oscillation, use [optional] up or down to end the oscillation at the lowest or highest given point:  
`/pedal/stop param [up down]`  
for example:   
`/canyon/stop delaytime up`

###famous last words###

####change####
ignore incoming OSC data on that pedal/parameter-combination until value changes:  
`/pedal/param 40 change`  
for example:  
`/canyon/delaytime 40 change` -> message is processed  
`/canyon/delaytime 40 change` -> message is ignored  
`/canyon/delaytime 41 change` -> message is processed  
`/canyon/delaytime 41 change` -> message is ignored

####once####
(only for oscillate & fade messages)  
Oscillate messages are looped until the stop message is received. 
Fade messages are processed only once, until fade is done.  
`/pedal/oscillate param start stop time loop`  
for example:  
`/canyon/oscillate delaytime 0 255 5000 loop` -> message is processed  
`/canyon/oscillate delaytime 0 255 5000 loop` -> message is ignored  
`/canyon/oscillate delaytime 0 255 5000 loop` -> message is ignored  
`/canyon/stop delaytime` -> message is processed once (because it's a stop message)
`/canyon/oscillate delaytime 0 255 500 loop` -> message is processed
`/canyon/oscillate delaytime 0 255 500 loop` -> message is ignored (etc.)