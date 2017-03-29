# remolacha

### USAGE

$ npm i
$ node main.js

Should be ready on port 5000

### TODO

-[ ] Multiple generators
2. Ring amount selector
3. Springs should loop
4. Audio - OK
5. Dat.gui - OK
6. Color in VS is weird, it should also affect position interpolation - OK
7. Width of rings with substrate - OK
8. Add web sockets - OK
9. Add saturation and level selector - OK
10. Fix light and make transition smoother - OK
11. Build for windows
12. Water - OK
13. Connect substrate - OK
14. Cleanup - OK
15. "API" -OK
16. Performance
17. Add measurements ( air moisture, land moisture, temperature) - OK
18. Interpolation ring n to ring  creates artifacts sometimes - OK
19. Responsive
20. Devices
21. Replace matter for something more lightweight and performant
22. Plugin music - OK
23. SVG exporter
24. Big cleanup
25. BIg rewrite

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