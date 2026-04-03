import { ComputeEngine } from '@cortex-js/compute-engine';
import { describe, expect, it } from 'vitest';
import { normalizeExactPowerLogNode } from './power-log';

const ce = new ComputeEngine();

function normalize(latex: string, mode: Parameters<typeof normalizeExactPowerLogNode>[1]) {
  const parsed = ce.parse(latex);
  return normalizeExactPowerLogNode(parsed.json, mode);
}

describe('normalizeExactPowerLogNode', () => {
  it('canonicalizes awkward root-power forms toward powers during simplify', () => {
    expect(normalize('\\sqrt[3]{\\sqrt{x}}', 'simplify')?.normalizedLatex).toBe('x^{\\frac{1}{6}}');
    expect(normalize('\\sqrt{x^{1/3}}', 'simplify')?.normalizedLatex).toBe('x^{\\frac{1}{6}}');
    expect(normalize('(\\sqrt{x})^{3}', 'simplify')?.normalizedLatex).toBe('x^{\\frac{3}{2}}');
    expect(normalize('(\\sqrt{x})^{1/3}', 'simplify')?.normalizedLatex).toBe('x^{\\frac{1}{6}}');
  });

  it('keeps plain familiar roots unchanged under simplify', () => {
    expect(normalize('\\sqrt{x}', 'simplify')?.normalizedLatex).toBe('\\sqrt{x}');
    expect(normalize('\\sqrt[3]{x}', 'simplify')?.normalizedLatex).toBe('\\sqrt[3]{x}');
  });

  it('attaches conditions when power rewrites rely on even-root domains', () => {
    expect(normalize('\\sqrt{x^{1/3}}', 'simplify')?.exactSupplementLatex).toEqual([
      '\\text{Conditions: } x\\ge0',
    ]);
    expect(normalize('(\\sqrt{x})^{3}', 'simplify')?.exactSupplementLatex).toEqual([
      '\\text{Conditions: } x\\ge0',
    ]);
  });

  it('normalizes exp and log notation while combining bounded same-base log sums', () => {
    expect(normalize('\\exp(x)', 'simplify')?.normalizedLatex).toBe('e^{x}');
    expect(normalize('\\log_{e}(x)', 'simplify')?.normalizedLatex).toBe('\\ln\\left(x\\right)');
    expect(normalize('\\log_{10}(x)', 'simplify')?.normalizedLatex).toBe('\\log\\left(x\\right)');
    expect(normalize('\\ln(x)+\\ln(x+1)', 'simplify')?.normalizedLatex).toBe('\\ln\\left(x\\left(x+1\\right)\\right)');
    expect(normalize('\\log_{4}(x)+\\log_{4}(y)', 'simplify')?.normalizedLatex).toBe('\\log_{4}\\left(xy\\right)');
  });

  it('adds positivity conditions to bounded log-combine rewrites', () => {
    expect(normalize('\\ln(x)+\\ln(x+1)', 'simplify')?.exactSupplementLatex).toEqual([
      '\\text{Conditions: } x>0,\\;x+1>0',
    ]);
    expect(normalize('\\log_{4}(x)+\\log_{4}(y)', 'simplify')?.exactSupplementLatex).toEqual([
      '\\text{Conditions: } x>0,\\;y>0',
    ]);
  });

  it('compacts repeated multiplicative factors when combining log arguments', () => {
    expect(normalize('\\ln(4x)+\\ln(x^3)', 'simplify')?.normalizedLatex).toBe(
      '\\ln\\left(4x^{4}\\right)',
    );
    expect(normalize('\\log_{4}(x)+\\log_{4}(x^3)', 'simplify')?.normalizedLatex).toBe(
      '\\log_{4}\\left(x^{4}\\right)',
    );
  });

  it('leaves unsupported log identities unchanged under simplify', () => {
    expect(normalize('\\ln(x)-\\ln(y)', 'simplify')?.normalizedLatex).toBe('\\ln\\left(x\\right)-\\ln\\left(y\\right)');
    expect(normalize('\\log(x^2)', 'simplify')?.normalizedLatex).toBe('\\log\\left(x^{2}\\right)');
  });

  it('supports explicit rewrite chips and change-base conversion', () => {
    expect(normalize('x^{1/6}', 'rewrite-root')?.normalizedLatex).toBe('\\sqrt[6]{x}');
    expect(normalize('\\sqrt[3]{\\sqrt{x}}', 'rewrite-power')?.normalizedLatex).toBe('x^{\\frac{1}{6}}');
    expect(normalize('\\log_{4}(x)', 'change-base')?.normalizedLatex).toBe('\\frac{\\ln\\left(x\\right)}{\\ln\\left(4\\right)}');
  });

  it('preprocesses equation notational variants into solver-friendly carriers', () => {
    expect(normalize('x^{1/2}=3', 'equation-preprocess')?.normalizedLatex).toBe('\\sqrt{x}=3');
    expect(normalize('x^{1/6}=2', 'equation-preprocess')?.normalizedLatex).toBe('\\sqrt[6]{x}=2');
    expect(normalize('\\log_{e}(2x+1)=3', 'equation-preprocess')?.normalizedLatex).toBe('\\ln\\left(2x+1\\right)=3');
  });
});
