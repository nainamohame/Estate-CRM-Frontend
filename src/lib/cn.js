/**
 * Joins class name fragments and resolves Tailwind utility conflicts so that
 * a later class always wins over an earlier one targeting the exact same CSS
 * property in the exact same state — e.g. `cn('bg-brand-600', className)`
 * lets a caller's `className="bg-white"` override a component's own
 * background without both classes reaching the DOM and letting CSS source
 * order decide the winner. This is a small hand-rolled stand-in for
 * tailwind-merge, covering only the utility groups this app actually uses.
 *
 * The one rule that matters most here: two utilities only belong in the same
 * conflict group if they set the SAME CSS property. `px-4` (padding-left +
 * padding-right) and `py-3` (padding-top + padding-bottom) look similar as
 * strings but touch different properties and must both survive — so must
 * `w-full` next to `max-w-md`, and `border-dotted` next to `border-b`. Two
 * earlier versions of this file got this wrong by grouping on a shared text
 * prefix ("bg-", "border-", "p") rather than the actual property, which
 * silently dropped one class of every such pair app-wide: table cells lost
 * their horizontal padding, modals lost `w-full`, and MoneyText lost its
 * dotted underline. Every group below is checked as an exact, disjoint
 * prefix (or a closed enum) for exactly that reason.
 */

const STATE_PREFIX = /^(hover|focus|focus-visible|active|disabled|dark):/;

// Checked in order; each entry is [key, test]. `test` receives the class with
// any state prefix already stripped. Longer/more specific prefixes that are
// literal substrings of a broader one (e.g. "max-w-" vs "w-") are listed
// first, though since every prefix below ends in its own "-" or is matched
// with `startsWith`, there is no real ambiguity between them.
const RULES = [
  ['bg', (c) => c.startsWith('bg-')],

  ['text-size', (c) => /^text-(?:xs|sm|base|md|lg|xl|2xl|3xl)$/.test(c)],
  ['text-align', (c) => /^text-(?:left|center|right|justify|start|end)$/.test(c)],
  ['text-transform', (c) => /^(?:uppercase|lowercase|capitalize|normal-case)$/.test(c)],
  ['text-color', (c) => c.startsWith('text-')],

  ['border-style', (c) => /^border-(?:solid|dashed|dotted|double|hidden|none)$/.test(c)],
  ['border-width', (c) => /^border(?:-(?:t|r|b|l|x|y))?(?:-\d+)?$/.test(c)],
  ['border-color', (c) => c.startsWith('border-')],

  ['rounded', (c) => c === 'rounded' || c.startsWith('rounded-')],
  ['shadow', (c) => c === 'shadow' || c.startsWith('shadow-')],

  ['max-w', (c) => c.startsWith('max-w-')],
  ['min-w', (c) => c.startsWith('min-w-')],
  ['w', (c) => c.startsWith('w-')],
  ['max-h', (c) => c.startsWith('max-h-')],
  ['min-h', (c) => c.startsWith('min-h-')],
  ['h', (c) => c.startsWith('h-')],

  ['gap-x', (c) => c.startsWith('gap-x-')],
  ['gap-y', (c) => c.startsWith('gap-y-')],
  ['gap', (c) => c.startsWith('gap-')],

  // Each padding/margin axis is its OWN group — px and py must coexist.
  ['p', (c) => c.startsWith('p-')],
  ['px', (c) => c.startsWith('px-')],
  ['py', (c) => c.startsWith('py-')],
  ['pt', (c) => c.startsWith('pt-')],
  ['pr', (c) => c.startsWith('pr-')],
  ['pb', (c) => c.startsWith('pb-')],
  ['pl', (c) => c.startsWith('pl-')],
  ['m', (c) => c.startsWith('m-')],
  ['mx', (c) => c.startsWith('mx-')],
  ['my', (c) => c.startsWith('my-')],
  ['mt', (c) => c.startsWith('mt-')],
  ['mr', (c) => c.startsWith('mr-')],
  ['mb', (c) => c.startsWith('mb-')],
  ['ml', (c) => c.startsWith('ml-')],

  ['display', (c) => /^(?:flex|grid|block|inline|inline-flex|inline-block|hidden)$/.test(c)],
  ['justify', (c) => c.startsWith('justify-')],
  ['items', (c) => c.startsWith('items-')],
];

/** Returns a "state:property" key for classes that should dedupe against each other, or null. */
function conflictKey(cls) {
  const stateMatch = cls.match(STATE_PREFIX);
  const state = stateMatch ? stateMatch[1] : '';
  const unprefixed = stateMatch ? cls.slice(stateMatch[0].length) : cls;

  for (const [key, test] of RULES) {
    if (test(unprefixed)) return `${state}:${key}`;
  }
  return null;
}

export function cn(...inputs) {
  const classes = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(...input.split(/\s+/).filter(Boolean));
    } else if (Array.isArray(input)) {
      classes.push(...cn(...input).split(/\s+/).filter(Boolean));
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  // Later class with the same (state, property) key wins; classes with no
  // recognised key always keep their place.
  const winners = new Map(); // "state:property" -> class
  const ungrouped = [];
  for (const cls of classes) {
    const key = conflictKey(cls);
    if (key === null) {
      ungrouped.push(cls);
    } else {
      winners.set(key, cls);
    }
  }

  return [...ungrouped, ...winners.values()].join(' ');
}
