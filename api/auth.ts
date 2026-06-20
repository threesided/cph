import { auth } from '../utils/firebase';

export async function GET(request: Request) {
  const authorization = request.headers.get('Authorization');

  if (authorization?.startsWith('Bearer ')) {
    try {
      await auth.verifyIdToken(authorization.slice('Bearer '.length));
      return Response.json({ authenticated: true });
    } catch {
      return Response.json({ authenticated: false }, { status: 401 });
    }
  }

  // Temporary until client-side Firebase Auth sends a Bearer token.
  return Response.json({ authenticated: true });
}
