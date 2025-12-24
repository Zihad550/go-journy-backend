import type { JwtPayload } from "jsonwebtoken";
import type { RoleEnum } from "../modules/user/user.interface";

export default interface IJwtPayload extends JwtPayload {
	id: string;
	role: RoleEnum;
}
