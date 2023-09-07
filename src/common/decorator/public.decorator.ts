import { SetMetadata } from '@nestjs/common';

// Login, signup과 같은 Public 접근을 위해 Decorator 생성
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
