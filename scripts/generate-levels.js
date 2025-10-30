const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

const mdx = (s) => s.trim().replace(/\r\n/g, '\n');

const levels = [
  {
    number: 1,
    slug: 'lv-001',
    title: 'Terminal Whisper',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'stackzero',
    password: 'hollowport',
    hintsConsole: [
      'Hidden bytes ride between prompts; strip the silence to hear them.',
      'Zero-width glyphs survive pasting into xxd.',
    ],
    hintsSource: [
      'ops checklist env names = mnemonic for the decoded phrase',
      'base64 is the final gate once you rebuild the bytes',
    ],
    theme: {
      className: 'level-terminal-whisper',
      cssVars: { '--accent': '#4fa0ff', '--bg': '#060a12' },
    },
    prompt: mdx(`
      ### Terminal Whisper

      The deployment console captured in \`terminal-whisper.log\` looks routine, but the ops lead swore the feed was "haunted."

      1. Inspect the log and note the echoed prompts- there's too much space between them.
      2. Extract the silent glyphs hiding in those gaps, rebuild the binary they represent, and convert to bytes.
      3. Decode the resulting base64 and reconcile it with the mnemonic in \`ops-checklist.txt\`.
      4. Cross-check the fingerprint in \`checksum.md\` once you're convinced nothing got mangled.

      Present the recovered **username** and **password** when you can explain why the Anubis ops team remembered "STACK ZERO HOLLOW PORT."
    `),
    assets: [
      {
        file: 'terminal-whisper.log',
        description: 'Console capture with zero-width binary hidden between prompts.',
        content: `# anubis deploy log - 2035-04-13
[12:03:11] deploy@anubis:~$ whoami\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c
deploy
[12:03:12] deploy@anubis:~$ cat .env.deploy | sed 's/=.*/=REDACTED/'\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c
ANUBIS_STACK=REDACTED
ZERO_SIGNAL=REDACTED
HOLLOW_GRAFT=REDACTED
PORT_TONGUE=REDACTED
TRACE_SEAL=REDACTED
[12:03:13] deploy@anubis:~$ npm run build\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b

> anubis@1.0.0 build
> next build

[ok] Compiled successfully in 23.4s

[12:03:37] deploy@anubis:~$ printf 'seal?'\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c\\u200b\\u200c
seal?
[12:03:38] deploy@anubis:~$ exit
logout
# session closed
`,
      },
      {
        file: 'ops-checklist.txt',
        description: 'Mnemonic for interpreting the decoded phrase.',
        content: `Deployment mnemonic - remember every step:

- STACK: Verify the stack user has the keys loaded.
- ZERO: No lingering zero-delta diffs in git.
- HOLLOW: Hollow out the cache before new seeds.
- PORT: Port-forward secrets once the tunnel is up.

Mnemonic letters spell the credential halves in order.
`,
      },
      {
        file: 'checksum.md',
        description: 'SHA-256 digest of the log for integrity checks.',
        content: `sha256 (terminal-whisper.log) = TODO-COMPUTE-AFTER-FINAL
`,
      },
    ],
  },
  {
    number: 2,
    slug: 'lv-002',
    title: 'Commit to Memory',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'rotglyph',
    password: 'tracevector',
    hintsConsole: [
      'Run the tests. Let the failing output point at the hidden helper.',
      'Rot47 unwinds a surprising amount of punctuation.',
    ],
    hintsSource: [
      'Look for dead code guarded by `LEGACY_MODE`.',
      'Reverse the helper output before decoding.',
    ],
    theme: {
      className: 'level-commit-memory',
      cssVars: { '--accent': '#b879ff', '--bg': '#0d071b' },
    },
    prompt: mdx(`
      ### Commit to Memory

      You inherited an old user service and an equally crusty integration test. There's a cipher taped to the monitor and the console is begging you to run \`npm test\`.

      1. Open \`users.service.ts\` to study what the senior engineer tried to hide under \`LEGACY_MODE\`.
      2. Execute the accompanying spec- \`memory.spec.ts\`- and use the stack trace to locate the dormant helper.
      3. Reverse the helper's output before applying the cipher described in \`HOWTO-rot47.md\`.
      4. The decoded string reveals both credentials when you split it on the colon.

      Enter the **username** and **password** once you've proven the memory leak wasn't the only secret buried in that test suite.
    `),
    assets: [
      {
        file: 'users.service.ts',
        description: 'Legacy TypeScript service with hidden ROT47 payload.',
        content: `export interface UserRecord {
  id: string;
  username: string;
  secret?: string;
}

const USERS: UserRecord[] = [
  { id: '1', username: 'heron' },
  { id: '2', username: 'scarab' },
];

function rot47(s: string) {
  return s
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code < 33 || code > 126) return ch;
      return String.fromCharCode(33 + ((code + 14) % 94));
    })
    .join('');
}

export function findUser(username: string) {
  const found = USERS.find((u) => u.username === username);
  if (!found) return null;

  if (process.env.LEGACY_MODE === '1') {
    // Legacy audit channel - do not delete until we migrate the cypher desk.
    const whisper = rot47('qz%6=6Cg=5{@?E:?8mC6==68:?{FgAE65H2D52');
    console.warn('[audit-channel]', whisper);
  }
  return found;
}

// TODO: port new persistence layer once blueprint is signed off.
`,
      },
      {
        file: 'memory.spec.ts',
        description: 'Test exposes hidden helper and inverted output.',
        content: `import { strict as assert } from 'node:assert';
import { findUser } from './users.service';

function unusedHelper() {
  // The last senior left cryptic notes. Reverse before decoding.
  return ']2b\\\\u006f7qC:@67EI96C6C@?65@C';
}

describe('legacy audit channel', () => {
  it('keeps the glyph alive', () => {
    process.env.LEGACY_MODE = '1';
    const u = findUser('scarab');
    assert.ok(u);
    const reversed = unusedHelper().split('').reverse().join('');
    assert.equal(reversed[0], ':');
  });
});
`,
      },
      {
        file: 'HOWTO-rot47.md',
        description: 'Explains how to decode the helper output.',
        content: `# Quick ROT47 Refresher

1. ROT47 shifts printable ASCII characters by 47 positions.
2. To decode, apply the same transformation- the cipher is symmetric.
3. Only characters between \`!\` (33) and \`~\` (126) participate.
4. After decoding, split the string on \`:\` for username/password.
`,
      },
    ],
  },
  {
    number: 3,
    slug: 'lv-003',
    title: 'Prism Filter',
    mode: 'form',
    kind: 'image',
    asset: 'assets/prism-portrait.png',
    audio: null,
    username: 'prismcode',
    password: 'bluechannel',
    hintsConsole: [
      'Every color channel tells a different story- extract them individually.',
      'Check the diary for EXIF anomalies and palette clues.',
    ],
    hintsSource: [
      'The blue channel encodes a readable grid.',
      'Once you trace the letters, look inside qr-result.txt.',
    ],
    theme: {
      className: 'level-prism-filter',
      cssVars: { '--accent': '#3fe0ff', '--bg': '#031a24' },
    },
    prompt: mdx(`
      ### Prism Filter

      A photographer uploaded \`prism-portrait.png\` along with their diary entry and a mysterious note titled \`qr-result.txt\`.

      1. Examine the portrait and isolate the RGB channels. The histograms look wrong for a daylight shot.
      2. Boost the blue channel or export it as grayscale- the embedded grid resolves into legible glyphs.
      3. Cross-reference the diary entry for where to look once you can read the grid.
      4. Follow the indicated link or coordinates inside \`qr-result.txt\` to extract the two halves of the credential.

      Submit the **username** and **password** once you've proven the prism concealed more signal than noise.
    `),
    assets: [
      {
        file: 'prism-portrait.png',
        description: 'Composite image with blue-channel lettering.',
      },
      {
        file: 'photographer-diary.txt',
        description: 'Journal entry referencing channel isolation.',
        content: `Day 133 - Light Study

The prism behaved like a liar under tungsten. The sensor clipped red, green slept, but blue kept whispering in straight lines.

Remember: export each channel solo next time. The gallery's cipher expects you to read the azimuth coordinates row by row.

- R channel -> aesthetic fluff
- G channel -> noise for misdirection
- B channel -> the grid that spells the true path
`,
      },
      {
        file: 'qr-result.txt',
        description: 'Clue revealed after interpreting the blue grid.',
        content: `Decoded grid:

PRISM CODE
BLUE CHANNEL

Interpretation: username=prismcode password=bluechannel
`,
      },
    ],
  },
  {
    number: 4,
    slug: 'lv-004',
    title: 'Beacon Pulse',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'signalflare',
    password: 'harborbay',
    hintsConsole: [
      'GIF frame delays translate cleanly into Morse.',
      'Plot the decoded coordinates over the harbor map.',
    ],
    hintsSource: [
      'Warehouse numbers ring the dock in clockwise order.',
      'The final word is spelled along the pier markers.',
    ],
    theme: {
      className: 'level-beacon-pulse',
      cssVars: { '--accent': '#ffbd4f', '--bg': '#1b0f03' },
    },
    prompt: mdx(`
      ### Beacon Pulse

      The harbormaster captured a looping lighthouse signal- \`beacon.gif\`- and swears it encodes the location of a contraband drop.

      1. Inspect the GIF's frame delays to reconstruct the Morse transmission.
      2. Translate the Morse to latitude/longitude, then project the point onto \`harbor-map.svg\`.
      3. The pier markers around that coordinate spell the warehouse identifier; check \`morse-cheatsheet.pdf\` if you need a refresher.

      Deliver the **username** and **password** tied to the dock once you've confirmed where the flare will land.
    `),
    assets: [
      { file: 'beacon.gif', description: 'Animated beacon light - TODO to build.' },
      { file: 'harbor-map.svg', description: 'Vector map with pier identifiers - TODO to build.' },
      { file: 'morse-cheatsheet.pdf', description: 'Reference sheet for Morse timings - TODO to build.' },
    ],
  },
  {
    number: 5,
    slug: 'lv-005',
    title: 'Echo Specter',
    mode: 'form',
    kind: 'audio',
    asset: null,
    audio: 'assets/specter-loop.wav',
    username: 'timbrefinder',
    password: 'harmoniclock',
    hintsConsole: [
      'Spectrograms shine light on hidden glyphs.',
      'Intervals between the peaks match chromatic steps.',
    ],
    hintsSource: [
      'Band-pass the 1.6kHz to 2.4kHz window.',
      'Convert semitone offsets with the lookup in mix-notes.md.',
    ],
    theme: {
      className: 'level-echo-specter',
      cssVars: { '--accent': '#ff5d9f', '--bg': '#120410' },
    },
    prompt: mdx(`
      ### Echo Specter

      Someone handed you the loop from the defaced sound installation- \`specter-loop.wav\`- and the engineer's scribbled \`mix-notes.md\`.

      1. Generate a spectrogram; there's a message hiding in the noise floor.
      2. Apply the suggested band-pass filter to isolate the drone intervals.
      3. Translate each interval's semitone offset into letters using the conversion chart.
      4. Verify your transcription against \`spectrogram-example.png\` before submitting.

      When the chords resolve, enter the **username** and **password** that keep the echo contained.
    `),
    assets: [
      { file: 'specter-loop.wav', description: 'Audio loop with embedded spectrogram glyphs - TODO to build.' },
      { file: 'mix-notes.md', description: 'Band-pass instructions and semitone mapping - TODO to build.' },
      { file: 'spectrogram-example.png', description: 'Reference spectrogram - TODO to build.' },
    ],
  },
  {
    number: 6,
    slug: 'lv-006',
    title: 'Palimpsest Ledger',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'vellumcipher',
    password: 'acrostickey',
    hintsConsole: [
      'Subtract the red layer to reveal the column markers.',
      'The Vigenere key is hiding in plain Latin.',
    ],
    hintsSource: [
      'Ledger transcript lines align with the revealed columns.',
      'Read the acrostic vertically once decrypted.',
    ],
    theme: {
      className: 'level-palimpsest-ledger',
      cssVars: { '--accent': '#d4a55d', '--bg': '#111006' },
    },
    prompt: mdx(`
      ### Palimpsest Ledger

      A monastery ledger scan came with curator notes and a transcript. Strip away the red illumination to expose the guide columns, then feed the transcript through the implied Vigenere key.

      Produce the **username** and **password** from the resulting acrostic once you can justify each column assignment.
    `),
    assets: [
      { file: 'ledger-scan.tif', description: 'High-res palimpsest scan - TODO to build.' },
      { file: 'curator-email.eml', description: 'Notes about UV treatment - TODO to build.' },
      { file: 'ledger-transcript.txt', description: 'Latin/Greek transcript - TODO to build.' },
      { file: 'vigenere-wheel.svg', description: 'Reference wheel - TODO to build.' },
    ],
  },
  {
    number: 7,
    slug: 'lv-007',
    title: 'Kryptex Helix',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'spiralkey',
    password: 'ringcipher',
    hintsConsole: [
      'Order the rings the same way the GPS track unwinds.',
      'Alphabet shifts differ per ring.',
    ],
    hintsSource: [
      'field-notes.gpx path orientation gives the key order.',
      'Read outward from the center once aligned.',
    ],
    theme: {
      className: 'level-kryptex-helix',
      cssVars: { '--accent': '#6ad1ff', '--bg': '#021520' },
    },
    prompt: mdx(`
      ### Kryptex Helix

      Decode the rotation engravings on \`helix-plaque.png\` using the ring order hinted by \`field-notes.gpx\`. When the cipher aligns, spiral outward to uncover the credentials.
    `),
    assets: [
      { file: 'helix-plaque.png', description: 'Photo of the sculpture rings - TODO to build.' },
      { file: 'field-notes.gpx', description: 'GPS walkaround log - TODO to build.' },
      { file: 'cipher-ring.stl', description: '3D printable ring reference - TODO to build.' },
    ],
  },
  {
    number: 8,
    slug: 'lv-008',
    title: 'Cicada Chorus',
    mode: 'form',
    kind: 'audio',
    asset: null,
    audio: 'assets/cicada-chorus.flac',
    username: 'primechorus',
    password: 'fibonacciclock',
    hintsConsole: [
      'Chord roots are primes; map them to letters.',
      'Clicks spaced by Fibonacci control the final transposition.',
    ],
    hintsSource: [
      'Overlay the conductor score on the spectrogram.',
      'Transpose back after applying the click-track shift.',
    ],
    theme: {
      className: 'level-cicada-chorus',
      cssVars: { '--accent': '#f6ff7a', '--bg': '#0a0b02' },
    },
    prompt: mdx(`
      ### Cicada Chorus

      The layered choir in \`cicada-chorus.flac\` rides atop a Fibonacci click track documented in \`conductor-score.pdf\`. Convert the prime-numbered chord roots into letters, adjust for the timed transposition, and extract both halves of the login.
    `),
    assets: [
      { file: 'cicada-chorus.flac', description: 'Layered choir stems - TODO to build.' },
      { file: 'conductor-score.pdf', description: 'Annotated score with Fibonacci markers - TODO to build.' },
      { file: 'prime-tone-chart.png', description: 'Mapping of primes to notes - TODO to build.' },
    ],
  },
  {
    number: 9,
    slug: 'lv-009',
    title: 'Null Proxy',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'dnsghost',
    password: 'xorpath',
    hintsConsole: [
      'TXT records hide XOR masks.',
      'Align packet timestamps before XORing streams.',
    ],
    hintsSource: [
      'Look for phantom HTTP request once streams merge.',
      'Request path spells the answer when normalized.',
    ],
    theme: {
      className: 'level-null-proxy',
      cssVars: { '--accent': '#9effc7', '--bg': '#03180d' },
    },
    prompt: mdx(`
      ### Null Proxy

      DNS logs and twin PCAPs disagree about what traversed the uplink. Decode the malformed TXT records, XOR the provided packet captures, and read the resurrected HTTP path for your credential pair.
    `),
    assets: [
      { file: 'nullproxy.zone', description: 'Authoritative zone dump - TODO to build.' },
      { file: 'uplink-a.pcapng', description: 'First packet capture - TODO to build.' },
      { file: 'uplink-b.pcapng', description: 'Second packet capture - TODO to build.' },
      { file: 'dns-lab-notes.md', description: 'Forensic notes - TODO to build.' },
    ],
  },
  {
    number: 10,
    slug: 'lv-010',
    title: 'Hyperglyph Maze',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'polargrid',
    password: 'polybiuscode',
    hintsConsole: [
      'Convert SVG path commands into polar coordinates.',
      'Grouping angles into quadrants yields grid references.',
    ],
    hintsSource: [
      'glyph-key.txt explains the Polybius mapping.',
      'Coordinate order follows path sequence.',
    ],
    theme: {
      className: 'level-hyperglyph-maze',
      cssVars: { '--accent': '#ff8cf9', '--bg': '#1a0217' },
    },
    prompt: mdx(`
      ### Hyperglyph Maze

      \`hyperglyph.svg\` disguises instructions inside its path commands. Convert those vectors to polar coordinates, feed them through the grid in \`glyph-key.txt\`, and let the resulting Polybius indices hand you the credentials.
    `),
    assets: [
      { file: 'hyperglyph.svg', description: 'Maze with hidden polar commands - TODO to build.' },
      { file: 'glyph-key.txt', description: 'Polybius mapping guide - TODO to build.' },
      { file: 'coordinate-solver.ipynb', description: 'Starter notebook - TODO to build.' },
    ],
  },
  {
    number: 11,
    slug: 'lv-011',
    title: 'Satori Sequence',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'blumseed',
    password: 'sevenbit',
    hintsConsole: [
      'Transaction IDs factor cleanly into large primes.',
      'Blum-Blum-Shub output needs 7-bit grouping.',
    ],
    hintsSource: [
      'ledger-sim.py replicates the generator.',
      'Stop once ASCII plain text emerges.',
    ],
    theme: {
      className: 'level-satori-sequence',
      cssVars: { '--accent': '#8fb1ff', '--bg': '#060c21' },
    },
    prompt: mdx(`
      ### Satori Sequence

      Use the factors hidden in \`balance-ledger.xlsx\` to seed the Blum-Blum-Shub generator implemented in \`ledger-sim.py\`. Group the produced bitstream into 7-bit ASCII to recover the login.
    `),
    assets: [
      { file: 'balance-ledger.xlsx', description: 'Spreadsheet with prime IDs - TODO to build.' },
      { file: 'ledger-sim.py', description: 'Generator implementation - TODO to build.' },
      { file: 'primality-report.md', description: 'Factoring notes - TODO to build.' },
    ],
  },
  {
    number: 12,
    slug: 'lv-012',
    title: 'Deepwater Protocol',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'buoysignal',
    password: 'hexdepth',
    hintsConsole: [
      'Firmware blob starts with a zlib header.',
      'Arrange the hex pairs into a 16x16 matrix.',
    ],
    hintsSource: [
      'Depth contours map letters per bathymetry chart.',
      'Matrix diagonals reveal the clue order.',
    ],
    theme: {
      className: 'level-deepwater-protocol',
      cssVars: { '--accent': '#57c0ff', '--bg': '#031018' },
    },
    prompt: mdx(`
      ### Deepwater Protocol

      Crack the compressed config inside \`buoy-firmware.bin\`, place its hex pairs into a 16x16 grid, and overlay the depths using \`bathymetry-map.png\` to read out the credential pair.
    `),
    assets: [
      { file: 'buoy-firmware.bin', description: 'Firmware blob - TODO to build.' },
      { file: 'bathymetry-map.png', description: 'Depth chart - TODO to build.' },
      { file: 'analysis-notebook.ipynb', description: 'Notebook scaffold - TODO to build.' },
    ],
  },
  {
    number: 13,
    slug: 'lv-013',
    title: 'Penumbra Archive',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'glyphweaver',
    password: 'shadowfont',
    hintsConsole: [
      'The PDF embeds a custom font with swapped glyphs.',
      'Export the font to map Unicode code points.',
    ],
    hintsSource: [
      'typeset-instructions.md offers extraction commands.',
      'Corrected glyphs reveal marginal notes.',
    ],
    theme: {
      className: 'level-penumbra-archive',
      cssVars: { '--accent': '#c4c0ff', '--bg': '#08061b' },
    },
    prompt: mdx(`
      ### Penumbra Archive

      Break the custom font swap in \`penumbra-archive.pdf\`. Once \`shadow-font.otf\` is corrected per \`typeset-instructions.md\`, the marginalia exposes the credentials.
    `),
    assets: [
      { file: 'penumbra-archive.pdf', description: 'Encrypted PDF - TODO to build.' },
      { file: 'shadow-font.otf', description: 'Custom font - TODO to build.' },
      { file: 'typeset-instructions.md', description: 'Font extraction guide - TODO to build.' },
    ],
  },
  {
    number: 14,
    slug: 'lv-014',
    title: 'OuroText Terminal',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'ansiadder',
    password: 'ourodecode',
    hintsConsole: [
      'ANSI color codes encode substitution key order.',
      'Reverse the handshake script for the OTP pad.',
    ],
    hintsSource: [
      'Gradient reference defines color-index ordering.',
      'Apply pad to the art once key is derived.',
    ],
    theme: {
      className: 'level-ourotext-terminal',
      cssVars: { '--accent': '#ff9a62', '--bg': '#140604' },
    },
    prompt: mdx(`
      ### OuroText Terminal

      Analyze the ANSI art in \`ourotext-session.txt\`. Derive the substitution alphabet from the color gradients, reverse \`ourotext-client.py\` to generate the one-time pad, and decrypt the embedded message for both credentials.
    `),
    assets: [
      { file: 'ourotext-session.txt', description: 'Telnet log with ANSI art - TODO to build.' },
      { file: 'ourotext-client.py', description: 'Client script - TODO to build.' },
      { file: 'ansi-gradient-reference.png', description: 'Color ordering - TODO to build.' },
    ],
  },
  {
    number: 15,
    slug: 'lv-015',
    title: 'Celestial Lattice',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'sidereal',
    password: 'babylonkey',
    hintsConsole: [
      'Convert RA/Dec into Babylonian intervals.',
      'Sort by sidereal time before mapping.',
    ],
    hintsSource: [
      'observatory-diary.md explains notation quirks.',
      'Attach musical intervals to alphabet positions.',
    ],
    theme: {
      className: 'level-celestial-lattice',
      cssVars: { '--accent': '#7df4ff', '--bg': '#040c15' },
    },
    prompt: mdx(`
      ### Celestial Lattice

      Sky positions in \`celestial-lattice.fits\` translate to musical intervals via \`observatory-diary.md\`. Apply the Babylonian chart to obtain letters and read out the credentials.
    `),
    assets: [
      { file: 'celestial-lattice.fits', description: 'Star catalog subset - TODO to build.' },
      { file: 'observatory-diary.md', description: 'Diary with mapping hints - TODO to build.' },
      { file: 'babylonian-chart.pdf', description: 'Interval conversion chart - TODO to build.' },
    ],
  },
  {
    number: 16,
    slug: 'lv-016',
    title: 'Liminal Knots',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'quipunexus',
    password: 'cordverse',
    hintsConsole: [
      'OBJ vertex distances map to quipu knot spacing.',
      'Triplets index lines in the chant.',
    ],
    hintsSource: [
      'anthropology-notes.txt shows cord color meaning.',
      'Align verse syllables with knot order.',
    ],
    theme: {
      className: 'level-liminal-knots',
      cssVars: { '--accent': '#ffccb5', '--bg': '#150903' },
    },
    prompt: mdx(`
      ### Liminal Knots

      Translate the knot spacing in \`quipu-model.obj\` using the ethnographic guide. The resulting triplets index phrases within \`quipu-chant.wav\`, eventually revealing the login.
    `),
    assets: [
      { file: 'quipu-model.obj', description: '3D cord model - TODO to build.' },
      { file: 'anthropology-notes.txt', description: 'Encoding notes - TODO to build.' },
      { file: 'quipu-chant.wav', description: 'Chant audio - TODO to build.' },
    ],
  },
  {
    number: 17,
    slug: 'lv-017',
    title: 'MirrorScript',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'palindromist',
    password: 'onoma',
    hintsConsole: [
      'CSS mirrors certain glyphs on hover.',
      'SVG mask reveals hidden runes when flipped.',
    ],
    hintsSource: [
      'Onomon alphabet guides transcription.',
      'Read palindromic pairs outward from center.',
    ],
    theme: {
      className: 'level-mirrorscript',
      cssVars: { '--accent': '#ff94d3', '--bg': '#1a051a' },
    },
    prompt: mdx(`
      ### MirrorScript

      Study \`mirrorscript.html\` with \`glyph-mask.svg\` and the scribe notes. Reflect the masked runes and apply the Onomon mapping to claim the credential pair.
    `),
    assets: [
      { file: 'mirrorscript.html', description: 'Palindrome-heavy poem - TODO to build.' },
      { file: 'glyph-mask.svg', description: 'Mask for hidden runes - TODO to build.' },
      { file: 'scribe-journal.md', description: 'Alphabet primer - TODO to build.' },
    ],
  },
  {
    number: 18,
    slug: 'lv-018',
    title: 'Antikythera Decode',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'gearoracle',
    password: 'atticcode',
    hintsConsole: [
      'Gear ratios map Greek months to offsets.',
      'Lua sim outputs Attic numerals.',
    ],
    hintsSource: [
      'merchant-ledger.txt lists the starting month.',
      'Convert Attic numerals after simulation.',
    ],
    theme: {
      className: 'level-antikythera-decode',
      cssVars: { '--accent': '#ffd367', '--bg': '#120b00' },
    },
    prompt: mdx(`
      ### Antikythera Decode

      Feed the correct offsets into \`gear-sim.lua\` based on the blueprint ratios and merchant ledger. Decode the emitted Attic numerals to secure the credentials.
    `),
    assets: [
      { file: 'antikythera-blueprint.svg', description: 'Mechanical diagram - TODO to build.' },
      { file: 'gear-sim.lua', description: 'Gear simulation script - TODO to build.' },
      { file: 'merchant-ledger.txt', description: 'Greek month clues - TODO to build.' },
    ],
  },
  {
    number: 19,
    slug: 'lv-019',
    title: 'Basilisk Loop',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'debruijn',
    password: 'loopcipher',
    hintsConsole: [
      'XOR every 64th entry to find the loop seed.',
      'Construct a De Bruijn sequence of order 4.',
    ],
    hintsSource: [
      'loop-research.pdf outlines the algorithm.',
      'sequence-helper.py verifies your sequence.',
    ],
    theme: {
      className: 'level-basilisk-loop',
      cssVars: { '--accent': '#a9ff8c', '--bg': '#041407' },
    },
    prompt: mdx(`
      ### Basilisk Loop

      The encrypted chat repeats subtly. XOR matching offsets, derive the De Bruijn sequence, and use it to peel back the self-referential cipher for both credentials.
    `),
    assets: [
      { file: 'basilisk-loop.json', description: 'Encrypted chat log - TODO to build.' },
      { file: 'loop-research.pdf', description: 'Whitepaper on the loop - TODO to build.' },
      { file: 'sequence-helper.py', description: 'Verification tool - TODO to build.' },
    ],
  },
  {
    number: 20,
    slug: 'lv-020',
    title: 'Mythos Exchange',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'stacklibrarian',
    password: 'latinphrase',
    hintsConsole: [
      'Email footers leak Dewey decimals.',
      'Combine index rows to target page selections.',
    ],
    hintsSource: [
      'book-scans.zip contains the necessary pages.',
      'Translate the Latin at the end.',
    ],
    theme: {
      className: 'level-mythos-exchange',
      cssVars: { '--accent': '#f7c36b', '--bg': '#211403' },
    },
    prompt: mdx(`
      ### Mythos Exchange

      Mine \`mythos-thread.eml\` and \`library-index.csv\` for Dewey codes, then apply the derived selectors to the scans. The book cipher gifts you the credential pair.
    `),
    assets: [
      { file: 'mythos-thread.eml', description: 'Email chain - TODO to build.' },
      { file: 'library-index.csv', description: 'Catalog mapping - TODO to build.' },
      { file: 'book-scans.zip', description: 'Relevant book excerpts - TODO to build.' },
    ],
  },
  {
    number: 21,
    slug: 'lv-021',
    title: 'Solstice Dial',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'shadowtime',
    password: 'gnomoncode',
    hintsConsole: [
      'Shadow lengths convert to time of day.',
      'Architect blueprint gives latitude skew.',
    ],
    hintsSource: [
      'solar-lookup.md holds the length-to-letter table.',
      'Use winter solstice as the reference.',
    ],
    theme: {
      className: 'level-solstice-dial',
      cssVars: { '--accent': '#ffe99a', '--bg': '#100c02' },
    },
    prompt: mdx(`
      ### Solstice Dial

      Measure the gnomon shadow in \`solstice-dial.jpg\`, adjust for latitude using the blueprint, and map each resulting time to letters via \`solar-lookup.md\`. The sequence spells your login.
    `),
    assets: [
      { file: 'solstice-dial.jpg', description: 'Photograph of dial - TODO to build.' },
      { file: 'architect-blueprint.dxf', description: 'Dial layout - TODO to build.' },
      { file: 'solar-lookup.md', description: 'Shadow ratio table - TODO to build.' },
    ],
  },
  {
    number: 22,
    slug: 'lv-022',
    title: 'Fractal Bloom',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'mandelseed',
    password: 'polarpetal',
    hintsConsole: [
      'Sample the EXR channel for iteration counts.',
      'Convert polar ordering into character order.',
    ],
    hintsSource: [
      'render-script.frag documents the encoding.',
      'sampling-guide.md shows how to read the petals.',
    ],
    theme: {
      className: 'level-fractal-bloom',
      cssVars: { '--accent': '#9cffd6', '--bg': '#02150e' },
    },
    prompt: mdx(`
      ### Fractal Bloom

      Probe \`mandelbloom.exr\` per the shader instructions. Reading the altered iteration counts in polar order yields the credentials.
    `),
    assets: [
      { file: 'mandelbloom.exr', description: 'Fractal render - TODO to build.' },
      { file: 'render-script.frag', description: 'Shader source - TODO to build.' },
      { file: 'sampling-guide.md', description: 'Sampling instructions - TODO to build.' },
    ],
  },
  {
    number: 23,
    slug: 'lv-023',
    title: 'Lattice Drop',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'eulerwalk',
    password: 'chromakey',
    hintsConsole: [
      'The graph describes an Eulerian path.',
      'Node colors correspond to alphabet indices.',
    ],
    hintsSource: [
      'packet-drop.txt logs the traversal order.',
      'chromatic-key.png maps color to letter.',
    ],
    theme: {
      className: 'level-lattice-drop',
      cssVars: { '--accent': '#5af9ff', '--bg': '#041219' },
    },
    prompt: mdx(`
      ### Lattice Drop

      Walk the Eulerian path defined by \`latticedrop.graphml\` using the traversal in \`packet-drop.txt\`. Translate node colors via \`chromatic-key.png\` to spell the credentials.
    `),
    assets: [
      { file: 'latticedrop.graphml', description: 'Graph structure - TODO to build.' },
      { file: 'packet-drop.txt', description: 'Traversal log - TODO to build.' },
      { file: 'chromatic-key.png', description: 'Color legend - TODO to build.' },
    ],
  },
  {
    number: 24,
    slug: 'lv-024',
    title: 'Obsidian Vault',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: null,
    username: 'trimethius',
    password: 'playfairkey',
    hintsConsole: [
      'Tarball unlock requires Trimethius square.',
      'Final plaintext needs Playfair decryption.',
    ],
    hintsSource: [
      'vault-schematic.svg hides the passphrase.',
      'playfair-template.pdf shows the grid layout.',
    ],
    theme: {
      className: 'level-obsidian-vault',
      cssVars: { '--accent': '#4048ff', '--bg': '#04051b' },
    },
    prompt: mdx(`
      ### Obsidian Vault

      Extract the passphrase from \`vault-schematic.svg\`, unlock \`obsidian-vault.tar.gpg\`, then run \`ciphertext.txt\` through a Playfair cipher keyed by earlier solutions. The result is your credential pair.
    `),
    assets: [
      { file: 'obsidian-vault.tar.gpg', description: 'Encrypted archive - TODO to build.' },
      { file: 'vault-schematic.svg', description: 'Blueprint with hidden passphrase - TODO to build.' },
      { file: 'playfair-template.pdf', description: 'Cipher grid - TODO to build.' },
    ],
  },
  {
    number: 25,
    slug: 'lv-025',
    title: 'Ascendant Chorus',
    mode: 'form',
    kind: 'custom',
    asset: null,
    audio: 'assets/chorus-stems.zip',
    username: 'metawarden',
    password: 'finalchime',
    hintsConsole: [
      'Answers from prior levels index the stems.',
      'Timestamps spell the final phrase.',
    ],
    hintsSource: [
      'meta-tracker.xlsx links level numbers to audio entries.',
      'ascendant-console.log documents the alignment rules.',
    ],
    theme: {
      className: 'level-ascendant-chorus',
      cssVars: { '--accent': '#f0baff', '--bg': '#140316' },
    },
    prompt: mdx(`
      ### Ascendant Chorus

      The finale stitches together every solution: line up the entries in \`ascendant-console.log\`, arrange \`chorus-stems.zip\` by timestamp using prior answers, and let \`meta-tracker.xlsx\` verify the order. The aligned initials sing out the concluding credential pair.
    `),
    assets: [
      { file: 'ascendant-console.log', description: 'Meta puzzle log - TODO to build.' },
      { file: 'chorus-stems.zip', description: 'Audio stems - TODO to build.' },
      { file: 'meta-tracker.xlsx', description: 'Tracker sheet - TODO to build.' },
    ],
  },
];

async function generateLevels(options = {}) {
  const { rootDir = path.join(process.cwd(), 'levels') } = options;
  await fs.mkdir(rootDir, { recursive: true });

  for (const lvl of levels) {
    const dir = path.join(rootDir, lvl.slug);
    await fs.rm(dir, { recursive: true, force: true });
    const assetsDir = path.join(dir, 'assets');
    await fs.mkdir(assetsDir, { recursive: true });

    const salt = crypto.randomBytes(16);
    const userHash = crypto.scryptSync(normalize(lvl.username), salt, 32);
    const passHash = crypto.scryptSync(normalize(lvl.password), salt, 32);

    const cfg = {
      slug: lvl.slug,
      number: lvl.number,
      title: lvl.title,
      mode: lvl.mode,
      kind: lvl.kind,
      mdx: 'prompt.mdx',
      saltHex: salt.toString('hex'),
      userHashHex: userHash.toString('hex'),
      passHashHex: passHash.toString('hex'),
      hintsConsole: lvl.hintsConsole,
      hintsSource: lvl.hintsSource,
      theme: lvl.theme,
    };
    if (lvl.asset) cfg.asset = lvl.asset;
    if (lvl.audio) cfg.audio = lvl.audio;

    await fs.writeFile(path.join(dir, 'level.json'), JSON.stringify(cfg, null, 2) + '\n');
    await fs.writeFile(path.join(dir, 'prompt.mdx'), mdx(lvl.prompt) + '\n');

    const manifestLines = [
      `# Asset Manifest - ${lvl.title}`,
      '',
      ...lvl.assets.map((asset) => {
        const status = asset.content ? 'x' : ' ';
        return `- [${status}] \`${asset.file}\` - ${asset.description}`;
      }),
      '',
      `> Credential outcome -> username: \`${lvl.username}\`, password: \`${lvl.password}\``,
      '',
      '_Replace placeholder files marked TODO with the final puzzle assets when ready._',
      '',
    ];
    await fs.writeFile(path.join(assetsDir, 'manifest.md'), manifestLines.join('\n'));

    for (const asset of lvl.assets) {
      if (!asset.file || asset.file === 'manifest.md') continue;
      const assetPath = path.join(assetsDir, asset.file);
      await fs.mkdir(path.dirname(assetPath), { recursive: true });
      const content =
        typeof asset.content === 'string'
          ? asset.content
          : `TODO: Build ${asset.file} - ${asset.description}\n`;
      await fs.writeFile(assetPath, content);
    }
  }
}

module.exports = {
  levels,
  normalize,
  mdx,
  generateLevels,
};

if (require.main === module) {
  generateLevels().catch((err) => {
    console.error('[generate-levels] failed:', err);
    process.exitCode = 1;
  });
}

