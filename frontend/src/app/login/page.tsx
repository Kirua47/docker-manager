import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
      {/* Background decoration elements (Gradients floutés) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-pulse"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      {/* LoginForm wrapper */}
      <div className="relative z-10 w-full flex justify-center px-4 sm:px-6 lg:px-8">
        <LoginForm />
      </div>
    </div>
  );
}
