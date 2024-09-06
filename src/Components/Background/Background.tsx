import React, { useEffect, useRef } from 'react';


const Background  = ({ width, height, brightness,  style }: { width: number, height: number, brightness: number, style: React.CSSProperties }) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let gl: WebGL2RenderingContext | null = null;
    let time = 0;

    const vertexShaderSource = `
      # version 300 es  
      void main()
      {
          float x = float((gl_VertexID & 1) << 2);
          float y = float((gl_VertexID & 2) << 1);
          gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
      }
    `;

    const fragmentShaderSource = `
      # version 300 es
      precision highp float;
      uniform float iTime;
      out vec4 fragColor;
      uniform float iResolutionX;  // Width of the canvas
      uniform float iResolutionY;  // Height of the canvas
      uniform float iBrightness;   // Brightness of the background
     
      const int octaves = 6;
            
      vec2 random2(vec2 st){
          vec2 t = vec2(0.9, 0.9);
          return t*t*4.;
      }
      
      float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
  
          vec2 u = f*f*(3.0-2.0*f);
  
          return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                           dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                      mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                           dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
      }

      float fbm1(in vec2 _st) {
          float v = 0.0;
          float a = 0.5;
          vec2 shift = vec2(100.0);
          // Rotate to reduce axial bias
          mat2 rot = mat2(cos(0.5), sin(0.5),
                          -sin(0.5), cos(0.50));
          for (int i = 0; i < octaves; ++i) {
              v += a * noise(_st);
              _st = rot * _st * 2.0 + shift;
              a *= 0.4;
          }
          return v;
        }
        
        float pattern(vec2 uv, float time, inout vec2 q, inout vec2 r) {

          q = vec2( fbm1( uv * .1 + vec2(0.0,0.0) ),
                         fbm1( uv + vec2(5.2,1.3) ) );
    
          r = vec2( fbm1( uv * .1 + 4.0*q + vec2(1.7 - time / 2.,9.2) ),
                         fbm1( uv + 4.0*q + vec2(8.3 - time / 2.,2.8) ) );
    
          vec2 s = vec2( fbm1( uv + 5.0*r + vec2(21.7 - time / 2.,90.2) ),
                         fbm1( uv * .05 + 5.0*r + vec2(80.3 - time / 2.,20.8) ) ) * .25;
    
          return fbm1( uv * .05 + 4.0 * s );
        }

      void main()
      {
          vec2 uv = gl_FragCoord.xy / vec2(iResolutionX, iResolutionY);

          float time = iTime / 60.0;

          mat2 rot = mat2(cos(time / 10.0), sin(time / 10.0),
            -sin(time / 10.0), cos(time / 10.0));

          uv = rot * uv;
          uv *= 0.9 * (sin(time)) + 3.0;
          uv.x -= time / 5.0;

          vec2 q = vec2(0.,0.);
          vec2 r = vec2(0.,0.);
      
          float _pattern = 0.;
      
          _pattern = pattern(uv, time, q, r);

          float grayscaleValue = _pattern * 2. - dot(q, r) * 15.;
          grayscaleValue = mix(grayscaleValue, pattern(r, time, q, r) + dot(q, r) * 15., 0.5);
          grayscaleValue -= q.y * 1.5;
          grayscaleValue = mix(grayscaleValue, 0.2, (clamp(q.x, -1., 0.)) * 3.) * iBrightness;

          fragColor = vec4(vec3(grayscaleValue), 1./length(q));
      }
    `;

    const canvas = canvasRef.current;

    if (canvas) {

      // WebGL2RenderingContext
      gl = canvas.getContext('webgl2', { antialias: false });
      if (!gl) {
        console.error('Unable to initialize WebGL. Your browser may not support it.');
        return;
      }

      // Vertex shader
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      if (!vertexShader) {
        console.error('Failed to create vertex shader.');
        return;
      }
      gl.shaderSource(vertexShader, vertexShaderSource.replace(/^\s+|\s+$/g, ''));
      gl.compileShader(vertexShader);

      // Fragment shader
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      if (!fragmentShader) {
        console.error('Failed to create fragment shader.');
        return;
      }
      gl.shaderSource(fragmentShader, fragmentShaderSource.replace(/^\s+|\s+$/g, ''));
      gl.compileShader(fragmentShader);

      // Program
      const program = gl.createProgram();

      if (!program) {
        console.error('Failed to create program.');
        return;
      }

      if (gl) {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const loop = () => {

          if (gl) {

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            time += 1 / 30;
            const iTimeLocation = gl.getUniformLocation(program, 'iTime');
            const iResolutionXLocation = gl.getUniformLocation(program, 'iResolutionX');
            const iResolutionYLocation = gl.getUniformLocation(program, 'iResolutionY');
            const iBrightnessLocation = gl.getUniformLocation(program, 'iBrightness');

            if (iTimeLocation && iResolutionXLocation && iResolutionYLocation) {
              gl.uniform1f(iTimeLocation, time);
              gl.uniform1f(iResolutionXLocation, width);
              gl.uniform1f(iResolutionYLocation, height);
              gl.uniform1f(iBrightnessLocation, brightness);
              gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
          }

          requestAnimationFrame(loop);
        };

        loop();
      }

    }

    return () => {
      if (gl) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(null);
      }
    };
  }, []);

  return <canvas ref={canvasRef} width={width} height={height} style = {style}></canvas>
};

export default Background;
