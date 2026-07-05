import LeftAuth from './LeftAuth';
import RightAuth from './RightAuth';

function AuthPage() {
  return (
    <div className="min-h-screen flex bg-background" id="auth-page">
      <LeftAuth />
      <RightAuth />
    </div>
  );
}

export default AuthPage;