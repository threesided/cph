import { verifyAuth } from '../utils/verifyAuth.js';

export async function GET(request: Request) {
  const authResult = await verifyAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  return Response.json({ authenticated: true });
}
