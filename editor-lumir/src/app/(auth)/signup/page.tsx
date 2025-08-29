'use client';

import { SignupProvider } from './_context/signupContext';

import EmailSignUpForm from './_ui/SignUp.section/SignUp.panel/EmailSignUpForm.module';

const SignUpContent = () => {
  return (
    <>
      <h1 className='mb-8 text-3xl font-bold md:text-4xl'>회원가입</h1>
      {/* 이메일/비밀번호 회원가입 폼 */}
      <EmailSignUpForm />
    </>
  );
};

export default function SignUpPage() {
  return (
    <SignupProvider>
      <SignUpContent />
    </SignupProvider>
  );
}
