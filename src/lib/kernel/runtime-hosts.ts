export type KernelRuntimeHostId =
  | 'expression-runtime'
  | 'equation-runtime'
  | 'table-runtime';

export type KernelRuntimeHostDescriptor = {
  id: KernelRuntimeHostId;
  category: 'expression' | 'equation' | 'table';
  entrypoint:
    | 'runExpressionAction'
    | 'runGuardedEquationSolve'
    | 'buildTable';
  description: string;
};

const KERNEL_RUNTIME_HOSTS: Record<KernelRuntimeHostId, KernelRuntimeHostDescriptor> = {
  'expression-runtime': {
    id: 'expression-runtime',
    category: 'expression',
    entrypoint: 'runExpressionAction',
    description: 'Owns the shared expression runtime used by Calculate actions and internal symbolic solve support.',
  },
  'equation-runtime': {
    id: 'equation-runtime',
    category: 'equation',
    entrypoint: 'runGuardedEquationSolve',
    description: 'Owns the guarded Equation solve pipeline and its staged symbolic solve attempts.',
  },
  'table-runtime': {
    id: 'table-runtime',
    category: 'table',
    entrypoint: 'buildTable',
    description: 'Owns the shared table-building runtime while Table remains metadata-linked only.',
  },
};

export function listKernelRuntimeHosts(): KernelRuntimeHostDescriptor[] {
  return Object.values(KERNEL_RUNTIME_HOSTS);
}

export function getKernelRuntimeHostDescriptor(
  hostId: KernelRuntimeHostId,
): KernelRuntimeHostDescriptor {
  return KERNEL_RUNTIME_HOSTS[hostId];
}
