import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">🏸 Badminton Rating</h1>
          <p className="text-gray-600">Sign in to track your progress</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
