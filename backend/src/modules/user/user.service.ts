import { verifyFirebaseIdToken } from "@/shared/config/firebase.js";
import { jwtConfig } from "@/shared/config/jwt.config.js";
import { ServerError } from "@/shared/errors/index.js";
import { logger } from "@/shared/logger/index.js";
import type { User } from "@/shared/database/schema/types.js";
import { PASSWORD_SENTINEL } from "./user.constants.js";
import { userRepository } from "./user.repository.js";
import type { AuthResponse, LoginInput, UserDto } from "./user.types.js";

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
  };
}

export async function loginWithFirebase(input: LoginInput): Promise<AuthResponse> {
  const decoded = await verifyFirebaseIdToken(input.idToken);

  const email = decoded.email ?? null;
  const name = decoded.name ?? email ?? "User";

  let user = await userRepository.findByFirebaseUid(decoded.uid);
  if (!user && email) user = await userRepository.findByEmail(email);

  if (!user) {
    user = await userRepository.create({
      firebaseUid: decoded.uid,
      username: email ?? decoded.uid,
      passwordHash: PASSWORD_SENTINEL,
      name,
      email,
      role: "RECEPTIONIST",
    });
    logger.info("Created user profile from Firebase login", { userId: user.id });
  } else if (!user.firebaseUid) {
    user = (await userRepository.linkFirebaseUid(user.id, decoded.uid)) ?? user;
    logger.info("Linked Firebase UID to existing user", { userId: user.id });
  }

  if (!user.active) {
    logger.warn("Login blocked for inactive user", { userId: user.id });
    throw new ServerError("Account is disabled", 403);
  }

  const token = jwtConfig.sign({ sub: user.id, role: user.role });
  logger.info("User logged in", { userId: user.id, role: user.role });
  return { token, user: toUserDto(user) };
}

export const userService = { loginWithFirebase, toUserDto };
