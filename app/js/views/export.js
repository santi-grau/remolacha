

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

		var data = JSON.parse(ev.data);

		var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">';
		var segments = 16;
		for( var i = 0 ; i < data.totalCircles.value ; i++ ){

			var color;
			if( i < data.totalCircles.value / 2 ) color = HSVtoRGB( data.light.value + i / data.totalCircles.value / 2 , 0.9, 0.7 );
			else color = HSVtoRGB( data.light.value + ( data.totalCircles.value - i ) / data.totalCircles.value / 2.0 , 0.9, 0.7 );
			


			if( i >= 0 && i < data.totalCircles.value / 3 ){
					var step = i / ( data.totalCircles.value / 3);
				for( var j = 0 ; j < data.pos0.value.length ; j+=3 ){
					if( j == 0 ){
						var px = parseFloat( 400 + parseFloat( data.pos0.value[j] + ( data.pos1.value[j] - data.pos0.value[j]) * step ) ) + Math.cos( Math.PI * 2.0 * i / (data.totalCircles.value - 1) ) * ( data.ringRadius.value );
						var py = parseFloat( 400 + parseFloat( data.pos0.value[j+1] + ( data.pos1.value[j+1] - data.pos0.value[j+1]) * step ) ) - Math.sin( Math.PI * 2.0 * i / (data.totalCircles.value - 1) ) * ( data.ringRadius.value );
						svg += '<path fill="none" stroke-width="0.5" stroke="rgb('+color+')" d="M'+ px +' '+ py;
					} else {
						var px = parseFloat( 400 + parseFloat( data.pos0.value[j] + ( data.pos1.value[j] - data.pos0.value[j]) * step ) ) + Math.cos( Math.PI * 2.0 * i / (data.totalCircles.value - 1) ) * ( data.ringRadius.value );
						var py = parseFloat( 400 + parseFloat( data.pos0.value[j+1] + ( data.pos1.value[j+1] - data.pos0.value[j+1]) * step ) ) - Math.sin( Math.PI * 2.0 * i / (data.totalCircles.value - 1) ) * ( data.ringRadius.value );
						svg += ' L'+ px +' '+ py ;
					}
				}
				svg += '"/>';
			}

			if( i >= data.totalCircles.value / 3 && i < data.totalCircles.value / 3 * 2 ){
					var step = (i - data.totalCircles.value / 3) / ( data.totalCircles.value / 3);
				for( var j = 0 ; j < data.pos1.value.length ; j+=3 ){
					if( j == 0 ){
						var px = parseFloat( 400 + parseFloat( data.pos1.value[j] + ( data.pos2.value[j] - data.pos1.value[j]) * step ) ) + Math.cos( Math.PI * 2.0 * i / (data.totalCircles.value - 1) ) * ( data.ringRadius.value );
						var py = parseFloat( 400 + parseFloat( data.pos1.value[j+1] + ( data.pos2.value[j+1] - data.pos1.value[j+1]) * step ) ) - Math.sin( Math.PI * 2.0 * i / (data.totalCircles.value - 1) ) * ( data.ringRadius.value );
						svg += '<path fill="none" stroke-width="0.5" stroke="rgb('+color+')" d="M'+ px +' '+ py;
					} else {
						var px = parseFloat( 400 + parseFloat( data.pos1.value[j] + ( data.pos2.value[j] - data.pos1.value[j]) * step ) ) + Math.cos( Math.PI * 2.0 * i / (data.totalCircles.value - 1) ) * ( data.ringRadius.value );
						var py = parseFloat( 400 + parseFloat( data.pos1.value[j+1] + ( data.pos2.value[j+1] - data.pos1.value[j+1]) * step ) ) - Math.sin( Math.PI * 2.0 * i / (data.totalCircles.value - 1) ) * ( data.ringRadius.value );
						svg += ' L'+ px +' '+ py ;
					}
				}
				svg += '"/>';
			}

			if( i >= data.totalCircles.value / 3 * 2 ){
					var step = (i - data.totalCircles.value / 3 * 2) / ( data.totalCircles.value / 3);
				for( var j = 0 ; j < data.pos2.value.length ; j+=3 ){
					if( j == 0 ){
						var px = parseFloat( 400 + parseFloat( data.pos2.value[j] + ( data.pos0.value[j] - data.pos2.value[j]) * step ) ) + Math.cos( Math.PI * 2.0 * i / (data.totalCircles.value - 1) ) * ( data.ringRadius.value );
						var py = parseFloat( 400 + parseFloat( data.pos2.value[j+1] + ( data.pos0.value[j+1] - data.pos2.value[j+1]) * step ) ) - Math.sin( Math.PI * 2.0 * i / (data.totalCircles.value - 1) ) * ( data.ringRadius.value );
						svg += '<path fill="none" stroke-width="0.5" stroke="rgb('+color+')" d="M'+ px +' '+ py;
					} else {
						var px = parseFloat( 400 + parseFloat( data.pos2.value[j] + ( data.pos0.value[j] - data.pos2.value[j]) * step ) ) + Math.cos( Math.PI * 2.0 * i / (data.totalCircles.value - 1) ) * ( data.ringRadius.value );
						var py = parseFloat( 400 + parseFloat( data.pos2.value[j+1] + ( data.pos0.value[j+1] - data.pos2.value[j+1]) * step ) ) - Math.sin( Math.PI * 2.0 * i / (data.totalCircles.value - 1) ) * ( data.ringRadius.value );
						svg += ' L'+ px +' '+ py ;
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