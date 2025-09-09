import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        // Check for cron job authorization or user authorization
        const authHeader = request.headers.get('authorization');
        const isCronJob = authHeader && authHeader === `Bearer ${process.env.CRON_SECRET}`;
        
        let userId, orgId;
        if (!isCronJob) {
            const authResult = await auth();
            userId = authResult.userId;
            orgId = authResult.orgId;
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const { projectId, summaryId } = await request.json();

        if (!projectId || !summaryId) {
            return NextResponse.json({ 
                error: 'Project ID and Summary ID are required' 
            }, { status: 400 });
        }

        // Get the daily summary
        const summary = await prisma.dailySummary.findUnique({
            where: { id: summaryId },
            include: {
                project: true
            }
        });

        if (!summary) {
            return NextResponse.json({ error: 'Summary not found' }, { status: 404 });
        }

        // Get organization members
        let organizationMembers = [];
        try {
            // For cron jobs, get orgId from the project
            const targetOrgId = orgId || summary.project.organizationId;
            
            if (targetOrgId) {
                const memberships = await clerkClient.organizations.getOrganizationMembershipList({
                    organizationId: targetOrgId,
                });
                
                const userIds = memberships.data.map(membership => membership.publicUserData.userId);
                const users = await clerkClient.users.getUserList({
                    userId: userIds
                });
                
                organizationMembers = users.data
                    .filter(user => user.emailAddresses && user.emailAddresses.length > 0)
                    .map(user => ({
                        email: user.emailAddresses[0].emailAddress,
                        name: user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.username || 'Team Member'
                    }));
            }
        } catch (error) {
            console.error('Error fetching organization members:', error);
            // Fallback to current user if not a cron job
            if (!isCronJob && userId) {
                const currentUser = await clerkClient.users.getUser(userId);
                if (currentUser.emailAddresses && currentUser.emailAddresses.length > 0) {
                    organizationMembers = [{
                        email: currentUser.emailAddresses[0].emailAddress,
                        name: currentUser.firstName && currentUser.lastName 
                            ? `${currentUser.firstName} ${currentUser.lastName}` 
                            : currentUser.username || 'User'
                    }];
                }
            }
        }

        if (organizationMembers.length === 0) {
            return NextResponse.json({ 
                error: 'No email addresses found for organization members' 
            }, { status: 400 });
        }

        // Format the date
        const formattedDate = summary.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Create HTML email content
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Daily Development Summary - ${summary.project.name}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
                .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
                .header { background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%); color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
                .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
                .content { padding: 30px; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
                .stat { text-align: center; }
                .stat-number { font-size: 24px; font-weight: 700; color: #84cc16; }
                .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
                .summary-content { margin: 30px 0; }
                .summary-content h2 { color: #1f2937; margin-top: 30px; margin-bottom: 15px; }
                .summary-content h3 { color: #374151; margin-top: 25px; margin-bottom: 10px; }
                .summary-content ul, .summary-content ol { margin: 10px 0; padding-left: 20px; }
                .summary-content li { margin: 5px 0; }
                .summary-content p { margin: 15px 0; }
                .summary-content code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
                .footer p { margin: 0; color: #666; font-size: 14px; }
                .badge { display: inline-block; background: #84cc16; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 2px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📊 Daily Development Summary</h1>
                    <p>${summary.project.name} • ${formattedDate}</p>
                </div>
                
                <div class="content">
                    <div class="stats">
                        <div class="stat">
                            <div class="stat-number">${summary.commitsCount}</div>
                            <div class="stat-label">Commits</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">+${summary.totalAdditions || 0}</div>
                            <div class="stat-label">Lines Added</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">-${summary.totalDeletions || 0}</div>
                            <div class="stat-label">Lines Removed</div>
                        </div>
                    </div>

                    <div class="summary-content">
                        ${summary.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                    </div>
                </div>

                <div class="footer">
                    <p>This summary was automatically generated by Ascend • ${new Date().getFullYear()}</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Send emails to all organization members
        const emailPromises = organizationMembers.map(member =>
            resend.emails.send({
                from: 'Ascend <reports@yourdomain.com>', // Replace with your domain
                to: member.email,
                subject: `📊 Daily Dev Summary: ${summary.project.name} - ${formattedDate}`,
                html: htmlContent,
                text: `Daily Development Summary - ${summary.project.name}\n\n${summary.content}`
            })
        );

        const emailResults = await Promise.allSettled(emailPromises);
        const successfulEmails = emailResults.filter(result => result.status === 'fulfilled').length;
        const failedEmails = emailResults.filter(result => result.status === 'rejected').length;

        // Update the summary to mark as sent
        await prisma.dailySummary.update({
            where: { id: summaryId },
            data: {
                emailSent: true,
                emailSentAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            emailsSent: successfulEmails,
            emailsFailed: failedEmails,
            recipients: organizationMembers.length,
            message: `Daily summary sent to ${successfulEmails} recipients`
        });

    } catch (error) {
        console.error('Error sending daily summary email:', error);
        return NextResponse.json(
            { error: 'Failed to send daily summary email' },
            { status: 500 }
        );
    }
}

// GET endpoint to check email status
export async function GET(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const summaryId = url.searchParams.get('summaryId');

        if (!summaryId) {
            return NextResponse.json({ error: 'Summary ID required' }, { status: 400 });
        }

        const summary = await prisma.dailySummary.findUnique({
            where: { id: summaryId },
            select: {
                emailSent: true,
                emailSentAt: true
            }
        });

        if (!summary) {
            return NextResponse.json({ error: 'Summary not found' }, { status: 404 });
        }

        return NextResponse.json({
            emailSent: summary.emailSent,
            emailSentAt: summary.emailSentAt
        });

    } catch (error) {
        console.error('Error checking email status:', error);
        return NextResponse.json(
            { error: 'Failed to check email status' },
            { status: 500 }
        );
    }
}
