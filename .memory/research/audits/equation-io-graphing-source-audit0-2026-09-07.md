# EQUATION-IO-GRAPHING-SOURCE-AUDIT0: Equation.io And Calcwiz Graphing

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

## Scope And Evidence Boundary

This audit checks the claims in a user-supplied comparison recap against a pinned Equation.io source capture and the current Calcwiz checkout. It is a research comparison, not an adoption decision or roadmap.

- Equation.io upstream: `https://github.com/aantthony/equation.io`
- captured branch and commit: `main` at `46de692f9b123d5d0691c0f87a340c85cb955e5e`
- captured upstream date: `2026-08-14`
- local mirror: ignored `playground/sources/mirrors/equation-io/`
- license observed: MIT on current `main`; the README identifies the unrelated legacy branch as LGPL-3.0
- review methods: static source inspection, dependency install with lifecycle scripts disabled, production web build, loopback-only preview, browser screenshots and interaction probes, and focused real-app Calcwiz Playwright
- excluded: upstream test/benchmark execution, deployment, external-service use, secrets, code copying, and comparative performance benchmarking

The user explicitly approved the bounded Equation.io install/build/visual run. The risk boundary and exact execution commands are recorded in the task dossier.

## Executive Verdict

The recap's central statement is supported when stated narrowly: **Equation.io is currently ahead of Calcwiz in interactive graphing breadth and GPU-native live-field rendering**. Its current graph language includes several families that Calcwiz Graphing does not currently model: vector fields and slope fields, click-traced integral curves, implicit 3D surfaces, 3D parametric surfaces, state-system simulation, recurrence/cobweb/bifurcation views, probability densities/events/expectations, conformal grids, escape-time fractals, and a compact geometry language.

That is not evidence that Equation.io is generally a stronger CAS, has stronger mathematical proof authority, or is universally faster. Calcwiz is ahead in different dimensions: versioned scene/session/request contracts, OOE-owned cancellation and stale-result legality, explicit bounded stop reasons, real/complex analysis evidence, graph-local assumptions, renderer-neutral SVG recovery, and integration with the app's workspace/History/result-authority model.

The strongest causal performance claim remains unproved. Equation.io's source clearly explains why slider and animated-field interaction can be cheap, and the local slider probe produced zero new shader compilations. But no controlled Calcwiz-versus-Equation.io benchmark was run, so “the GPU design is the primary cause of all perceived smoothness” is a plausible inference, not a verified comparative result.

## Claim Verification Matrix

| Recap claim | Verdict | Source and observed evidence |
| --- | --- | --- |
| Equation.io is ahead specifically in interactive graphing. | Supported with scope | The 22-member `Plot` union in `lib/plot.ts` and the browser cases establish materially wider graph-object coverage. This does not compare CAS solving depth, proof, accessibility, persistence, or app integration. |
| TypeScript plus raw WebGL2, DOM, and Canvas; no Three.js. | Verified | `package.json` has no Three.js dependency; `web/gl.ts`, `web/render2d.ts`, and `web/render3d.ts` use `WebGL2RenderingContext` directly. The overlay and controls use Canvas/DOM. |
| Expressions lower from AST to GLSL. | Verified | `lib/glsl.ts` lowers expression nodes to shader expressions. Field-like 2D/3D routes consume the resulting shader source. This is not universal: geometry polygons and some curve work remain CPU prepared. |
| Fullscreen-triangle fragment passes avoid CPU geometry for field plots. | Verified with qualification | `web/gl.ts` creates one clip-space triangle. Implicit, inequality, scalar, complex, domain, conformal, fractal, vector-field, and implicit-3D field routes use fragment-shader passes; point/polygon/curve/parametric-surface routes use other draw paths. |
| Constants/sliders are uniforms and shader programs are cached by source. | Verified | `ProgramCache` keys vertex plus fragment source and is bounded to 64 entries. A live slider change from `a=2` to `a=4` changed the graph and URL with `0` additional shader compilations. |
| Tests monitor shader compile counts. | Implemented but overstated | `scripts/perf.ts` is a real Playwright performance harness that checks compile deltas and frame health. It is invoked manually by `pnpm perf`; the inspected upstream CI runs typecheck and Vitest, not this harness. |
| Render invalidations are coalesced and static scenes stop rendering. | Verified | `requestRender()` permits one queued requestAnimationFrame with a hidden-tab timer backstop. A new frame is requested only for state, `t`/animated definitions, animated plots, or vector fields. |
| Vector fields use animated line-integral-convolution rendering. | Verified | `web/render2d.ts` performs forward/backward normalized streamline integration and weighted procedural-noise accumulation in the fragment shader. The local `(-y,x)` canvas changed across frames. |
| Clicking vector/slope fields traces integral curves. | Verified | `web/main.ts` adds bounded seeds on a motionless primary click and CPU-integrates a normalized RK4 curve. The `dy/dx=xy` visual changed after a click and displayed the selected curve. Double-click clearing is implemented in source; screenshot hashes were not treated as proof because hover/antialias state changed. |
| Implicit 3D uses GPU ray marching with bounded refinement. | Verified | `web/render3d.ts` intersects a bounding box, takes at most 220 adaptive steps, detects sign changes, applies 24 bisection refinements, computes symbolic-gradient or finite-difference normals, and writes fragment depth. The sphere rendered in the local WebGL2 preview. |
| Parametric surfaces use a static parameter mesh with GPU vertex evaluation and symbolic normals, not implicit ray marching. | Verified; upstream README is stale | Current `web/render3d.ts` builds a fixed `u,v` index grid and evaluates the surface in its vertex shader; its fragment shader uses symbolic tangents when available. The README still says per-fragment Newton ray/surface intersection, which does not match current source. The torus rendered locally. |
| State systems use deterministic RK4 with overload and blow-up guards. | Verified | `lib/state.ts` uses a fixed `1/240` step, a 60-step per-frame cap, stable structural identity, and last-good-value behavior for non-finite stages. `web/main.ts` resets only when state-system identity changes. The pendulum state scene changed across frames and exposed Reset. |
| Equation.io has rich probability graph routes with exact and fallback methods. | Verified | `lib/dist.ts` covers named/derived laws, exact base densities, exact uniform-sum forms, conditional-CDF quadrature, cached view-aware curves, point masses, and sampled/Monte-Carlo fallbacks. `Normal(0,1)` with `P(X<1)` rendered a shaded density and `≈ 0.8413`. |
| One classifier coherently uses notation, value type, and free variables. | Verified | `lib/plot.ts` routes equality/inequality/vector/list/sequence/probability/special forms by expression shape and free-variable sets. Definitions and state values become parameters/uniforms rather than spatial axes. |
| Sequences, recurrences, cobwebs, and bifurcations are first-class. | Verified | `lib/seq.ts` and `lib/plot.ts` distinguish direct sequences, autonomous recurrences/cobwebs, and parameterized recurrence/bifurcation fields. The logistic bifurcation rendered locally. |
| Geometry includes points, lines, segments, polygons, squares, and circles. | Verified with representation nuance | `lib/geom.ts` lowers point arithmetic and these statement forms. Segments/polygons/squares become CPU polygon plots; lines and circles lower to ordinary implicit equations rather than distinct renderer primitives. |
| Complex domain coloring, conformal views, and fractals exist. | Verified | `domain2d`, `conformal2d`, and `fractal2d` are explicit plot variants. `domain(w^2)` rendered genuine phase/magnitude coloring. A bare `w^2` is instead the complex field/equipotential view, so the two should not be conflated. |
| Graph state is URL native. | Verified | `/g/<encoded rows>` reconstructs the document. The live slider changed both the visible definition and URL from `a=2` to `a=4`. |
| Three.js itself is the reason Calcwiz is slower. | Not established | Three.js is a rendering abstraction, not an inherent performance verdict. Calcwiz currently sends CPU-prepared geometry/tiles into SVG, Canvas, or Three.js, whereas Equation.io evaluates many fields in shaders. That pipeline difference is material; blaming the library alone is not justified. |
| Calcwiz should adopt a capability-driven CPU/GPU execution planner. | Reasonable hypothesis, not verified or approved | The proposal fits the observed workload split, but it requires a separate design milestone covering proof/evidence ownership, CPU/GPU numerical agreement, cancellation, fallbacks, device variance, accessibility/export, and regression benchmarks. This audit does not adopt it. |

## Visual Evidence

Equation.io was built and previewed from the pinned mirror with system Google Chrome through its pinned Playwright 1.62.1 package. All observed cases acquired WebGL2, rendered at 1440 by 900, and produced no console or page errors:

- annular inequality: `4 <= x^2+y^2 <= 9`
- animated LIC vector field: `(-y,x)`
- slope field and clicked solution: `dy/dx=xy`
- implicit 3D sphere: `x^2+y^2+z^2=9`
- parametric torus: `(cos(2pi u)(2+cos(2pi v)), sin(2pi u)(2+cos(2pi v)), sin(2pi v))`
- logistic bifurcation: `a_{n+1}=x a_n(1-a_n)`
- probability: `X~Normal(0,1)` and `P(X<1)` -> `≈ 0.8413`
- complex field/equipotential view: `w^2`
- domain coloring: `domain(w^2)`
- state pendulum: `th'=om`, `om'=-sin(th)`, `th(0)=3`, `(sin(th),-cos(th))`
- slider: `a=2`, `y=sin(a x)/a`, changed to `a=4` with zero new shader compilations

Ignored evidence is under `.task_tmp/equation-io-graphing-audit0/`. It is reproducibility material, not tracked product input.

Focused Calcwiz real-app Playwright also passed:

- explicit `z=f(x,y)` precise 2D plus interactive Three/WebGL2 3D
- continuous complex mapping domain color, synchronized component maps, Both view, graph-local complex assumption, and bounded Analyze evidence

The screenshots show a real product-strength Calcwiz shell and evidence surfaces, but also the current breadth gap. Calcwiz has no live GraphRelationIR for general vector fields, ODE/state systems, recurrences, probability plots, conformal/fractal views, implicit 3D, or 3D parametric surfaces. Its complex 3D/Riemann control still displays a prepared-not-implemented placeholder in current source.

## Architecture Comparison

| Area | Equation.io at the captured commit | Calcwiz at the current checkout |
| --- | --- | --- |
| Authoring model | Compact row language; type/free-variable classifier selects plots. | MathLive source is provenance; bounded parser produces versioned `GraphRelationIR`. |
| Primary interactive path | Raw WebGL2; many field expressions execute directly in shaders. | Worker-owned adaptive CPU sampling produces transferable paths, meshes, and complex tiles. |
| 2D field breadth | Implicit, inequality, scalar, complex, domain, conformal, fractal, LIC vector fields. | Explicit/implicit/inequality/chained/piecewise/polar/2D parametric plus complex mapping/trajectory. |
| 3D breadth | Implicit raymarched surfaces, parametric surfaces, points, curves/tubes, systems. | Explicit `z=f(x,y)` real surfaces rendered from CPU-prepared meshes. |
| Dynamic systems | Global `t`, sliders, ODE click traces, fixed-step state integration, vector-state support. | Parameters and animation exist, but no GraphRelationIR for ODE/state/vector-field systems. |
| Discrete/probability | Lists, sequences, cobwebs, bifurcations, density/probability/expectation. | No corresponding first-class GraphRelationIR families. Statistics visualizations live in their own guided workspace rather than Graphing. |
| Correctness/evidence | Deterministic parser/evaluator tests and bounded local algorithms; simpler graph-state model. | Explicit stop reasons, request budgets, cancellation/stale gates, provenance, assumptions, analysis evidence, and versioned scene/session contracts. |
| Rendering portability | WebGL2-centric with Canvas/DOM overlays. | Precise SVG recovery, Canvas complex view, optional private Three/WebGL2 3D. |
| Product integration | URL-native standalone graph document. | Workspace tabs, OOE runtime, app settings, Graph Analyze, and broader Calcwiz shell integration. |

## Build And Maintenance Findings

- Approved install used Corepack pnpm 10.34.5 with `--frozen-lockfile --ignore-scripts`; dependencies occupied about 313 MB inside the ignored mirror.
- `web:build` passed. Its client entry was 223,731 bytes and worker entry 279,525 bytes before compression; total `dist-web` was about 27 MB because the About showcase includes many large PNGs.
- Equation.io requires Node `>=24`. Upstream CI pins Node 24 and pnpm 10.
- Upstream CI uses mutable major action tags rather than immutable SHAs.
- The inspected workflow's push filter names `master`, while the captured/default branch is `main`; pull requests still trigger, but direct `main` push coverage should not be assumed without checking repository settings or correcting the workflow.

## What Calcwiz Should Learn — Without Adopting Anything Yet

1. Treat Equation.io as a serious reference for graph-language breadth and GPU-native field rendering.
2. Separate **renderer technology** from **execution planning**. The useful idea is not “replace Three.js”; it is choosing where a mathematical expression is evaluated and what evidence/fallback accompanies it.
3. If a future Calcwiz milestone considers shader evaluation, begin with a narrow workload whose semantics are already owned, then require CPU/GPU agreement tests, device fallbacks, cancellation, and renderer-independent export/readback.
4. Do not weaken Calcwiz's OOE, evidence, assumptions, or canonical-result boundaries to imitate a visually faster path.
5. Benchmark before claiming causation or speedup. This audit verifies mechanisms and visual behavior, not cross-project latency or frame-rate superiority.

## Conclusion

Equation.io is an excellent and legitimate research candidate. The recap was unusually strong: nearly all concrete source claims were correct. The material corrections are that compile-count checks are in a manual performance harness rather than ordinary CI, parametric-surface documentation is stale relative to source, geometry circles/lines are lowered rather than unique primitives, and comparative performance or architectural prescriptions were presented more confidently than the evidence permits.

The mirror remains context only. No code, assets, dependency, renderer, execution model, or roadmap has been adopted into Calcwiz.
