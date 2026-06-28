'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthShell, Button, InlineLink, TextField } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your tasks in real time"
      footer={
        <>
          New here? <InlineLink href="/register">Create an account</InlineLink>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          setFormError(null);
          try {
            await login(values);
            router.push('/dashboard');
          } catch (error) {
            if (axios.isAxiosError(error)) {
              setFormError(
                (error.response?.data as { message?: string })?.message ??
                  'Login failed',
              );
              return;
            }
            setFormError('Login failed');
          }
        })}
      >
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>
    </AuthShell>
  );
}
