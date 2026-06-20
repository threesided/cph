import type { DecodedIdToken } from 'firebase-admin/auth';
import { auth } from './firebase';

export async function verifyAuth(request: Request): Promise<DecodedIdToken | Response> {
  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return await auth.verifyIdToken(authorization.slice('Bearer '.length));
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
