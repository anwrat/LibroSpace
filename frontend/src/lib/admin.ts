import { api } from "./axios";

export function getAllUsers(){
    return api.get('/api/admin/users');
}