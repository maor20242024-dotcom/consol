import { NextRequest, NextResponse } from 'next/server';
import { getInstagramStatus, formatInstagramStatus } from '@/lib/meta/instagram-status';
import { log } from '@/lib/logger';

/**
 * Instagram Connection Status API
 * GET: Returns current Instagram connection status
 */

export async function GET(req: NextRequest) {
  try {
    log('GET /api/instagram/status - Checking Instagram connection');
    
    const status = await getInstagramStatus();
    const formattedStatus = formatInstagramStatus(status);
    
    return NextResponse.json({
      success: true,
      status: formattedStatus.status,
      message: formattedStatus.message,
      details: formattedStatus.details,
      raw: status // Include raw status for debugging
    });
    
  } catch (error) {
    log('GET /api/instagram/status error', error);
    
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Failed to check Instagram status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
