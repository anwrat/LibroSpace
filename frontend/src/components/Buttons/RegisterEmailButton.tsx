'use client';
import Button from '@mui/material/Button';//Importing MUI Button component
import { useRouter } from 'next/navigation';

export default function ButtonDemo() {
    const router = useRouter();
    const handleLoginClick = () =>{
        router.push('/register'); 
    }
  return (
    //sx prop is used to apply custom styles
    <Button variant="contained" size="large" sx={{bgcolor:'#14919B', '&:hover':{bgcolor:'#155C62'}, fontFamily:'var(--font-main)'}} onClick={handleLoginClick}>Sign Up with Email</Button>
  )
}
