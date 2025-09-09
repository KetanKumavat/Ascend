import { NextResponse } from 'next/server';
import { TranscriptionAgent } from '@/lib/transcription-agent';

const activeAgents = new Map();

export async function POST(request) {
    try {
        const { meetingId, action } = await request.json();

        if (action === 'start') {
            if (activeAgents.has(meetingId)) {
                return NextResponse.json({ success: true, message: 'Agent already active' });
            }

            const agent = new TranscriptionAgent(meetingId);
            await agent.start();
            activeAgents.set(meetingId, agent);

            return NextResponse.json({ success: true, message: 'Transcription agent started' });
        }

        if (action === 'stop') {
            const agent = activeAgents.get(meetingId);
            if (agent) {
                await agent.stop();
                activeAgents.delete(meetingId);
            }
            return NextResponse.json({ success: true, message: 'Transcription agent stopped' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Agent control error:', error);
        return NextResponse.json({ error: 'Failed to control agent' }, { status: 500 });
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meetingId');

    return NextResponse.json({
        isActive: activeAgents.has(meetingId),
        activeAgents: activeAgents.size
    });
}
