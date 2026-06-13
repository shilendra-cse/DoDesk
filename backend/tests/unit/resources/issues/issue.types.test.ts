import { describe, it, expect } from 'vitest';
import {
  formatIssue,
  formatIssueMinimal,
  formatDeletedIssue,
} from '@/resources/issues/issue.types';
import { buildIssueWithRelations, buildIssueWithMinimalRelations } from '../../../helpers/fixtures';

describe('formatIssue', () => {
  it('builds issueKey from team key and number', () => {
    const issue = buildIssueWithRelations({ number: 42, team: { key: 'ENG', name: 'Engineering', color: '#000' } });

    const formatted = formatIssue(issue);

    expect(formatted.issueKey).toBe('ENG-42');
  });

  it('flattens team and adds commentCount', () => {
    const issue = buildIssueWithRelations();

    const formatted = formatIssue(issue);

    expect(formatted.team).toEqual({ key: 'ENG', name: 'Engineering', color: '#6B7280' });
    expect(formatted.commentCount).toBe(3);
    expect(formatted).not.toHaveProperty('_count');
  });

  it('preserves core issue fields', () => {
    const issue = buildIssueWithRelations();

    const formatted = formatIssue(issue);

    expect(formatted.id).toBe('issue-1');
    expect(formatted.title).toBe('Fix login bug');
    expect(formatted.creator.email).toBe('alice@example.com');
  });
});

describe('formatIssueMinimal', () => {
  it('builds issueKey without commentCount', () => {
    const issue = buildIssueWithMinimalRelations({ number: 7, team: { key: 'DES', name: 'Design' } });

    const formatted = formatIssueMinimal(issue);

    expect(formatted.issueKey).toBe('DES-7');
    expect(formatted).not.toHaveProperty('commentCount');
  });
});

describe('formatDeletedIssue', () => {
  it('builds issueKey for deleted issue response', () => {
    const issue = {
      id: 'issue-1',
      title: 'Fix login bug',
      number: 99,
      team: { key: 'ENG' },
    };

    const formatted = formatDeletedIssue(issue);

    expect(formatted.issueKey).toBe('ENG-99');
    expect(formatted.id).toBe('issue-1');
  });
});
