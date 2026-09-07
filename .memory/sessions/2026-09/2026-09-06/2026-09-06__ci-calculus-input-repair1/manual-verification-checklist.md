# CI-CALCULUS-INPUT-REPAIR1 Manual Verification Checklist

## Attribution

- primary_agent: codex
- primary_agent_model: gpt-5.6
- primary_agent_family: sol
- contributors: none
- recorded_by_agent: codex
- recorded_by_agent_model: gpt-5.6
- recorded_by_agent_family: sol
- verified_by_agent: codex
- verified_by_agent_model: gpt-5.6
- verified_by_agent_family: sol
- attribution_basis: live

## What Is Achieved Now

- Calculus editors no longer duplicate live opening fences, and fresh derivative requests use the variable written in their complete natural notation.
- Invalid derivative notation stops visibly before execution or History creation; legacy body-plus-variable seeds remain replayable.

## Manual App Steps

1. In Derivative, Derivative at Point, Partial Derivative, Indefinite, Definite, and Improper Integral, type one `(`, clear it, then tap the keypad `(`. Type `x` inside each pair.
2. Run `d/dz(z^3+az)`, `d/dc(c sin x)`, `d/dx(c sin x)`, and `d/dt(t^3+2t)` in Derivative.
3. Run `partial/partial y(xy+y^2)` in Partial Derivative.
4. In Derivative at Point, enter `d/dt(t^2)` and point `3`; copy and replay the result from History.
5. Try a bare expression, `d/d()`, partial notation on Derivative, and ordinary notation on Partial Derivative.

## Expected Results

- Each opening-parenthesis action creates one pair, keeps the cursor inside it, and accepts `x` without a second pair.
- The four ordinary results are `3z^2+a`, `sin(x)`, `c cos(x)`, and `3t^2+2`.
- The partial result is `x+2y`; the point result is `6`, and copy/History replay preserve it.
- Invalid requests show focused notation errors and do not add History entries.
