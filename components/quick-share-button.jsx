'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generatePublicToken, getPublicMeetingInfo } from '@/actions/meetings';

export function QuickShareButton({ meetingId, variant = "outline", size = "default" }) {
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleQuickShare = async () => {
        setLoading(true);
        try {
            // Get current public info
            let publicInfo = await getPublicMeetingInfo(meetingId);
            
            // If not public, make it public
            if (!publicInfo.isPublic) {
                const token = await generatePublicToken(meetingId);
                const publicUrl = `${window.location.origin}/join/${token}`;
                publicInfo = { publicUrl };
            }

            // Copy to clipboard
            await navigator.clipboard.writeText(publicInfo.publicUrl);
            setCopied(true);
            toast.success('Meeting link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error sharing meeting:', error);
            toast.error('Failed to generate sharing link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleQuickShare}
            disabled={loading}
            className="flex items-center gap-2"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : copied ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
                <Share2 className="w-4 h-4" />
            )}
            {loading ? 'Generating...' : copied ? 'Copied!' : 'Share'}
        </Button>
    );
}
