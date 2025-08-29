import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // 빌드용 린트 규칙 설정
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-object-type': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-img-element': 'warn',
      'import/no-anonymous-default-export': 'warn',
    },
  },
];

export default eslintConfig;
