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

const float OVERLAY_W = 80.0;   // TILE_SIZE
const float OVERLAY_H = 1000.0; // CANVAS_HEIGHT
const float PIXEL_SIZE = 4.0;

// 3 slabs across, each roughly square
const float SLAB_W = 24.0;    // 3 × 24 = 72, with 4px margins each side
const float SLAB_H = 24.0;
const float GROUT  = 1.0;     // thin grout line

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main(void)
{
    vec4 color = texture(uTexture, vTextureCoord);

    vec2 norm = vTextureCoord / vUvScale;
    vec2 px = norm * vec2(OVERLAY_W, OVERLAY_H);
    px.y -= uScrollOffset;

    // Centre the 3-slab grid within the 80px column (4px padding each side)
    float gridX = px.x - 4.0;

    vec2 rpx = floor(px / PIXEL_SIZE) * PIXEL_SIZE;
    vec2 rgrid = floor(vec2(gridX, px.y) / PIXEL_SIZE) * PIXEL_SIZE;

    float col = floor(rgrid.x / SLAB_W);
    float row = floor(rgrid.y / SLAB_H);
    vec2 slabId = vec2(col, row);

    float localX = mod(rgrid.x, SLAB_W);
    float localY = mod(rgrid.y, SLAB_H);

    // Outside the slab grid (padding) — just darken slightly like a curb edge
    bool outsideGrid = gridX < 0.0 || gridX > SLAB_W * 3.0;

    if (outsideGrid) {
        color.rgb *= 0.8;
    } else {
        bool isGrout = localX < GROUT || localY < GROUT;

        if (isGrout) {
            color.rgb *= 0.72;
        } else {
            // Per-slab subtle tint — keep it close to the base grey
            float tint = hash(slabId) * 0.04 - 0.02;
            color.rgb += tint;

            // Very fine concrete grain
            float grain = hash(floor(rpx / 8.0)) * 0.03 - 0.015;
            color.rgb += grain;

            // Rare crack (~8% of slabs)
            if (hash(slabId + 33.0) > 0.92) {
                vec2 f = vec2(localX / SLAB_W, localY / SLAB_H);
                float angle = hash(slabId * 5.17) * 3.14159;
                vec2 dir = vec2(cos(angle), sin(angle));
                vec2 perp = vec2(-dir.y, dir.x);

                float dist = abs(dot(f - 0.5, perp));
                float along = abs(dot(f - 0.5, dir));

                float crack = step(0.04, dist);
                crack = mix(1.0, crack, step(along, 0.3));
                color.rgb *= mix(0.65, 1.0, crack);
            }
        }
    }

    finalColor = color;
}
`

export class SidewalkFilter extends Filter {
  private _scrollOffset = 0

  constructor() {
    const glProgram = GlProgram.from({ vertex, fragment })

    super({
      glProgram,
      resources: {
        sidewalkUniforms: {
          uScrollOffset: { value: 0, type: 'f32' },
        },
      },
    })
  }

  update(scrollStep: number): void {
    this._scrollOffset += scrollStep
    this.resources.sidewalkUniforms.uniforms.uScrollOffset = this._scrollOffset
  }
}
