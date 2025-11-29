import { api } from "./axios";

export type LoginPayload = {loginID: string, password: string};
export type RegisterPayload = {name: string, email: string, password: string};

export function loginUser(data: LoginPayload){
    return api.post('/api/auth/login',data);
}

export function registerUser(data: RegisterPayload){
    return api.post('/api/auth/register',data);
}