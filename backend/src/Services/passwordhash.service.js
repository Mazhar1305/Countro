import bcrypt from "bcryptjs"
import config from "../configs/config.js";

export function hashPassword(pass) {
  const hashedPassword = bcrypt.hash(pass, config.SALT_ROUNDS)
  return hashedPassword
}


export async function compareHashedPass(password,hashedPassword){
  const comparePass = bcrypt.compare(password,hashedPassword)
  if (!comparePass) {
    return false
  }
  return true
}