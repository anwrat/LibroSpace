'use client';
import Button from '@mui/material/Button';//Importing MUI Button component

export default function ButtonDemo() {
  return (
    //sx prop is used to apply custom styles
    <Button variant="contained" size="large" sx={{bgcolor:'#14919B', '&:hover':{bgcolor:'#155C62'}, fontFamily:'var(--font-main)'}}>Login</Button>
  )
}
