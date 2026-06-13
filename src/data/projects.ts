export interface Project {
  id: string;
  title: string;
  description?: string;
  tech: string[];
  github: string;
  liveUrl?: string;
  date: string; // ISO date
  status?: "in-progress";
  content: string; // HTML case-study body for the project's full page
}

const projects: Project[] = [
  {
    id: "portfolio-002",
    title: "002 — This Portfolio",
    description:
      "The site you're looking at: a static Next.js portfolio with a hidden, Evangelion-inspired NERV mode. Built with AI assistance as a way to get hands-on with modern web tooling.",
    tech: ["Next.js", "TypeScript", "React"],
    github: "https://github.com/Liam-Sango/Web_Portfolio",
    liveUrl: "https://liam-sango.github.io/Web_Portfolio/",
    date: "2026-06-08",
    content: `
      <p><strong>This is the site you're currently looking at.</strong> It's a
      statically-exported Next.js portfolio with a clean, professional layout —
      and a hidden easter egg: type <code>nerv</code> anywhere on the page to
      flip it into an Evangelion-inspired "NERV mode" with a boot sequence and a
      HUD overlay.</p>

      <h2>Built with AI assistance</h2>
      <p>I built this project with significant help from AI tooling, and I want
      to be upfront about that. It started as a way to learn modern front-end
      development — Next.js, React, TypeScript, and a static-export deploy to
      GitHub Pages — by pairing with an AI assistant rather than working through
      tutorials alone. Reading, questioning, and understanding the generated
      code was the whole point of the exercise.</p>

      <h2>Under the hood</h2>
      <ul>
        <li>Next.js App Router, exported as a fully static site.</li>
        <li>A custom dark-glass design system written in plain CSS.</li>
        <li>Deployed automatically to GitHub Pages on every push to <code>main</code>.</li>
      </ul>
    `,
  },
  {
    id: "caesar-cipher",
    title: "Caesar Cipher Tool",
    description:
      "A command-line Caesar cipher written in pure C. Reads plaintext from a file, applies a configurable shift, and writes the encrypted result — a hands-on look at one of the oldest ciphers in the book.",
    tech: ["C"],
    github: "https://github.com/Liam-Sango/Ceaser-Cypher-Tool",
    date: "2025-11-16",
    content: `
      <p>A command-line tool written in pure C that encrypts text using the
      classic Caesar cipher. It reads plaintext from a file, shifts each letter
      by a user-specified amount, and writes the encrypted text to an output
      file.</p>

      <h2>Features</h2>
      <ul>
        <li>Shifts letters by any value from -26 to +26, wrapping around the
        alphabet.</li>
        <li>Encrypts or decrypts — to decrypt, just run it again with the
        inverse shift.</li>
        <li>Handles inputs up to 2048 characters; non-alphabetic characters are
        collapsed to spaces.</li>
      </ul>

      <p>Writing it in C meant handling the buffers and character maths by hand,
      which made the underlying cipher — and exactly why it's so easy to break —
      far more concrete than just reading about it would have.</p>
    `,
  },
  {
    id: "tic-tac-toe-c",
    title: "Terminal Tic-Tac-Toe",
    description:
      "A two-player Noughts and Crosses game for the terminal, written in pure C. A coordinate-based 3×3 board with automatic win/draw detection and input validation.",
    tech: ["C"],
    github: "https://github.com/Liam-Sango/Tic-Tac-Toe-C",
    date: "2025-11-10",
    content: `
      <p>A two-player game of Noughts and Crosses (Tic-Tac-Toe) that runs
      entirely in the terminal, written in pure C. Players take turns entering
      grid coordinates while the game tracks the board, validates moves, and
      detects wins and draws automatically.</p>

      <h2>Features</h2>
      <ul>
        <li>Classic 3×3 gameplay for two players (X and O).</li>
        <li>A clear, coordinate-based board rendered in the command line.</li>
        <li>Automatic detection of wins, losses, and draws.</li>
        <li>Input validation so you can't play on a square that's already
        taken.</li>
      </ul>

      <p>It's a small project, but a good one for practising game loops, 2D
      arrays, and the kind of exhaustive condition-checking that win detection
      needs.</p>
    `,
  },
  {
    id: "credential-generator-c",
    title: "Credential Generator",
    description:
      "A menu-driven C99 credential generator that produces cryptographically secure output using OpenSSL, with Unicode support via ICU. Generates passwords, passphrases, usernames, full names, random numbers, and custom Unicode strings.",
    tech: ["C", "OpenSSL"],
    github: "https://github.com/Liam-Sango/Credential_Generator_C",
    date: "2025-11-20",
    content: `
      <p>A terminal-based C99 utility for generating randomised credentials and
      identifiers. Rather than rolling its own randomness, it draws
      cryptographically secure bytes from OpenSSL (<code>libssl</code> /
      <code>libcrypto</code>), and handles UTF-8 through the ICU library.</p>

      <h2>Six generators</h2>
      <ul>
        <li><strong>Password</strong> — random printable ASCII at a configurable
        length.</li>
        <li><strong>Passphrase</strong> — a configurable number of
        space-separated words drawn from a wordlist.</li>
        <li><strong>Username</strong> — <code>word1_word2_NNNN</code> from the
        bundled word lists.</li>
        <li><strong>Full name</strong> — first, middle, and surname from the
        name lists.</li>
        <li><strong>Random number</strong> — an integer in a user-defined
        range.</li>
        <li><strong>Custom Unicode string</strong> — a UTF-8 string over a
        user-defined code-point range.</li>
      </ul>

      <p>Generators accept custom wordlist paths or fall back to the bundled
      lists in <code>Files/</code>. The menu-driven interface lets you tune
      lengths, ranges, and word counts per generator at runtime. Built and run
      with a <code>makefile</code> (<code>make</code>, <code>make run</code>,
      <code>make clean</code>); released under the GPLv3.</p>

      <p>Wiring OpenSSL and ICU together by hand in C made the practical side of
      "cryptographically secure" — sourcing real entropy and encoding it safely
      across character sets — far more concrete than a high-level library would
      have.</p>
    `,
  },
  {
    id: "username-generator",
    title: "Username Generator",
    description:
      "A Python command-line tool that reads a list of full names from a file, generates a unique username for each person, and writes the results back out — built as a Certificate III assignment.",
    tech: ["Python"],
    github: "https://github.com/Liam-Sango/ICTPRG302-Username-Generator",
    date: "2025-10-16",
    content: `
      <p>A small Python utility that automates a common IT chore: turning a list
      of people's full names into unique usernames. It reads names from an input
      file, derives a username for each one, makes sure none of them collide,
      and writes the finished list to an output file.</p>

      <h2>What it does</h2>
      <ul>
        <li>Reads a list of full names from a text file.</li>
        <li>Generates a unique username for every person.</li>
        <li>Writes the finished usernames out to a file.</li>
      </ul>

      <p>It was written as an assignment for my Certificate III at Ringwood
      Training — an early exercise in file I/O, string handling, and thinking
      through edge cases like duplicate names.</p>
    `,
  },
  {
    id: "weaver-offensive-sim-2",
    title: "Weaver · Offensive Simulation II",
    tech: ["Python"],
    github:
      "https://github.com/Liam-Sango/Weaver/tree/main/src/Project_3_Offensive_Sim_2",
    date: "2026-06-07",
    status: "in-progress",
    content: "",
  },
  {
    id: "weaver-defensive-framework",
    title: "Weaver · Defensive Framework",
    tech: ["Python"],
    github:
      "https://github.com/Liam-Sango/Weaver/tree/main/src/project_1_Defensive_framework",
    date: "2026-05-22",
    status: "in-progress",
    content: "",
  },
  {
    id: "weaver-offensive-sim-1",
    title: "Weaver · Offensive Simulation I",
    tech: ["Python"],
    github:
      "https://github.com/Liam-Sango/Weaver/tree/main/src/Project_2_Offensive_Sim_1",
    date: "2026-05-22",
    status: "in-progress",
    content: "",
  },
];

export default projects;
