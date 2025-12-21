
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action } = body;

        // Safety: In a real prod env, we'd check process.env.NODE_ENV
        // For this demo/simulation context, we allow it but log heavily.
        console.log(`[ADMIN_SIMULATION] Received action: ${action}`);

        let command = '';
        const cwd = process.cwd();

        switch (action) {
            case 'RESET_AND_SEED':
                // Runs the full realistic simulation seed
                command = 'npx tsx prisma/seed_realistic_simulation.ts';
                break;

            case 'INJECT_NEGLECTED':
                command = 'npx tsx prisma/inject_neglected_lead.ts';
                break;

            case 'INJECT_HOT':
                command = 'npx tsx prisma/inject_hot_lead.ts';
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Execute the command
        const { stdout, stderr } = await execPromise(command, { cwd });

        return NextResponse.json({
            success: true,
            message: 'Simulation command executed successfully',
            logs: stdout
        });

    } catch (error: any) {
        console.error('[ADMIN_SIMULATION_ERROR]', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
