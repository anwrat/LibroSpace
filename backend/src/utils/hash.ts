import bcrypt from 'bcrypt';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

export async function hashPassword(password: string): Promise<string>{
    // This functions hashes the password and returns promised hashed password
    const hashed = await bcrypt.hash(password, SALT_ROUNDS); //No need to declare type of hashed as it is present in type decalaration (@types/bcrypt)
    return hashed;
}

export async function comparePassword(password: string, hashedPassword: string):Promise<boolean>{
    // This function compares the password with hashed password and returns a promise boolean
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}