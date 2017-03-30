# remolacha

### USAGE

$ npm i
$ node main.js

Should be ready on port 5000

### TODO

- [ ] Add new order of parameters
- [ ] Sync vs and exporter
- [ ] Performance
- [x] Add measurements ( air moisture, land moisture, temperature)
- [x] Interpolation ring n to ring  creates artifacts sometimes
- [ ] Responsive
- [ ] Devices
- [ ] Replace matter for something more lightweight and performant
- [ ] SVG exporter
- [ ] Big cleanup
- [ ] Big rewrite
- [ ] Add rings and segments selector

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
