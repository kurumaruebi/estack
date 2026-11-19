export function fixedPortsRequested(environment: NodeJS.ProcessEnv): boolean {
  return environment.ESTACK_DEV_FIXED_PORTS === "1";
}

export async function takeFixedPort(
  name: string,
  port: number,
  reservedPorts: ReadonlySet<number>,
  heldPorts: ReadonlySet<number>,
  isAvailable: (port: number) => Promise<boolean>,
): Promise<number> {
  if (reservedPorts.has(port) || heldPorts.has(port) || !(await isAvailable(port))) {
    throw new Error(
      `The ${name} port ${port} is busy. ESTACK_DEV_FIXED_PORTS=1 is set, so the stack stops instead of moving to another port. Stop what holds the port, or change the port in the instance settings.`,
    );
  }
  return port;
}
