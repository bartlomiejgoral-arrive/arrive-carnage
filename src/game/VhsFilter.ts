import { Filter, GlProgram } from 'pixi.js'

const vertex = `
in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition(void)
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(void)
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`

const fragment = `
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uTime;
uniform float uScanlineIntensity;
uniform float uNoiseIntensity;
uniform float uChromaShift;
uniform float uWobbleAmount;

// Pseudo-random noise
float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void)
{
    vec2 uv = vTextureCoord;

    // Wobble / horizontal distortion
    float wobble = sin(uv.y * 50.0 + uTime * 3.0) * uWobbleAmount;
    wobble += sin(uv.y * 120.0 + uTime * 7.0) * uWobbleAmount * 0.3;
    uv.x += wobble;

    // Occasional horizontal tear / tracking glitch
    float tearLine = step(0.9995, rand(vec2(uTime * 0.1, floor(uv.y * 80.0))));
    uv.x += tearLine * 0.008;

    // Chromatic aberration — split RGB channels
    float r = texture(uTexture, vec2(uv.x + uChromaShift, uv.y)).r;
    float g = texture(uTexture, uv).g;
    float b = texture(uTexture, vec2(uv.x - uChromaShift, uv.y)).b;
    vec3 color = vec3(r, g, b);

    // Scanlines
    float scanline = sin(uv.y * 800.0) * 0.5 + 0.5;
    color -= scanline * uScanlineIntensity;

    // Static noise
    float noise = rand(uv + fract(uTime)) * uNoiseIntensity;
    color += noise - uNoiseIntensity * 0.5;

    // Slight vignette
    float vignette = smoothstep(0.8, 0.3, length(uv - 0.5));
    color *= mix(0.85, 1.0, vignette);

    // Slight color desaturation to mimic tape degradation
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luma), color, 0.92);

    finalColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`

export class VhsFilter extends Filter {
  private _time = 0

  constructor() {
    const glProgram = GlProgram.from({ vertex, fragment })

    super({
      glProgram,
      resources: {
        vhsUniforms: {
          uTime: { value: 0, type: 'f32' },
          uScanlineIntensity: { value: 0.03, type: 'f32' },
          uNoiseIntensity: { value: 0.025, type: 'f32' },
          uChromaShift: { value: 0.0006, type: 'f32' },
          uWobbleAmount: { value: 0.0003, type: 'f32' },
        },
      },
    })
  }

  update(deltaSec: number): void {
    this._time += deltaSec
    this.resources.vhsUniforms.uniforms.uTime = this._time
  }
}
