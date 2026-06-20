package com.handyserve.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a 6-digit OTP to the registered user's email for email verification.
     *
     * @param email To email address
     * @param name  User's name
     * @param otp   6-digit OTP code
     */
    public void sendOtpEmail(String email, String name, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(email);
        message.setSubject("Your OTP Code - HandyServe Pro");
        message.setText("Dear " + name + ",\n\n"
                + "Thank you for registering on HandyServe Pro!\n\n"
                + "Your One-Time Password (OTP) for email verification is:\n"
                + otp + "\n\n"
                + "This OTP is valid for 5 minutes. Please enter this code on the verification screen to activate your account.\n\n"
                + "Best regards,\n"
                + "HandyServe Pro Team");

        try {
            mailSender.send(message);
            log.info("OTP verification email sent successfully to {}", email);
        } catch (Exception e) {
            // Print the full error so it appears in Eclipse console
            log.error("SMTP ERROR — Failed to send OTP to {}. Reason: {}. [DEV] OTP is: {}",
                    email, e.getMessage(), otp, e);
            // Do NOT rethrow — registration must succeed even if email delivery fails.
            // Check the Eclipse console for the SMTP error and verify the Gmail App Password.
        }
    }

    /**
     * Sends a password reset OTP email.
     *
     * @param email Recipient email address
     * @param name  User's name
     * @param otp   6-digit OTP code
     */
    public void sendPasswordResetOtpEmail(String email, String name, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(email);
        message.setSubject("Your Password Reset OTP - HandyServe Pro");
        message.setText("Dear " + name + ",\n\n"
                + "We received a request to reset your password.\n"
                + "Your One-Time Password (OTP) is: " + otp + "\n\n"
                + "This OTP is valid for 5 minutes. Use it to reset your password.\n\n"
                + "If you did not request a password reset, please ignore this email.\n\n"
                + "Best regards,\n"
                + "HandyServe Pro Team");
        try {
            mailSender.send(message);
            log.info("Password reset OTP email sent successfully to {}", email);
        } catch (Exception e) {
            log.error("SMTP ERROR — Failed to send password reset OTP to {}. Reason: {}. [DEV] OTP is: {}",
                    email, e.getMessage(), otp, e);
        }
    }
}
