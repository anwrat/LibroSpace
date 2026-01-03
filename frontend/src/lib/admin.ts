import { api } from "./axios";

export function getAllUsers(){
    return api.get('/api/admin/users');
}

export function getAllBooks(){
    return api.get('/api/admin/books');
}

export function checkifBookExists(title: string, author: string){
    return api.post('/api/admin/books/check',{title,author});
}

export function addNewBook(data: FormData){
    return api.post('/api/admin/books/add', data);
}