'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthShell, Button, InlineLink, TextField } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

const registerSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start organizing tasks with live collaboration-ready updates"
      footer={
        <>
          Already registered? <InlineLink href="/login">Sign in</InlineLink>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          setFormError(null);
          try {
            await registerUser(values);
            router.push('/dashboard');
          } catch (error) {
            if (axios.isAxiosError(error)) {
              const message = (error.response?.data as { message?: string })
                ?.message;
              setFormError(
                Array.isArray(message) ? message.join(', ') : message ?? 'Registration failed',
              );
              return;
            }
            setFormError('Registration failed');
          }
        })}
      >
        <TextField
          label="Name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create Account
        </Button>
      </form>
    </AuthShell>
  );
}
