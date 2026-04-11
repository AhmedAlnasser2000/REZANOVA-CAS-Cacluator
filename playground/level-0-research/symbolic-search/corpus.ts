export type SymbolicSearchGuardrailTag =
  | 'exact-capable'
  | 'explicit-x-preference'
  | 'honest-stop-preserved'
  | 'abs-composition-boundary'
  | 'transform-heavy-exact';

export type SymbolicSearchCorpusCase = {
  id: string;
  equationLatex: string;
  tags: SymbolicSearchGuardrailTag[];
};

export const SYMBOLIC_SEARCH_CORPUS: SymbolicSearchCorpusCase[] = [
  {
    id: 'quadratic-periodic-carrier',
    equationLatex: '\\sin\\left(x^2+x\\right)=\\frac{1}{2}',
    tags: ['exact-capable'],
  },
  {
    id: 'cubic-periodic-carrier',
    equationLatex: '\\sin\\left(x^3+x\\right)=\\frac{1}{2}',
    tags: ['exact-capable'],
  },
  {
    id: 'radical-reduced-carrier',
    equationLatex: '\\sin\\left(\\sqrt{x+1}-2\\right)=\\frac{1}{2}',
    tags: ['exact-capable'],
  },
  {
    id: 'absolute-value-reduced-carrier',
    equationLatex: '\\sin\\left(\\left|x-1\\right|\\right)=\\frac{1}{2}',
    tags: ['exact-capable', 'abs-composition-boundary'],
  },
  {
    id: 'shifted-log-reduced-carrier',
    equationLatex: '\\sin\\left(\\ln\\left(x+1\\right)-2\\right)=\\frac{1}{2}',
    tags: ['exact-capable'],
  },
  {
    id: 'explicit-x-log-preference',
    equationLatex: '\\sin\\left(\\ln\\left(x+1\\right)\\right)=\\frac{1}{2}',
    tags: ['exact-capable', 'explicit-x-preference'],
  },
  {
    id: 'abs-composition-exact-reuse',
    equationLatex: '2^{\\left|\\sin\\left(x^3+x\\right)\\right|}=2^{\\frac{1}{2}}',
    tags: ['exact-capable', 'abs-composition-boundary'],
  },
  {
    id: 'abs-composition-guided-boundary',
    equationLatex: '2^{\\left|\\sin\\left(x^5+x\\right)\\right|}=2^{\\frac{1}{2}}',
    tags: ['honest-stop-preserved', 'abs-composition-boundary'],
  },
  {
    id: 'mixed-carrier-guided-boundary',
    equationLatex: '\\sin\\left(\\sqrt{x+1}+x^{\\frac{1}{3}}\\right)=\\frac{1}{2}',
    tags: ['honest-stop-preserved'],
  },
  {
    id: 'nested-sawtooth-guided-boundary',
    equationLatex: '\\arcsin\\left(\\sin\\left(\\ln\\left(\\sqrt{x+1}+\\sqrt{x}\\right)\\right)\\right)=\\frac{1}{2}',
    tags: ['honest-stop-preserved'],
  },
  {
    id: 'nested-radical-transform-exact',
    equationLatex: '\\sqrt{x+\\sqrt{5-x}}=2',
    tags: ['exact-capable', 'transform-heavy-exact'],
  },
  {
    id: 'nested-log-radical-transform-exact',
    equationLatex: '\\ln\\left(\\sqrt{\\log_{3}\\left((x+1)^2\\right)}\\right)=2',
    tags: ['exact-capable', 'transform-heavy-exact'],
  },
];
