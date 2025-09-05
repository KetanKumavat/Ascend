-- CreateIndex
CREATE INDEX "idx_canvas_organization_id" ON "Canvas"("organizationId");

-- CreateIndex
CREATE INDEX "idx_canvas_project_id" ON "Canvas"("projectId");

-- CreateIndex
CREATE INDEX "idx_canvas_created_by" ON "Canvas"("createdById");

-- CreateIndex
CREATE INDEX "idx_canvas_is_default" ON "Canvas"("isDefault");

-- CreateIndex
CREATE INDEX "idx_canvas_org_project_default" ON "Canvas"("organizationId", "projectId", "isDefault");

-- CreateIndex
CREATE INDEX "idx_issue_project_id" ON "Issue"("projectId");

-- CreateIndex
CREATE INDEX "idx_issue_sprint_id" ON "Issue"("sprintId");

-- CreateIndex
CREATE INDEX "idx_issue_assignee_id" ON "Issue"("assigneeId");

-- CreateIndex
CREATE INDEX "idx_issue_reporter_id" ON "Issue"("reporterId");

-- CreateIndex
CREATE INDEX "idx_issue_status" ON "Issue"("status");

-- CreateIndex
CREATE INDEX "idx_issue_priority" ON "Issue"("priority");

-- CreateIndex
CREATE INDEX "idx_issue_project_status" ON "Issue"("projectId", "status");

-- CreateIndex
CREATE INDEX "idx_issue_assignee_project_status" ON "Issue"("assigneeId", "projectId", "status");

-- CreateIndex
CREATE INDEX "idx_issue_reporter_project_status" ON "Issue"("reporterId", "projectId", "status");

-- CreateIndex
CREATE INDEX "idx_meeting_organization_id" ON "Meeting"("organizationId");

-- CreateIndex
CREATE INDEX "idx_meeting_project_id" ON "Meeting"("projectId");

-- CreateIndex
CREATE INDEX "idx_meeting_status" ON "Meeting"("status");

-- CreateIndex
CREATE INDEX "idx_meeting_scheduled_at" ON "Meeting"("scheduledAt");

-- CreateIndex
CREATE INDEX "idx_meeting_created_by" ON "Meeting"("createdById");

-- CreateIndex
CREATE INDEX "idx_meeting_org_project" ON "Meeting"("organizationId", "projectId");

-- CreateIndex
CREATE INDEX "idx_meeting_org_status_scheduled" ON "Meeting"("organizationId", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "idx_meeting_participant_meeting_id" ON "MeetingParticipant"("meetingId");

-- CreateIndex
CREATE INDEX "idx_meeting_participant_user_id" ON "MeetingParticipant"("userId");

-- CreateIndex
CREATE INDEX "idx_transcript_meeting_id" ON "MeetingTranscript"("meetingId");

-- CreateIndex
CREATE INDEX "idx_transcript_created_at" ON "MeetingTranscript"("createdAt");

-- CreateIndex
CREATE INDEX "idx_message_project_id" ON "Message"("projectId");

-- CreateIndex
CREATE INDEX "idx_message_user_id" ON "Message"("userId");

-- CreateIndex
CREATE INDEX "idx_message_created_at" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "idx_project_organization_id" ON "Project"("organizationId");

-- CreateIndex
CREATE INDEX "idx_project_name" ON "Project"("name");

-- CreateIndex
CREATE INDEX "idx_project_created_at" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "idx_sprint_project_id" ON "Sprint"("projectId");

-- CreateIndex
CREATE INDEX "idx_sprint_status" ON "Sprint"("status");

-- CreateIndex
CREATE INDEX "idx_sprint_start_date" ON "Sprint"("startDate");

-- CreateIndex
CREATE INDEX "idx_sprint_end_date" ON "Sprint"("endDate");

-- CreateIndex
CREATE INDEX "idx_user_clerk_user_id" ON "User"("clerkUserId");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "User"("email");
