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

const float OVERLAY_W = 320.0;  // LANE_WIDTH = (COLUMN_COUNT-2) * TILE_SIZE
const float OVERLAY_H = 1000.0; // CANVAS_HEIGHT
const float LANE_PX   = 80.0;   // TILE_SIZE

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main(void)
{
    vec4 color = texture(uTexture, vTextureCoord);

    // Normalise UV to 0-1 across the overlay, then convert to pixel coords
    vec2 norm = vTextureCoord / vUvScale;
    vec2 px = norm * vec2(OVERLAY_W, OVERLAY_H);
    px.y -= uScrollOffset;

    // Snap to a coarse pixel grid for retro look
    const float PIXEL_SIZE = 4.0;
    vec2 rpx = floor(px / PIXEL_SIZE) * PIXEL_SIZE;

    // Blocky asphalt grain
    float grain = hash(floor(rpx / 6.0)) * 0.08 - 0.04;
    color.rgb += grain;

    // Larger colour patches
    float patch = hash(floor(rpx / 40.0) + 0.5) * 0.05 - 0.025;
    color.rgb += patch;

    // --- Crack generation (pixelated) ---
    vec2 cellSize = vec2(90.0, 160.0);
    vec2 cellCoord = rpx / cellSize;
    vec2 cellId = floor(cellCoord);
    vec2 f = fract(cellCoord);

    // ~18 % of cells have a crack
    if (hash(cellId) > 0.82) {
        // Main crack — a blocky line at a random angle
        float angle = hash(cellId * 7.13) * 3.14159;
        vec2 dir = vec2(cos(angle), sin(angle));
        vec2 perp = vec2(-dir.y, dir.x);

        float dist = abs(dot(f - 0.5, perp));
        float along = abs(dot(f - 0.5, dir));

        // Hard step for pixel-art crispness
        float crack = step(0.03, dist);
        crack = mix(1.0, crack, step(along, 0.38));
        color.rgb *= mix(0.55, 1.0, crack);

        // 50 % chance of a branch crack
        if (hash(cellId + 99.0) > 0.5) {
            float angle2 = angle + 0.5 + hash(cellId + 77.0) * 0.6;
            vec2 dir2 = vec2(cos(angle2), sin(angle2));
            vec2 perp2 = vec2(-dir2.y, dir2.x);

            float dist2 = abs(dot(f - 0.5, perp2));
            float along2 = abs(dot(f - 0.5, dir2));

            float crack2 = step(0.025, dist2);
            crack2 = mix(1.0, crack2, step(along2, 0.3));
            color.rgb *= mix(0.62, 1.0, crack2);
        }
    }

    // --- Dashed lane dividers ---
    // 4 lanes each 80px wide; boundaries at x = 80, 160, 240
    const float DASH_LEN    = 30.0;
    const float DASH_PERIOD = 80.0;
    const float DASH_HALF_W = 2.0;

    for (int i = 1; i <= 3; i++) {
        float lineX = float(i) * LANE_PX;
        float dx = abs(px.x - lineX);
        if (dx < DASH_HALF_W) {
            float phase = mod(px.y, DASH_PERIOD);
            if (phase < DASH_LEN) {
                color.rgb = mix(color.rgb, vec3(0.87), 0.6);
            }
        }
    }

    finalColor = color;
}
`

export class AsphaltCrackFilter extends Filter {
  private _scrollOffset = 0

  constructor() {
    const glProgram = GlProgram.from({ vertex, fragment })

    super({
      glProgram,
      resources: {
        asphaltUniforms: {
          uScrollOffset: { value: 0, type: 'f32' },
        },
      },
    })
  }

  update(scrollStep: number): void {
    this._scrollOffset += scrollStep
    this.resources.asphaltUniforms.uniforms.uScrollOffset = this._scrollOffset
  }
}
