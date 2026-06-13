const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://dodesk-client-alb-1530009405.eu-north-1.elb.amazonaws.com',
  'https://dodesk.app',
  'http://dodesk.app',
  'https://api.dodesk.app',
  'https://dodesk-server.onrender.com',
  'https://do-desk.vercel.app',
] as const;

export function buildCorsOrigins(frontendUrl?: string): string[] {
  return [
    ...DEFAULT_CORS_ORIGINS,
    ...(frontendUrl ? [frontendUrl] : []),
  ];
}
