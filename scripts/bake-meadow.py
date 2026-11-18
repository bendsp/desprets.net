"""Bake the cutout grass and view-independent cloud density. Requires Pillow and numpy."""
from pathlib import Path
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFont

out = Path(__file__).resolve().parents[1] / 'public' / 'scene'
rng = random.Random(923)
grass = Image.new('RGBA', (1024, 512))
draw = ImageDraw.Draw(grass)
for cell in range(2):
    for blade in range(68):
        root = max(85, min(427, rng.gauss(256, 54)))
        base = rng.uniform(432, 501)
        length = rng.uniform(105, 392) * (1 - .43 * abs(root - 256) / 170)
        lean = (root - 256) * .36 + rng.uniform(-85, 100)
        width = rng.uniform(2.0, 5.1)
        hue = rng.random()
        tint = np.array([66 + 62*hue, 85 + 55*hue, 33 + 20*hue]) + cell * np.array([14, 8, 0])
        for seg in range(8):
            def edge(step, side):
                t = step / 8
                return (cell*512 + root + lean*t*t + side*width*(1-t),
                        base - length*t + abs(lean)*.28*t*t*t)
            color = tuple((tint * (.68+.048*seg)).astype(int)) + (255,)
            draw.polygon([edge(seg,-1),edge(seg,1),edge(seg+1,1),edge(seg+1,-1)],fill=color)
grass.resize((512,256),Image.Resampling.LANCZOS).save(out/'grass.webp',quality=88,method=6)

# Match the shader's original cloud deck in its own coordinates. Camera direction
# and the moving sun remain uniforms; only the expensive noise is baked.
def fract(x):
    return x - np.floor(x)

def hash2(x,y):
    a,b,c=fract(x*.1031),fract(y*.1031),fract(x*.1031)
    dot=a*(b+33.33)+b*(c+33.33)+c*(a+33.33)
    return fract((a+b+2*dot)*(c+dot))

def noise(x,y):
    i,j=np.floor(x),np.floor(y)
    fx,fy=fract(x),fract(y)
    fx,fy=fx*fx*(3-2*fx),fy*fy*(3-2*fy)
    return ((1-fx)*hash2(i,j)+fx*hash2(i+1,j))*(1-fy)+((1-fx)*hash2(i,j+1)+fx*hash2(i+1,j+1))*fy

def fbm(x,y):
    return .52*noise(x,y)+.26*noise(x*2.07+13,y*2.07+13)+.14*noise(x*4.19+32,y*4.19+32)+.08*noise(x*8.5,y*8.5)

u,v=np.meshgrid((np.arange(512)+.5)/512,(np.arange(256)+.5)/256)
x,y=(u*26-13)*1.45+21,(v*13-13)*3.55+3
cloud=np.clip((fbm(x+.58*fbm(x*2.5,y*2.5),y+.58*fbm(x*2.1+9,y*2.1+9))-.46)/.29,0,1)
Image.fromarray((255*cloud*cloud*(3-2*cloud)).astype('uint8')).save(out/'cloud-density.webp',quality=91,method=6)

# Legends are packed in the same order as the ANSI keycaps in desk-accessories.ts.
labels = (['esc'] + [f'F{i}' for i in range(1,13)] + ['scr','mic','☼'] +
          list('`1234567890-=') + ['back'] +
          ['tab'] + list('QWERTYUIOP[]') + ['\\'] +
          ['caps'] + list("ASDFGHJKL;'") + ['enter'] +
          ['shift'] + list('ZXCVBNM,./') + ['shift'] +
          ['ctrl','opt','cmd','','cmd','opt','fn','ctrl'] +
          ['ins','home','pgup','del','end','pgdn','<','v','>','^'])
assert len(labels) == 87
legends = Image.new('L',(512,256))
draw = ImageDraw.Draw(legends)
for i,label in enumerate(labels):
    font=ImageFont.load_default(size=14 if len(label)<3 else 10)
    draw.text((32*(i%16)+16,32*(i//16)+15),label,font=font,fill=233,anchor='mm')
legends.save(out/'key-legends.webp',lossless=True,method=6)
