'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
    Share2, 
    Copy, 
    Eye, 
    EyeOff, 
    Loader2, 
    CheckCircle, 
    AlertCircle,
    ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import { generatePublicToken, revokePublicAccess, getPublicMeetingInfo } from '@/actions/meetings';

export function MeetingShareCard({ meetingId, meetingTitle }) {
    const [isPublic, setIsPublic] = useState(false);
    const [publicUrl, setPublicUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadPublicInfo();
    }, [meetingId]);

    const loadPublicInfo = async () => {
        try {
            const info = await getPublicMeetingInfo(meetingId);
            setIsPublic(info.isPublic);
            setPublicUrl(info.publicUrl || '');
        } catch (error) {
            console.error('Error loading public info:', error);
            toast.error('Failed to load sharing settings');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublic = async (enabled) => {
        setUpdating(true);
        try {
            if (enabled) {
                const token = await generatePublicToken(meetingId);
                const newUrl = `${window.location.origin}/join/${token}`;
                setPublicUrl(newUrl);
                setIsPublic(true);
                toast.success('Public sharing enabled!');
            } else {
                await revokePublicAccess(meetingId);
                setPublicUrl('');
                setIsPublic(false);
                toast.success('Public sharing disabled');
            }
        } catch (error) {
            console.error('Error toggling public access:', error);
            toast.error(error.message || 'Failed to update sharing settings');
        } finally {
            setUpdating(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const openInNewTab = () => {
        window.open(publicUrl, '_blank');
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Public Sharing
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Enable public access</span>
                            {isPublic ? (
                                <Badge variant="secondary" className="text-green-600">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Public
                                </Badge>
                            ) : (
                                <Badge variant="outline">
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Private
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Allow anyone with the link to join this meeting
                        </p>
                    </div>
                    <Switch
                        checked={isPublic}
                        onCheckedChange={handleTogglePublic}
                        disabled={updating}
                    />
                </div>

                {isPublic && publicUrl && (
                    <div className="space-y-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Anyone with this link can join the meeting. Share only with trusted participants.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Public Meeting Link</label>
                            <div className="flex gap-2">
                                <Input
                                    value={publicUrl}
                                    readOnly
                                    className="font-mono text-sm"
                                    onClick={(e) => e.target.select()}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={copyToClipboard}
                                    disabled={!publicUrl}
                                >
                                    {copied ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={openInNewTab}
                                    disabled={!publicUrl}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                onClick={copyToClipboard}
                                disabled={!publicUrl}
                                className="w-full"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy Link
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={openInNewTab}
                                disabled={!publicUrl}
                                className="w-full"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Preview
                            </Button>
                        </div>
                    </div>
                )}

                {updating && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">
                            Updating sharing settings...
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
