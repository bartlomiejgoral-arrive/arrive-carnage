import { Filter, GlProgram } from 'pixi.js'

const vertex = `
in vec2 aPosition;
out vec2 vTextureCoord;
out vec2 vUvScale;

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
    vUvScale = uOutputFrame.zw * uInputSize.zw;
}
`

const fragment = `
in vec2 vTextureCoord;
in vec2 vUvScale;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uScrollOffset;
uniform float uWidth;

const float OVERLAY_H = 1000.0;
const float PIXEL_SIZE = 4.0;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453);
}

void main(void)
{
    vec4 color = texture(uTexture, vTextureCoord);

    vec2 norm = vTextureCoord / vUvScale;
    vec2 px = norm * vec2(uWidth, OVERLAY_H);
    px.y -= uScrollOffset;

    // Nearly flat colour — just a tiny bit of grain to avoid dead-flat look
    vec2 rpx = floor(px / PIXEL_SIZE) * PIXEL_SIZE;
    float grain = hash(floor(rpx / 12.0)) * 0.02 - 0.01;
    color.rgb += grain;

    finalColor = color;
}
`

export class GrassFilter extends Filter {
  private _scrollOffset = 0

  constructor(width: number) {
    const glProgram = GlProgram.from({ vertex, fragment })

    super({
      glProgram,
      resources: {
        grassUniforms: {
          uScrollOffset: { value: 0, type: 'f32' },
          uWidth: { value: width, type: 'f32' },
        },
      },
    })
  }

  update(scrollStep: number): void {
    this._scrollOffset += scrollStep
    this.resources.grassUniforms.uniforms.uScrollOffset = this._scrollOffset
  }
}
