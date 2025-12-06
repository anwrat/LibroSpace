import crypto from "crypto";

export function generateOTP(): string{
    const otp = crypto.randomInt(100000,999999); //Generate otp between this range, both ends inclusive
    return otp.toString();
}