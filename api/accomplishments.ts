import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../utils/firebase.js';
import { verifyAuth } from '../utils/verifyAuth.js';

type AccomplishmentInput = {
  note: string;
  tags?: string[];
  created_at?: string;
};

function serializeCreatedAt(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return '';
}

export async function GET() {
  const snapshot = await db
    .collection('accomplishments')
    .orderBy('created_at', 'desc')
    .get();
  const accomplishments = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      note: data.note,
      tags: data.tags ?? [],
      created_at: serializeCreatedAt(data.created_at),
    };
  });

  return Response.json({ accomplishments });
}

export async function POST(request: Request) {
  const authResult = await verifyAuth(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  const accomplishment = (await request.json()) as AccomplishmentInput;

  const docRef = await db.collection('accomplishments').add({
    note: accomplishment.note,
    tags: accomplishment.tags ?? [],
    created_at: Timestamp.now(),
    userId: authResult.uid,
  });

  return Response.json({ id: docRef.id }, { status: 201 });
}
