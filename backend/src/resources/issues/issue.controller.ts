import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { AuthenticatedRequest } from '../../shared/types/express';
import { issueService } from './issue.service';
import { ListIssuesFilters } from './issue.types';

function parseListFilters(query: AuthenticatedRequest['query']): ListIssuesFilters {
  const filters: ListIssuesFilters = {};
  if (typeof query.state === 'string') filters.state = query.state;
  if (typeof query.assignee === 'string') filters.assignee = query.assignee;
  if (typeof query.priority === 'string') filters.priority = query.priority;
  if (typeof query.search === 'string') filters.search = query.search;
  return filters;
}

export const createIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.create({
    ...req.body,
    teamId: req.params.teamId!,
    creatorId: req.user.id,
  });
  sendSuccess(res, { issue }, 201, 'Issue created successfully');
});

export const getIssueById = asyncHandler(async (req, res) => {
  const issue = await issueService.getById(req.params.issueId!);
  sendSuccess(res, { issue });
});

export const getIssuesByWorkspace = asyncHandler(async (req, res) => {
  const issues = await issueService.getByWorkspace(
    req.params.workspaceId!,
    parseListFilters(req.query),
  );
  sendSuccess(res, { issues });
});

export const getIssuesByTeam = asyncHandler(async (req, res) => {
  const issues = await issueService.getByTeam(
    req.params.teamId!,
    parseListFilters(req.query),
  );
  sendSuccess(res, { issues });
});

export const updateIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.update(req.params.issueId!, req.body);
  sendSuccess(res, { issue }, 200, 'Issue updated successfully');
});

export const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.delete(req.params.issueId!);
  sendSuccess(res, { issue }, 200, 'Issue deleted successfully');
});
