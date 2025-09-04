// Daily.co Integration (Free tier: 1000 minutes/month)
// Sign up at daily.co for free API key

export async function createDailyMeeting(meetingData) {
    try {
        // You'll need to sign up at daily.co and get API key
        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: `ascend-${Date.now()}`,
                properties: {
                    start_time: new Date(meetingData.scheduledAt).getTime() / 1000,
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
                    enable_recording: true,
                    enable_transcription: true
                }
            })
        });

        const room = await response.json();
        
        return {
            meetingUrl: room.url,
            roomName: room.name,
            platform: 'daily',
            features: {
                recording: true,
                transcription: true,
                participants: 20 // Free tier limit
            }
        };
    } catch (error) {
        console.error('Daily.co meeting creation failed:', error);
        throw error;
    }
}
