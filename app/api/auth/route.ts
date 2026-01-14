import { NextRequest, NextResponse } from 'next/server';
import { validateLogin } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const user = validateLogin(username, password);
  if (user) {
    const { password: _password, ...safeUser } = user;
    void _password;
    return NextResponse.json({ success: true, user: safeUser });
  }
  return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
}
