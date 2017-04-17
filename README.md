# remolacha

### USAGE

$ npm i
$ node main.js

Should be ready on port 5000

### TODO

- [ ] AWS
- [ ] Update on resize
- [ ] Store values on file
- [ ] Add rings and segments selector
- [ ] Substrate smoothing
- [ ] Audio smoothing
- [ ] Interpolation smoothstep
- [ ] Big cleanup
- [ ] Processing tool
- [ ] Add audio data to SVG exporter

### PARAMS

* bigRadius -> Total radius ( external )
* ringRadius -> Radius of rings
* temperature -> Temperature of air [ 0, 1 ] controls how wiggly rings are
* soil -> Soil moisture [ 0, 1 ] controls how intense deformations of rings are
* air -> Air moisture [ 0, 1 ] controls how quick deformation happens
* water -> Turns on/off water
* light -> Turns on/off light
* substrate -> Adds substrate
* audio -> Turns on off music
