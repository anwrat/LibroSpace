import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS,
    },
});

export async function sendOTPMail(email: string, otp: string){
    await transporter.sendMail({
        from: `"LibroSpace" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verification Code",
        text: `<b>Hello there,</b><br><p>Your OTP is ${otp}</p>`,
    });
}