import { jwtVerify } from 'jose';

// Middleware edge runtime me chalta hai, isliye yahan jose use hota hai.
// Tumhare purane jsonwebtoken wale token isse bhi verify ho jate hain.
export async function verifyTokenEdge(token) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return payload;
  } catch {
    return null;
  }
}
