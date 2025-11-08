import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';

const {Pool} = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})

try{
    const res = await pool.query('SELECT NOW()');
    console.log('Database connected at ',res.rows[0].now);
}catch(err){
    console.error('Database connection error',err);
}