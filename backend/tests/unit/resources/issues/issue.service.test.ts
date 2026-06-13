/**
 * Service unit tests WITH MOCKS
 *
 * We test issueService logic only. The database layer (issueQuery, teamQuery)
 * is replaced with fakes so no Postgres is needed.
 *
 * Still a UNIT test — not integration.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@/shared/errors/AppError';
import { ErrorCodes } from '@/shared/errors/errorCodes';
import { buildIssueWithRelations, buildIssueWithMinimalRelations } from '../../../helpers/fixtures';

// Step 1: replace real query modules with controllable fakes
vi.mock('@/resources/issues/issue.query', () => ({
  issueQuery: {
    findById: vi.fn(),
    create: vi.fn(),
    getNextNumber: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findByWorkspace: vi.fn(),
    findByTeam: vi.fn(),
  },
}));

vi.mock('@/resources/teams/team.query', () => ({
  teamQuery: {
    findById: vi.fn(),
  },
}));

// Step 2: import AFTER mocks are registered
import { issueService } from '@/resources/issues/issue.service';
import { issueQuery } from '@/resources/issues/issue.query';
import { teamQuery } from '@/resources/teams/team.query';

describe('issueService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('returns formatted issue when found', async () => {
      const issue = buildIssueWithRelations();
      vi.mocked(issueQuery.findById).mockResolvedValue(issue);

      const result = await issueService.getById('issue-1');

      expect(result.issueKey).toBe('ENG-42');
      expect(issueQuery.findById).toHaveBeenCalledWith('issue-1');
    });

    it('throws 404 when issue is not found', async () => {
      vi.mocked(issueQuery.findById).mockResolvedValue(null);

      await expect(issueService.getById('missing')).rejects.toMatchObject({
        code: ErrorCodes.ISSUE_NOT_FOUND,
        statusCode: 404,
      });
    });
  });

  describe('create', () => {
    it('throws 404 when team does not exist', async () => {
      vi.mocked(teamQuery.findById).mockResolvedValue(null);

      await expect(
        issueService.create({
          title: 'New issue',
          teamId: 'missing-team',
          creatorId: 'user-1',
        }),
      ).rejects.toMatchObject({
        code: ErrorCodes.TEAM_NOT_FOUND,
        statusCode: 404,
      });
    });

    it('creates issue when team exists', async () => {
      const created = buildIssueWithRelations({ number: 10 });
      vi.mocked(teamQuery.findById).mockResolvedValue({
        id: 'team-1',
        workspaceId: 'workspace-1',
      } as never);
      vi.mocked(issueQuery.getNextNumber).mockResolvedValue(10);
      vi.mocked(issueQuery.create).mockResolvedValue(created);

      const result = await issueService.create({
        title: 'New issue',
        teamId: 'team-1',
        creatorId: 'user-1',
      });

      expect(result.issueKey).toBe('ENG-10');
      expect(issueQuery.create).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('maps Prisma P2025 to issue not found', async () => {
      vi.mocked(issueQuery.update).mockRejectedValue({ code: 'P2025' });

      await expect(
        issueService.update('issue-1', { title: 'Updated' }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('returns minimal formatted issue on success', async () => {
      const updated = buildIssueWithMinimalRelations({ title: 'Updated title' });
      vi.mocked(issueQuery.update).mockResolvedValue(updated);

      const result = await issueService.update('issue-1', { title: 'Updated title' });

      expect(result.title).toBe('Updated title');
      expect(result.issueKey).toBe('DES-7');
    });

    it('clears assignee when assigneeId is empty string', async () => {
      const updated = buildIssueWithMinimalRelations();
      vi.mocked(issueQuery.update).mockResolvedValue(updated);

      await issueService.update('issue-1', { assigneeId: '' });

      expect(issueQuery.update).toHaveBeenCalledWith('issue-1', { assigneeId: null });
    });

    it('clears dueDate when dueDate is empty', async () => {
      const updated = buildIssueWithMinimalRelations();
      vi.mocked(issueQuery.update).mockResolvedValue(updated);

      await issueService.update('issue-1', { dueDate: '' });

      expect(issueQuery.update).toHaveBeenCalledWith('issue-1', { dueDate: null });
    });

    it('rethrows non-P2025 errors from update', async () => {
      const dbError = new Error('Database unavailable');
      vi.mocked(issueQuery.update).mockRejectedValue(dbError);

      await expect(issueService.update('issue-1', { title: 'Updated' })).rejects.toThrow(
        'Database unavailable',
      );
    });
  });

  describe('getByWorkspace', () => {
    it('returns formatted issues', async () => {
      vi.mocked(issueQuery.findByWorkspace).mockResolvedValue([buildIssueWithRelations()]);

      const result = await issueService.getByWorkspace('workspace-1', { state: 'todo' });

      expect(result).toHaveLength(1);
      expect(issueQuery.findByWorkspace).toHaveBeenCalledWith('workspace-1', { state: 'todo' });
    });
  });

  describe('getByTeam', () => {
    it('returns formatted issues', async () => {
      vi.mocked(issueQuery.findByTeam).mockResolvedValue([buildIssueWithRelations()]);

      const result = await issueService.getByTeam('team-1', { search: 'bug' });

      expect(result).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('returns formatted deleted issue', async () => {
      vi.mocked(issueQuery.delete).mockResolvedValue({
        id: 'issue-1',
        title: 'Removed',
        number: 3,
        team: { key: 'ENG' },
      } as never);

      const result = await issueService.delete('issue-1');

      expect(result.issueKey).toBe('ENG-3');
    });

    it('maps Prisma P2025 to issue not found', async () => {
      vi.mocked(issueQuery.delete).mockRejectedValue({ code: 'P2025' });

      await expect(issueService.delete('missing')).rejects.toMatchObject({
        code: ErrorCodes.ISSUE_NOT_FOUND,
        statusCode: 404,
      });
    });

    it('rethrows non-P2025 errors from delete', async () => {
      const dbError = new Error('Connection lost');
      vi.mocked(issueQuery.delete).mockRejectedValue(dbError);

      await expect(issueService.delete('issue-1')).rejects.toThrow('Connection lost');
    });
  });
});
