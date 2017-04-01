 // var SimplexNoise = require('simplex-noise');

var Export = function( ){
	self.addEventListener('message',function (ev){

		

		function HSVtoRGB(h, s, v) {
			var r, g, b, i, f, p, q, t;
			if (arguments.length === 1) {
				s = h.s, v = h.v, h = h.h;
			}
			i = Math.floor(h * 6);
			f = h * 6 - i;
			p = v * (1 - s);
			q = v * (1 - f * s);
			t = v * (1 - (1 - f) * s);
			switch (i % 6) {
				case 0: r = v, g = t, b = p; break;
				case 1: r = q, g = v, b = p; break;
				case 2: r = p, g = v, b = t; break;
				case 3: r = p, g = q, b = v; break;
				case 4: r = t, g = p, b = v; break;
				case 5: r = v, g = p, b = q; break;
			}
			return Math.round(r * 255) +','+ Math.round(g * 255)+','+ Math.round(b * 255)
		}

		function SimplexNoise2D() {
			this.perm = new Int32Array([0, 35, 138, 20, 259, 277, 74, 228, 161, 162, 231, 79, 284, 268, 31, 151, 50, 17, 52, 155, 37, 276, 5, 91, 245, 178, 179, 248, 96, 12, 285, 48, 168, 67, 34, 69, 172, 54, 4, 22, 108, 262, 195, 196, 265, 113, 29, 13, 65, 185, 84, 51, 86, 189, 71, 21, 39, 125, 279, 212, 213, 282, 130, 46, 30, 82, 202, 101, 68, 103, 206, 88, 38, 56, 142, 7, 229, 230, 10, 147, 63, 47, 99, 219, 118, 85, 120, 223, 105, 55, 73, 159, 24, 246, 247, 27, 164, 80, 64, 116, 236, 135, 102, 137, 240, 122, 72, 90, 176, 41, 263, 264, 44, 181, 97, 81, 133, 253, 152, 119, 154, 257, 139, 89, 107, 193, 58, 280, 281, 61, 198, 114, 98, 150, 270, 169, 136, 171, 274, 156, 106, 124, 210, 75, 8, 9, 78, 215, 131, 115, 167, 287, 186, 153, 188, 2, 173, 123, 141, 227, 92, 25, 26, 95, 232, 148, 132, 184, 15, 203, 170, 205, 19, 190, 140, 158, 244, 109, 42, 43, 112, 249, 165, 149, 201, 32, 220, 187, 222, 36, 207, 157, 175, 261, 126, 59, 60, 129, 266, 182, 166, 218, 49, 237, 204, 239, 53, 224, 174, 192, 278, 143, 76, 77, 146, 283, 199, 183, 235, 66, 254, 221, 256, 70, 241, 191, 209, 6, 160, 93, 94, 163, 11, 216, 200, 252, 83, 271, 238, 273, 87, 258, 208, 226, 23, 177, 110, 111, 180, 28, 233, 217, 269, 100, 288, 255, 1, 104, 275, 225, 243, 40, 194, 127, 128, 197, 45, 250, 234, 286, 117, 16, 272, 18, 121, 3, 242, 260, 57, 211, 144, 145, 214, 62, 267, 251, 14, 134, 33, 0, 35, 138, 20, 259, 277, 74, 228, 161, 162, 231, 79, 284, 268, 31, 151, 50, 17, 52, 155, 37, 276, 5, 91, 245, 178, 179, 248, 96, 12, 285, 48, 168, 67, 34, 69, 172, 54, 4, 22, 108, 262, 195, 196, 265, 113, 29, 13, 65, 185, 84, 51, 86, 189, 71, 21, 39, 125, 279, 212, 213, 282, 130, 46, 30, 82, 202, 101, 68, 103, 206, 88, 38, 56, 142, 7, 229, 230, 10, 147, 63, 47, 99, 219, 118, 85, 120, 223, 105, 55, 73, 159, 24, 246, 247, 27, 164, 80, 64, 116, 236, 135, 102, 137, 240, 122, 72, 90, 176, 41, 263, 264, 44, 181, 97, 81, 133, 253, 152, 119, 154, 257, 139, 89, 107, 193, 58, 280, 281, 61, 198, 114, 98, 150, 270, 169, 136, 171, 274, 156, 106, 124, 210, 75, 8, 9, 78, 215, 131, 115, 167, 287, 186, 153, 188, 2, 173, 123, 141, 227, 92, 25, 26, 95, 232, 148, 132, 184, 15, 203, 170, 205, 19, 190, 140, 158, 244, 109, 42, 43, 112, 249, 165, 149, 201, 32, 220, 187, 222, 36, 207, 157, 175, 261, 126, 59, 60, 129, 266, 182, 166, 218, 49, 237, 204, 239, 53, 224, 174, 192, 278, 143, 76, 77, 146, 283, 199, 183, 235, 66, 254, 221, 256]);
			this.mod289_temp0 = 0.0034602077212184668;//1.0 / 289.0;
		}

		SimplexNoise2D.prototype.snoise = function(inX, inY) {
			var perm = this.perm, mod289_temp0 = this.mod289_temp0;
			var i_0 = Math.floor(inX + (inX + inY) * 0.366025403784439);
			var i_1 = Math.floor(inY + (inX + inY) * 0.366025403784439);
			var x0_0 = inX - i_0 + (i_0 + i_1) * 0.211324865405187;
			var x0_1 = inY - i_1 + (i_0 + i_1) * 0.211324865405187;
			var i1_0 = (x0_0 > x0_1) ? 1.0 : 0.0;
			var i1_1 = (x0_0 > x0_1) ? 0.0 : 1.0;
			var x12_0 = x0_0 + 0.211324865405187 - i1_0;
			var x12_1 = x0_1 + 0.211324865405187 - i1_1;
			var x12_2 = x0_0 -0.577350269189626;
			var x12_3 = x0_1 -0.577350269189626;
			i_0 = i_0 - Math.floor(i_0 * mod289_temp0) * 289.0;
			i_1 = i_1 - Math.floor(i_1 * mod289_temp0) * 289.0;
			var p_0 = perm[ (perm[i_1 + 0.0   ] + i_0 + 0.0  ) & 511 ] * 0.024390243902439;
			var p_1 = perm[ (perm[i_1 + i1_1  ] + i_0 + i1_0 ) & 511 ] * 0.024390243902439;
			var p_2 = perm[ (perm[i_1 + 1.0   ] + i_0 + 1.0  ) & 511 ] * 0.024390243902439;
			var x_0 = 2.0 * (p_0 - Math.floor(p_0)) - 1.0;
			var x_1 = 2.0 * (p_1 - Math.floor(p_1)) - 1.0;
			var x_2 = 2.0 * (p_2 - Math.floor(p_2)) - 1.0;
			var h_0 = Math.abs(x_0) - 0.5;
			var h_1 = Math.abs(x_1) - 0.5;
			var h_2 = Math.abs(x_2) - 0.5;
			var a0_0 = x_0 - Math.floor(x_0 + 0.5);
			var a0_1 = x_1 - Math.floor(x_1 + 0.5);
			var a0_2 = x_2 - Math.floor(x_2 + 0.5);
			var m_0 = Math.max(0.5 - (x0_0 * x0_0 + x0_1 * x0_1), 0.0);
			var m_1 = Math.max(0.5 - (x12_0 * x12_0 + x12_1 * x12_1), 0.0);
			var m_2 = Math.max(0.5 - (x12_2 * x12_2 + x12_3 * x12_3), 0.0);
			m_0 = m_0 * m_0 * m_0 * m_0 * ( 1.79284291400159 - 0.85373472095314 * ( a0_0 * a0_0 + h_0 * h_0 ) );
			m_1 = m_1 * m_1 * m_1 * m_1 * ( 1.79284291400159 - 0.85373472095314 * ( a0_1 * a0_1 + h_1 * h_1 ) );
			m_2 = m_2 * m_2 * m_2 * m_2 * ( 1.79284291400159 - 0.85373472095314 * ( a0_2 * a0_2 + h_2 * h_2 ) );
			var g_0 = a0_0  * x0_0  + h_0 * x0_1;
			var g_1 = a0_1  * x12_0 + h_1 * x12_1;
			var g_2 = a0_2  * x12_2 + h_2 * x12_3;
			return 130.0 * (m_0 * g_0 + m_1 * g_1 + m_2 * g_2);//vec3.dot(m, g);
		}
		var noise = new SimplexNoise2D();
		var data = JSON.parse(ev.data);

		var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">';

		for( var i = 0 ; i < data.rings.value - 1 ; i++ ){

			var color;
			if( i < data.rings.value / 2 ) color = HSVtoRGB( data.lightStep.value + i / data.rings.value / 2 , 0.9, 0.7 );
			else color = HSVtoRGB( data.lightStep.value + ( data.rings.value - i ) / data.rings.value / 2.0 , 0.9, 0.7 );

			if( i >= 0 && i < data.rings.value / 3 ){
					var step = i / ( data.rings.value / 3);
					
					var px = Math.cos( Math.PI * 2.0 * i / (data.rings.value - 1) ) * ( data.bigRadius.value );
					var py = Math.sin( Math.PI * 2.0 * i / (data.rings.value - 1) ) * ( data.bigRadius.value );

					var n = noise.snoise( px / 900.0 + data.air.value, py / 900.0 );
					px += px * 0.3 * n * (data.soil.value);
					py += py * 0.3 * n * (data.soil.value);

					var def = 1.0 + noise.snoise( px / 600.0 + data.air.value, py / 600.0 ) * ( data.soil.value - 0.25 * data.soil.value );

					var waterDef = noise.snoise( px / data.waterPhase.value + data.waterStep.value, py / data.waterPhase.value );
					def *= 1.0 + waterDef * data.waterIntensity.value * 0.4;
					
					px += px * 0.1 * waterDef * data.waterIntensity.value;
					py += py * 0.1 * waterDef * data.waterIntensity.value;

				for( var j = 0 ; j < data.pos0.value.length ; j+=3 ){
					if( j == 0 ){
						var sx = parseFloat( 400 + def * parseFloat( data.pos0.value[j] + ( data.pos1.value[j] - data.pos0.value[j]) * step ) );
						var sy = parseFloat( 400 + def * parseFloat( data.pos0.value[j+1] + ( data.pos1.value[j+1] - data.pos0.value[j+1]) * step ) );
						svg += '<path fill="none" stroke-width="0.25" stroke="rgb('+color+')" d="M'+ (px + sx) +' '+ ((py + sy) * -1 + 800)	;
					} else {						
						var sx = parseFloat( 400 + def * parseFloat( data.pos0.value[j] + ( data.pos1.value[j] - data.pos0.value[j]) * step ) );
						var sy = parseFloat( 400 + def * parseFloat( data.pos0.value[j+1] + ( data.pos1.value[j+1] - data.pos0.value[j+1]) * step ) );
						svg += ' L'+ (px + sx) +' '+ ((py + sy) * -1 + 800)	 ;
					}
				}
				svg += '"/>';
			}

			if( i >= data.rings.value / 3 && i < data.rings.value / 3 * 2 ){
					var step = (i - data.rings.value / 3) / ( data.rings.value / 3);

					var px = Math.cos( Math.PI * 2.0 * i / (data.rings.value - 1) ) * ( data.bigRadius.value );
					var py = Math.sin( Math.PI * 2.0 * i / (data.rings.value - 1) ) * ( data.bigRadius.value );

					// var def = (noise.snoise(px/300,py/300) + 1.0) / 2 + 1;

					var n = noise.snoise( px / 900.0 + data.air.value, py / 900.0 );
					px += px * 0.3 * n * (data.soil.value);
					py += py * 0.3 * n * (data.soil.value);

					var def = 1.0 + noise.snoise( px / 600.0 + data.air.value, py / 600.0 ) * ( data.soil.value - 0.25 * data.soil.value );

					var waterDef = noise.snoise( px / data.waterPhase.value + data.waterStep.value, py / data.waterPhase.value );
					def *= 1.0 + waterDef * data.waterIntensity.value * 0.4;
					
					px += px * 0.1 * waterDef * data.waterIntensity.value;
					py += py * 0.1 * waterDef * data.waterIntensity.value;

				for( var j = 0 ; j < data.pos1.value.length ; j+=3 ){
					if( j == 0 ){
						var sx = parseFloat( 400 + def * parseFloat( data.pos1.value[j] + ( data.pos2.value[j] - data.pos1.value[j]) * step ) );
						var sy = parseFloat( 400 + def * parseFloat( data.pos1.value[j+1] + ( data.pos2.value[j+1] - data.pos1.value[j+1]) * step ) );
						svg += '<path fill="none" stroke-width="0.25" stroke="rgb('+color+')" d="M'+ (px + sx) +' '+ ((py + sy) * -1 + 800)	;
					} else {
						var sx = parseFloat( 400 + def * parseFloat( data.pos1.value[j] + ( data.pos2.value[j] - data.pos1.value[j]) * step ) );
						var sy = parseFloat( 400 + def * parseFloat( data.pos1.value[j+1] + ( data.pos2.value[j+1] - data.pos1.value[j+1]) * step ) );
						svg += ' L'+ (px + sx) +' '+ ((py + sy) * -1 + 800)	 ;
					}
				}
				svg += '"/>';
			}

			if( i >= data.rings.value / 3 * 2 ){
					var step = (i - data.rings.value / 3 * 2) / ( data.rings.value / 3);
					var px = Math.cos( Math.PI * 2.0 * i / (data.rings.value - 1) ) * ( data.bigRadius.value );
					var py = Math.sin( Math.PI * 2.0 * i / (data.rings.value - 1) ) * ( data.bigRadius.value );

					// var def = (noise.snoise(px/300,py/300) + 1.0) / 2 + 1;
					var n = noise.snoise( px / 900.0 + data.air.value, py / 900.0 );
					px += px * 0.3 * n * (data.soil.value);
					py += py * 0.3 * n * (data.soil.value);

					var def = 1.0 + noise.snoise( px / 600.0 + data.air.value, py / 600.0 ) * ( data.soil.value - 0.25 * data.soil.value );

					var waterDef = noise.snoise( px / data.waterPhase.value + data.waterStep.value, py / data.waterPhase.value );
					def *= 1.0 + waterDef * data.waterIntensity.value * 0.4;
					
					px += px * 0.1 * waterDef * data.waterIntensity.value;
					py += py * 0.1 * waterDef * data.waterIntensity.value;

				for( var j = 0 ; j < data.pos2.value.length ; j+=3 ){
					if( j == 0 ){
						var sx = parseFloat( 400 + def * parseFloat( data.pos2.value[j] + ( data.pos0.value[j] - data.pos2.value[j]) * step ) );
						var sy = parseFloat( 400 + def * parseFloat( data.pos2.value[j+1] + ( data.pos0.value[j+1] - data.pos2.value[j+1]) * step ) );
						svg += '<path fill="none" stroke-width="0.25" stroke="rgb('+color+')" d="M'+ (px + sx) +' '+ ((py + sy) * -1 + 800)	;
					} else {
						var sx = parseFloat( 400 + def * parseFloat( data.pos2.value[j] + ( data.pos0.value[j] - data.pos2.value[j]) * step ) );
						var sy = parseFloat( 400 + def * parseFloat( data.pos2.value[j+1] + ( data.pos0.value[j+1] - data.pos2.value[j+1]) * step ) );
						svg += ' L'+ (px + sx) +' '+ ((py + sy) * -1 + 800)	 ;
					}
				}
				svg += '"/>';
			}	
		}
		svg += '</svg>';

		self.postMessage(svg);
	});
}

module.exports = Export;