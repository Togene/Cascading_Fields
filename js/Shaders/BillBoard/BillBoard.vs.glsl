		precision highp float;
		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;
		attribute vec3 position;
		attribute vec3 offset;
		attribute vec3 col;
		attribute vec2 uv;
		attribute vec2 uvoffset;
		attribute vec3 scaleInstance;
		
		attribute vec4 orientation;
		varying vec2 vUv;
		uniform float spriteSheetX;
		uniform float spriteSheetY;

		varying vec3 colorPass;
		// http://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
		vec3 applyQuaternionToVector( vec4 q, vec3 v ){
			return v + 2.0 * cross( q.xyz, cross( q.xyz, v ) + q.w * v );
		}

		void main() {
			vec4 mvPosition = modelViewMatrix * vec4( offset * 1.0, 1.0 );
			mvPosition.xyz += (position * scaleInstance);
			//mvPosition *= vec4(scaleInstance, 1.0);

			vUv = vec2((uv.x/spriteSheetX) + uvoffset.x, (uv.y/spriteSheetY) + uvoffset.y);
			gl_Position = projectionMatrix * mvPosition;
			colorPass = col.rgb;
		}