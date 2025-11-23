import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Used by Docker health checks and monitoring systems
 */
export async function GET() {
  try {
    // Basic health check - application is running
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    // If there's any error, return unhealthy status
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
