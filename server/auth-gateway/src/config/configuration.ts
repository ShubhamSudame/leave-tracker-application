export default () => ({
  port: Number(process.env.PORT) || 3000,
  jwt: {
    access: {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
    },
    refresh: {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY,
    },
    privateKey: process.env.JWT_PRIVATE_KEY_PATH,
    publicKey: process.env.JWT_PUBLIC_KEY_PATH,
    algorithm: process.env.JWT_ALGORITHM,
  },
  timeoutInterval: process.env.TIMEOUT_INTERVAL,
});
