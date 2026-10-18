#!/usr/bin/env python3
"""
Builds the self-hosted fonts of the main site: public/fonts/site/*.woff2 and
the @font-face rules in app/site-fonts.css.

Why not next/font/google: it serves Google's subsets as they are — the whole
weight axis (Inter 100-900) and every OpenType feature, including JetBrains
Mono's few hundred code ligatures. The page uses weights 400-700 and none of
those features, and the five files it needed came to 143 KB, all downloaded
before the first screen settles on a phone. These are the same Google files,
same subsets and unicode ranges, cut down to:

  * the weight range the site uses (Inter 400-900, the others 400-700);
  * the layout features text needs: ccmp, locl, kern, mark, mkmk.

What a visitor sees does not change. The fallback faces keep next/font's
metric overrides (computed against Arial), so the swap from fallback to web
font does not move the layout.

Run after changing a family or a range:

    pip install fonttools brotli
    python3 scripts/build-site-fonts.py

Old files in public/fonts/site/ are removed; names carry a content hash, so
they can be cached as immutable (next.config.mjs).
"""
import hashlib
import io
import re
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / 'public' / 'fonts' / 'site'
CSS_FILE = ROOT / 'app' / 'site-fonts.css'
# File names for the <link rel="preload"> tags in app/[locale]/layout.js.
JS_FILE = ROOT / 'lib' / 'siteFonts.js'

# A browser user agent makes Google answer with woff2 and unicode ranges.
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/141.0 Safari/537.36')

FEATURES = ['ccmp', 'locl', 'kern', 'mark', 'mkmk']

# key, Google family, full axis on Google, range kept, subsets, fallback face.
# Space Grotesk has no Cyrillic and no fallback face on purpose: Russian
# headings must fall through to Inter, not to a metric-matched Arial.
FAMILIES = [
    ('inter', 'Inter', '100..900', (400, 900),
     ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
     {'ascent': '90.49%', 'descent': '22.56%', 'size': '107.06%'}),
    ('space-grotesk', 'Space Grotesk', '300..700', (400, 700),
     ['latin', 'latin-ext'], None),
    ('jetbrains-mono', 'JetBrains Mono', '100..800', (400, 700),
     ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
     {'ascent': '75.79%', 'descent': '22.29%', 'size': '134.59%'}),
]


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else data.decode()


def google_faces(family, axis):
    """{subset: (woff2 url, unicode-range)} from the CSS2 API."""
    q = family.replace(' ', '+')
    css = fetch(f'https://fonts.googleapis.com/css2?family={q}:wght@{axis}&display=swap')
    faces = {}
    for name, body in re.findall(r'/\*\s*([a-z-]+)\s*\*/\s*@font-face\s*{([^}]*)}', css):
        url = re.search(r'url\((.+?)\)', body).group(1)
        ur = re.search(r'unicode-range:\s*([^;]+);', body).group(1).strip()
        faces[name] = (url, ur)
    return faces


def slim(raw, wght):
    font = TTFont(io.BytesIO(raw))
    opts = subset.Options()
    opts.layout_features = FEATURES
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=font.getBestCmap().keys())
    sub.subset(font)
    font = instancer.instantiateVariableFont(font, {'wght': wght})
    font.flavor = 'woff2'
    # Keep the source's timestamp: same input, same bytes, same file name.
    font.recalcTimestamp = False
    buf = io.BytesIO()
    font.save(buf)
    return buf.getvalue()


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob('*.woff2'):
        old.unlink()

    rules, files = [], {}
    for key, family, axis, wght, subsets, fallback in FAMILIES:
        faces = google_faces(family, axis)
        for name in subsets:
            url, urange = faces[name]
            before = fetch(url, binary=True)
            data = slim(before, wght)
            digest = hashlib.sha256(data).hexdigest()[:8]
            fname = f'{key}-{name}.{digest}.woff2'
            (OUT_DIR / fname).write_bytes(data)
            files[(key, name)] = fname
            print(f'{fname:44} {len(before):7} -> {len(data):7} bytes')
            rules.append(
                '@font-face {\n'
                f'  font-family: "ec-{key}";\n'
                f'  src: url("/fonts/site/{fname}") format("woff2");\n'
                f'  font-weight: {wght[0]} {wght[1]};\n'
                '  font-style: normal;\n'
                '  font-display: swap;\n'
                f'  unicode-range: {urange};\n'
                '}')
        if fallback:
            rules.append(
                '@font-face {\n'
                f'  font-family: "ec-{key}-fallback";\n'
                '  src: local("Arial");\n'
                f'  ascent-override: {fallback["ascent"]};\n'
                f'  descent-override: {fallback["descent"]};\n'
                '  line-gap-override: 0%;\n'
                f'  size-adjust: {fallback["size"]};\n'
                '}')

    variables = []
    for key, _family, _axis, _wght, _subsets, fallback in FAMILIES:
        stack = f'"ec-{key}"' + (f', "ec-{key}-fallback"' if fallback else '')
        variables.append(f'  --nf-{key}: {stack};')

    CSS_FILE.write_text(
        '/*\n'
        ' * Self-hosted fonts of the main site. Generated by\n'
        ' * scripts/build-site-fonts.py — edit the script, not this file.\n'
        ' * landing.css and globals.css read the --nf-* variables.\n'
        ' */\n'
        + '\n'.join(rules)
        + '\n\n:root {\n' + '\n'.join(variables) + '\n}\n'
    )
    print('wrote', CSS_FILE.relative_to(ROOT))

    entries = '\n'.join(
        f"  '{key}-{name}': '/fonts/site/{fname}',"
        for (key, name), fname in files.items() if name in ('latin', 'cyrillic'))
    JS_FILE.write_text(
        '// Generated by scripts/build-site-fonts.py — edit the script, not this file.\n'
        '// The main-site font files a page may preload, by family and subset.\n'
        'export const SITE_FONTS = {\n' + entries + '\n};\n'
    )
    print('wrote', JS_FILE.relative_to(ROOT))


if __name__ == '__main__':
    main()
