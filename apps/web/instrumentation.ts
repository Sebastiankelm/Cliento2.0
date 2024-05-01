/**
 * This file is used to register monitoring instrumentation
 * for your Next.js application.
 */

export async function register() {
  // only run in nodejs runtime
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.MONITORING_INSTRUMENTATION_ENABLED === 'true'
  ) {
    const { registerMonitoringInstrumentation } = await import(
      '@kit/monitoring/instrumentation'
    );

    // Register monitoring instrumentation based on the MONITORING_PROVIDER environment variable.
    return registerMonitoringInstrumentation();
  }
}
