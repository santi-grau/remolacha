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
- [x] Data input
- [x] Devices
- [ ] Add rings and segments selector
- [ ] Store values on file
- [ ] Update on resize
- [ ] Performance
- [x] Replace matter for something more lightweight and performant
- [x] Audio
- [ ] Substrate smoothing
- [ ] Audio smoothing
- [ ] Interpolation smoothstep
- [x] Color interopolation is awkward sometimes
- [ ] Big cleanup
- [x] Big rewrite
- [ ] Add audio data to SVG exporter
- [ ] Add text and metrics
- [ ] Browsers

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
