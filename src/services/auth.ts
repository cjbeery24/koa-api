import { sign, verify, Secret } from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { User } from "@/db/models/User";
import { Role } from "@/db/models/Role";
import { AccessToken } from "@/db/models/AccessToken";
import moment from "moment";
import { useCache } from "@/services/cache/cache";
import { v4 as uuidv4 } from "uuid";
import { RefreshToken } from "@/db/models/RefreshToken";

const secretKey: Secret = process.env.JWT_SECRET_KEY
  ? process.env.JWT_SECRET_KEY
  : "";

export enum Roles {
  GROWER = 1,
  HEAD_GROWER = 2,
  DIRECTOR = 3,
  OWNER = 4,
  MAINTENANCE = 5,
  MANAGER = 6,
  ADMIN = 7,
  FACILITY_MANAGER = 8,
  FARM_MANAGER = 9,
  INTEGRATOR = 10,
  SOFTWARE_DEV = 11,
  GREENHOUSE = 12,
  MAINTENANCE_SUPERVISOR = 13,
}

export type DecodedToken = {
  uid: number;
  r: Roles[];
  rt: string;
  iat: number;
  exp: number;
};

export type TokenPayload = {
  userId: number;
  roles: Roles[];
  refreshToken: string;
  iat: number;
  exp: number;
};

class AuthService {
  private decodeToken(token: string) {
    try {
      const decoded = verify(token, secretKey) as DecodedToken;
      return {
        userId: decoded.uid,
        roles: decoded.r,
        refreshToken: decoded.rt,
        iat: decoded.iat,
        exp: decoded.exp,
      } as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  private async generateRefreshToken(user: User) {
    const refreshToken = uuidv4();
    await RefreshToken.destroy({
      where: {
        userId: user.id,
      },
    });
    await RefreshToken.create({
      id: refreshToken,
      created: moment.utc().format(),
      userId: user.id,
    });
    return refreshToken;
  }

  public async generateToken(
    user: User,
    roles: Role[] = [],
    ttl: number = 86400
  ) {
    const refreshToken = await this.generateRefreshToken(user);

    const token = sign(
      {
        uid: user.id,
        r: roles.map((role) => role.id as Roles),
        rt: refreshToken,
      },
      secretKey,
      { expiresIn: `${ttl}s` }
    );

    AccessToken.create({
      id: token,
      ttl,
      created: moment.utc().format(),
      userId: user.id,
    });

    return token;
  }

  public async retrieveRefreshToken(token: string) {
    const decoded = await this.verifyToken(token);
    if (!decoded) {
      return null;
    }

    return decoded.refreshToken;
  }

  public async refreshAuthToken(refreshTokenString: string) {
    const refreshToken = await RefreshToken.findByPk(refreshTokenString, {
      include: [{ model: User, include: [Role] }],
    });
    if (!refreshToken || !refreshToken.user) {
      return null;
    }
    return await this.generateToken(
      refreshToken.user,
      refreshToken.user?.roles
    );
  }

  public async verifyToken(token: string) {
    const decoded = this.decodeToken(token);
    if (!decoded) {
      return null;
    }
    if (await this.isTokenBlacklisted(token)) {
      return null;
    }
    return decoded;
  }

  public async blacklistToken(token: string) {
    const cache = useCache();
    const decoded = this.decodeToken(token);
    if (decoded) {
      const expiresAt = moment.unix(decoded.exp);
      const currentTime = moment.utc();
      if (expiresAt.isAfter(currentTime)) {
        // Set blacklist expiration to be the same as the expiration of the token
        const ttl = expiresAt.diff(currentTime, "seconds");
        await Promise.all([
          cache.set(`blacklist:${token}`, true, ttl),
          RefreshToken.destroy({
            where: {
              id: decoded.refreshToken,
            },
          }),
        ]);
      }
    }
  }

  public async isTokenBlacklisted(token: string) {
    const cache = useCache();
    const exists = await cache.get(`blacklist:${token}`);
    return exists === true;
  }

  public hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }

  public comparePassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }
}

let authServiceSingleton: AuthService | null = null;

export function useAuthService(): AuthService {
  if (authServiceSingleton) {
    return authServiceSingleton;
  }

  authServiceSingleton = new AuthService();

  return authServiceSingleton;
}
