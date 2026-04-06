import { api } from "./axios";

export function getAllUsers(){
    return api.get('/api/admin/users');
}

export function getAllBooks(){
    return api.get('/api/admin/books');
}

export function getBookByID(id: number){
    return api.get(`/api/admin/books/${id}`);
}

export function checkifBookExists(title: string, author: string){
    return api.post('/api/admin/books/check',{title,author});
}

export function addNewBook(data: FormData){
    return api.post('/api/admin/books/add', data);
}

export function updateBook(id: number, data: FormData){
    return api.put(`/api/admin/books/${id}`, data);
}

export function deleteBook(id: number){
    return api.delete(`/api/admin/books/${id}`);
}

export function getAllGenres(){
    return api.get('/api/admin/genres');
}

export function addNewGenre(name: string){
    return api.post('/api/admin/genres/add',{name});
}

export function deleteGenre(id: number){
    return api.delete(`/api/admin/genres/${id}`);
}