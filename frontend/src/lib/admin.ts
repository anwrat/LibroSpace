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

//For book quotes related functions
export function addBookQuote(book_id: number, quote: string, pageNumber: number){
    return api.post('/api/admin/quotes/add',{book_id, quote, pageNumber});
}

export function removeBookQuote(id: number){
    return api.delete(`/api/admin/quotes/${id}`);
}

export function getAllQuotes(){
    return api.get('/api/admin/quotes');
}

export function getAllQuoteRequests(){
    return api.get('/api/admin/quotes/requests');
}

export function updateQuoteRequestStatus(requestId: number, status: string, admin_feedback: string){
    return api.post('/api/admin/quotes/requests/update',{requestId, status, admin_feedback});
}