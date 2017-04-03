# remolacha

### USAGE

$ npm i
$ node main.js

Should be ready on port 5000

### TODO

- [x] Add new order of parameters
- [x] Sync vs and exporter
- [x] Add measurements ( air moisture, land moisture, temperature)
- [x] Interpolation ring n to ring creates artifacts
- [x] Responsive
- [ ] Devices
- [ ] Update on resize
- [x] Replace matter for something more lightweight and performant
- [ ] Add audio data to SVG exporter
- [ ] Big cleanup
- [ ] Big rewrite
- [ ] Performance
- [ ] Add rings and segments selector
- [x] Audio
- [ ] Substrate smoothing
- [ ] Interpolation smoothstep
- [ ] Color interopolation is awkward sometimes

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
