# remolacha

### USAGE

$ npm i
$ node main.js

Should be ready on port 5000

### TODO

- [ ] Add new order of parameters
- [ ] Sync vs and exporter
- [ ] Performance
- [ ] Add measurements ( air moisture, land moisture, temperature)
- [ ] Interpolation ring n to ring  creates artifacts sometimes
- [ ] Responsive
- [ ] Devices
- [ ] Replace matter for something more lightweight and performant
- [ ] SVG exporter
- [ ] Big cleanup
- [ ] BIg rewrite

### PARAMS

bigRadius -> Total radius ( external )
ringRadius -> Radius of ring
rings -> Amount of rings
segments -> Amount of segments per ring

temperature -> Temperature of air [ 0, 1 ] controls how wiggly rings are on resting state
soil -> Soil moisture [ 0, 1 ] controls how intense deformations of rings are on resting state
air -> Air moisture [ 0, 1 ] controls how intense external deformation is on resting state
waterStep -> Float determining water noise increment, produces deformation on rings and external ring
waterPhase -> Float determines how short/long the phase of water deformation is
waterIntensity -> [ 0, 1 ] Determines how intense water deformation is
light -> Boolean Turns on/off light and changes hue of color
substrate -> Increments the width of the rings
audio -> Boolean -> Turns on off music
time -> Float increments throught time, used to produce perpetual motion
