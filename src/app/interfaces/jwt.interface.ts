import { JwtPayload } from "jsonwebtoken";
import { RoleEnum } from "../modules/user/user.interface";

export default interface IJwtPayload extends JwtPayload {
  id: string;
  role: RoleEnum;
}
