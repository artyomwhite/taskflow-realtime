import Link from 'next/link';
import { Button, InlineLink } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
      <div className="max-w-2xl space-y-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
          TaskFlow Realtime
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Stay on top of your work, in real time
        </h1>
        <p className="text-lg leading-8 text-zinc-600">
          TaskFlow helps teams capture, track, and complete work from one place.
          Secure sign-in, instant updates across devices, and a clear view of
          what needs attention next.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/register">
            <Button>Start for free</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
        </div>
        <p className="text-sm text-zinc-500">
          Already have an account? <InlineLink href="/login">Sign in</InlineLink>
        </p>
      </div>
    </div>
  );
}
