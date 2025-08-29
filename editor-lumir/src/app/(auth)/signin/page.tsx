'use client';

import { SigninProvider } from './_context/signinContext';
import SocialSignInForm from './_ui/SignIn.section/SignIn.panel/SocialSignInForm.module';
import EmailSigninForm from './_ui/SignIn.section/SignIn.panel/EmailSignInForm.module';

const SignInContent = () => {
  return (
    <>
      <h1 className='mb-8 text-3xl font-bold md:text-4xl'>로그인</h1>
      {/* GitHub 로그인 버튼 */}
      <SocialSignInForm />
      {/* 구분선 */}
      <hr className='my-8 w-full' />
      {/* 이메일/비밀번호 로그인 폼 */}
      <EmailSigninForm />
    </>
  );
};

export default function SignInPage() {
  return (
    <SigninProvider>
      <SignInContent />
    </SigninProvider>
  );
}
