import { registerAs } from '@nestjs/config';

// registerAS를 통해 configObject와 Factory를 설정해준다.
export default registerAs('swagger', async () => {
  return {
    user: process.env.SWAGGER_USER || 'park',
    password: process.env.SWAGGER_PASSWORD || 'park',
  };
});
