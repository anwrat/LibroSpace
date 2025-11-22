import axios from 'axios';

const BASE = process.env.API_BASE;

export const api = axios.create({
    baseURL: BASE,
    withCredentials: true,
    headers:({
        'Content-Type': 'application/json'
    })
});