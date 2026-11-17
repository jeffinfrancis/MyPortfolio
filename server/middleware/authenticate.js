import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a secret of at least 32 characters");
  }
  return secret;
};

export const validateJwtConfiguration = () => {
  getJwtSecret();
};

export const createAuthToken = (userId) =>
  jwt.sign({ sub: userId.toString() }, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: "1h",
  });

export const authenticate = (req, res, next) => {
  const authorization = req.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.auth = { userId: payload.sub };
    return next();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("JWT_SECRET")) {
      return next(error);
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
