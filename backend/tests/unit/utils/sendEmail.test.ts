import { describe, it, expect, vi, beforeEach } from 'vitest';

const { sendMail, createTransport } = vi.hoisted(() => ({
  sendMail: vi.fn().mockResolvedValue({ response: '250 OK' }),
  createTransport: vi.fn(() => ({ sendMail: vi.fn().mockResolvedValue({ response: '250 OK' }) })),
}));

vi.mock('nodemailer', () => ({
  default: { createTransport },
}));

import { sendEmail } from '@/utils/sendEmail';

describe('sendEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTransport.mockReturnValue({ sendMail });
    sendMail.mockResolvedValue({ response: '250 OK' });
  });

  it('sends mail via nodemailer transport', async () => {
    await sendEmail('recipient@example.com', 'Hello', 'Body text');

    expect(createTransport).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'recipient@example.com',
        subject: 'Hello',
        text: 'Body text',
      }),
    );
  });

  it('logs error when sendMail fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    sendMail.mockRejectedValueOnce(new Error('SMTP failed'));

    await sendEmail('recipient@example.com', 'Hello', 'Body text');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
