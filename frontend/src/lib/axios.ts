import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_BASE;

export const api = axios.create({
    baseURL: BASE,
    withCredentials: true,
    headers:({
        'Content-Type': 'application/json'
    })
});