import { describe, expect, it } from 'vitest';
import {
  getKernelCapabilityDescriptor,
  getKernelCapabilityForAction,
  getTableBuildCapability,
  listKernelCapabilities,
} from './capabilities';
import { listKernelRuntimeHosts } from './runtime-hosts';

describe('kernel capability registry', () => {
  it('lists only the bounded execution seams in ARCH1', () => {
    expect(listKernelCapabilities().map((entry) => entry.id)).toEqual([
      'expression.evaluate',
      'expression.simplify',
      'expression.factor',
      'expression.expand',
      'equation.solve',
      'table.build',
    ]);
  });

  it('resolves expression actions to the shared expression runtime seam', () => {
    expect(getKernelCapabilityForAction('evaluate')).toEqual(
      getKernelCapabilityDescriptor('expression.evaluate'),
    );
    expect(getKernelCapabilityForAction('factor')).toEqual(
      getKernelCapabilityDescriptor('expression.factor'),
    );
    expect(getKernelCapabilityForAction('solve')).toEqual(
      getKernelCapabilityDescriptor('equation.solve'),
    );
  });

  it('keeps table build as a dedicated runtime seam', () => {
    expect(getTableBuildCapability()).toEqual({
      id: 'table.build',
      category: 'table',
      hostId: 'table-runtime',
      entrypoint: 'buildTable',
      description: 'Build a numeric table through the shared table runtime.',
    });
  });

  it('links each capability to the owning static runtime host', () => {
    expect(getKernelCapabilityDescriptor('expression.evaluate').hostId).toBe('expression-runtime');
    expect(getKernelCapabilityDescriptor('equation.solve').hostId).toBe('equation-runtime');
    expect(getKernelCapabilityDescriptor('table.build').hostId).toBe('table-runtime');
  });

  it('lists the static runtime hosts without widening into jobs or plugins', () => {
    expect(listKernelRuntimeHosts().map((entry) => entry.id)).toEqual([
      'expression-runtime',
      'equation-runtime',
      'table-runtime',
    ]);
  });
});
