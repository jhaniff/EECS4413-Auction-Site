package com.eecs4413.auth.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${application.mailing.from:no-reply@auction.test}")
    private String from;

    @Value("${application.mailing.frontendResetUrl}")
    private String frontendUrl;

    @Async
    public void sendResetEmail(String emailAddress, String code, UUID id){
        try{
            String url = frontendUrl + "?token=" + id;
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, "UTF-8");
            helper.setFrom(from);
            helper.setTo(emailAddress);
            helper.setSubject("Password Reset Code");
            helper.setText(messageContent(code, url), true);
            mailSender.send(msg);
        }catch(Exception e){

        }
    }

    private String messageContent(String code, String url){
        return """
            <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.5">
                  <h2 style="margin:0 0 12px">Password reset Code</h2>
                  <div style="font-size:24px;font-weight:700;letter-spacing:4px;margin:8px 0 16px">%s</div>
                  <p>Or click the button to continue:</p>
                  <p>
                    <a href="%s" style="display:inline-block;padding:10px 16px;border-radius:8px;
                       text-decoration:none;background:#2563eb;color:#fff">Reset Your Password</a>
                  </p>
            </div>
                """.formatted(code, url);
    }
}
