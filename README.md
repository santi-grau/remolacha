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
- [x] Color interopolation is awkward sometimes
- [x] Replace matter for something more lightweight and performant
- [x] Audio
- [x] Big rewrite
- [x] Add text and metrics
- [x] Hacklab -> HackLab
- [x] Performance
- [ ] Browsers
- [ ] Add rings and segments selector
- [ ] Update on resize
- [ ] AWS
- [ ] Store values on file
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
