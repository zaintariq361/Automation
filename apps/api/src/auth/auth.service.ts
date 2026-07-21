import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { slugify } from "../common/utils/slugify";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";

interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.companyName,
        slug: slugify(dto.companyName),
        users: {
          create: {
            email: dto.email,
            name: dto.name,
            passwordHash,
            role: "OWNER",
          },
        },
      },
      include: { users: true },
    });

    const user = tenant.users[0];
    return this.issueToken(user.id, tenant.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    return this.issueToken(user.id, user.tenantId, user.email, user.role);
  }

  private issueToken(userId: string, tenantId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, tenantId, email, role };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: userId, tenantId, email, role },
    };
  }
}
