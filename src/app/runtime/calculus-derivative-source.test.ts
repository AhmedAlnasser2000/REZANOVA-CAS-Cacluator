import { describe, expect, it } from 'vitest';

import {
  derivativeEditorInputError,
  normalizeDerivativePointWorkbenchForEditor,
  normalizeDerivativeWorkbenchForEditor,
  normalizePartialDerivativeWorkbenchForEditor,
  strictDerivativeEditorLatex,
} from './calculus-derivative-source';

describe('Calculus natural derivative editor source', () => {
  it('requires complete notation and keeps ordinary and partial screens distinct', () => {
    expect(strictDerivativeEditorLatex('derivative', 't^3+2t')).toBe('');
    expect(strictDerivativeEditorLatex('derivative', 'd/dt(t^3+2t)')).toBe(
      '\\frac{d}{dt}\\left(t^3+2t\\right)',
    );
    expect(strictDerivativeEditorLatex('derivative', '∂/∂t(t^3+2t)')).toBe('');
    expect(strictDerivativeEditorLatex('partialDerivative', 'd/dy(xy+y^2)')).toBe('');
    expect(strictDerivativeEditorLatex('partialDerivative', '∂/∂y(xy+y^2)')).toBe(
      '\\frac{\\partial}{\\partial y}\\left(xy+y^2\\right)',
    );
  });

  it('reports bare, targetless, and cross-screen requests precisely', () => {
    expect(derivativeEditorInputError('derivative', 'c\\sin x')).toBe(
      'Enter a complete derivative request such as d/dz(f(z)).',
    );
    expect(derivativeEditorInputError('derivative', 'd/d(c\\sin x)')).toBe(
      'Enter the differentiation variable after d/d, for example d/dz(f(z)).',
    );
    expect(derivativeEditorInputError('derivative', '∂/∂x(x^2)')).toBe(
      'Use an ordinary derivative operator on this screen.',
    );
    expect(derivativeEditorInputError('partialDerivative', 'd/dx(xy)')).toBe(
      'Use a partial derivative operator on this screen.',
    );
  });

  it('upgrades legacy body and variable seeds to complete editor notation', () => {
    expect(normalizeDerivativeWorkbenchForEditor(
      { bodyLatex: 't^3+2t', variable: 't' },
      { bodyLatex: '', variable: 'x' },
    )).toEqual({
      bodyLatex: '\\frac{d}{dt}\\left(t^3+2t\\right)',
      variable: 't',
    });
    expect(normalizeDerivativePointWorkbenchForEditor(
      { bodyLatex: 't^2', variable: 't', point: '3' },
      { bodyLatex: '', variable: 'x', point: '' },
    )).toEqual({
      bodyLatex: '\\frac{d}{dt}\\left(t^2\\right)',
      point: '3',
      variable: 't',
    });
    expect(normalizePartialDerivativeWorkbenchForEditor(
      { bodyLatex: 'xy+y^2', variable: 'y' },
      { bodyLatex: '', variable: 'x' },
    )).toEqual({
      bodyLatex: '\\frac{\\partial}{\\partial y}\\left(xy+y^2\\right)',
      variable: 'y',
    });
  });
});
