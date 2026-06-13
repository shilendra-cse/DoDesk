import { AppError } from '../../shared/errors/AppError';
import { ErrorCodes } from '../../shared/errors/errorCodes';
import { issueQuery } from './issue.query';
import { teamQuery } from '../teams/team.query';
import {
  CreateIssueInput,
  UpdateIssueInput,
  ListIssuesFilters,
  formatIssue,
  formatIssueMinimal,
  formatDeletedIssue,
} from './issue.types';

export const issueService = {
  async create(input: CreateIssueInput) {
    const team = await teamQuery.findById(input.teamId);
    if (!team) throw new AppError(ErrorCodes.TEAM_NOT_FOUND, 404, 'Team not found');

    const number = await issueQuery.getNextNumber(input.teamId);

    const issue = await issueQuery.create({
      title: input.title,
      description: input.description ?? null,
      state: input.state ?? 'backlog',
      priority: input.priority ?? 0,
      labels: input.labels ?? [],
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      workspaceId: team.workspaceId,
      teamId: input.teamId,
      assigneeId: input.assigneeId ?? null,
      creatorId: input.creatorId,
      number,
    });

    return formatIssue(issue);
  },

  async getById(issueId: string) {
    const issue = await issueQuery.findById(issueId);
    if (!issue) throw new AppError(ErrorCodes.ISSUE_NOT_FOUND, 404, 'Issue not found');
    return formatIssue(issue);
  },

  async getByWorkspace(workspaceId: string, filters: ListIssuesFilters) {
    const issues = await issueQuery.findByWorkspace(workspaceId, filters);
    return issues.map(formatIssue);
  },

  async getByTeam(teamId: string, filters: ListIssuesFilters) {
    const issues = await issueQuery.findByTeam(teamId, filters);
    return issues.map(formatIssue);
  },

  async update(issueId: string, input: UpdateIssueInput) {
    const dataToUpdate: Record<string, unknown> = {};

    if (input.title !== undefined) dataToUpdate.title = input.title;
    if (input.description !== undefined) dataToUpdate.description = input.description;
    if (input.state !== undefined) dataToUpdate.state = input.state;
    if (input.priority !== undefined) dataToUpdate.priority = input.priority;
    if (input.labels !== undefined) dataToUpdate.labels = input.labels;
    if (input.notes !== undefined) dataToUpdate.notes = input.notes;

    if (input.dueDate !== undefined) {
      dataToUpdate.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    if (input.assigneeId !== undefined) {
      dataToUpdate.assigneeId = input.assigneeId || null;
    }

    try {
      const issue = await issueQuery.update(issueId, dataToUpdate);
      return formatIssueMinimal(issue);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new AppError(ErrorCodes.ISSUE_NOT_FOUND, 404, 'Issue not found');
      }
      throw error;
    }
  },

  async delete(issueId: string) {
    try {
      const issue = await issueQuery.delete(issueId);
      return formatDeletedIssue(issue);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new AppError(ErrorCodes.ISSUE_NOT_FOUND, 404, 'Issue not found');
      }
      throw error;
    }
  },
};
