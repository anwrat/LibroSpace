import { api } from "./axios";

export function getAllUsers(){
    return api.get('/api/admin/users');
}

export function addNewBook(data: FormData){
    return api.post('/api/admin/books/add', data);
}