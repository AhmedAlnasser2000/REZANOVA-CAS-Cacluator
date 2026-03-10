# Algebra Display Polish

## Summary
- Fixed post-`R5` display regressions in exact rational output presentation.

## Delivered
- Compacted repeated same-variable factors into exponent form for symbolic exact output and transform-summary math.
- Prevented symbolic result cards from leaking raw plain-text/LaTeX approximation lines on exact rational output paths.

## Verification
- `npm run test:unit -- --run src/lib/symbolic-engine/rational.test.ts src/lib/algebra-transform.test.ts src/lib/modes/calculate.test.ts`
- `npm run test:ui -- --run src/AppMain.ui.test.tsx`
- `npm run test:gate`
