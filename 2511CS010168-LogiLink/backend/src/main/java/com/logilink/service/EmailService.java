package com.logilink.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  private final ObjectProvider<JavaMailSender> mailSenderProvider;
  private final boolean mailEnabled;
  private final String mailHost;
  private final String mailFrom;

  public EmailService(
      ObjectProvider<JavaMailSender> mailSenderProvider,
      @Value("${logilink.mail.enabled:false}") boolean mailEnabled,
      @Value("${spring.mail.host:localhost}") String mailHost,
      @Value("${logilink.mail.from:noreply@logilink.edu}") String mailFrom) {
    this.mailSenderProvider = mailSenderProvider;
    this.mailEnabled = mailEnabled;
    this.mailHost = mailHost;
    this.mailFrom = mailFrom;
  }

  public boolean isMailConfigured() {
    JavaMailSender sender = mailSenderProvider.getIfAvailable();
    return mailEnabled && sender != null && mailHost != null && !mailHost.isBlank() && !"localhost".equalsIgnoreCase(mailHost);
  }

  public boolean sendPasswordResetEmail(String toEmail, String recipientName, String resetUrl, int expirationMinutes) {
    if (!isMailConfigured()) {
      log.info("Email delivery is not configured or disabled (logilink.mail.enabled=false or default localhost). Skipping outbound SMTP send.");
      return false;
    }

    JavaMailSender sender = mailSenderProvider.getIfAvailable();
    if (sender == null) {
      log.warn("JavaMailSender bean is unavailable.");
      return false;
    }

    try {
      MimeMessage message = sender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(mailFrom);
      helper.setTo(toEmail);
      helper.setSubject("LogiLink - Password Reset Request");

      String greetingName = (recipientName != null && !recipientName.isBlank()) ? recipientName : "LogiLink User";
      String htmlContent = """
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
            <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.03);">
              <div style="background: #0f172a; padding: 24px; text-align: left;">
                <h1 style="margin: 0; font-size: 20px; color: #ffffff; font-weight: 700; letter-spacing: -0.02em;">LogiLink</h1>
                <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Transportation &amp; Logistics Management</p>
              </div>
              <div style="padding: 32px 28px;">
                <h2 style="margin: 0 0 16px; font-size: 18px; color: #0f172a;">Password Reset Request</h2>
                <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #334155;">Hello %s,</p>
                <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #334155;">
                  We received a request to reset your password for your LogiLink account. Click the button below to choose a new password:
                </p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="%s" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: 600; border-radius: 6px; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                <p style="margin: 20px 0 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                  This link will expire in %d minutes. If you did not request a password reset, you can safely ignore this email; your password will remain unchanged.
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                  If the button above does not work, copy and paste this URL into your browser:<br/>
                  <a href="%s" style="color: #2563eb; word-break: break-all;">%s</a>
                </p>
              </div>
            </div>
          </body>
          </html>
          """.formatted(greetingName, resetUrl, expirationMinutes, resetUrl, resetUrl);

      helper.setText(htmlContent, true);
      sender.send(message);
      log.info("Password reset email sent successfully to {}", toEmail);
      return true;
    } catch (Exception ex) {
      log.error("Failed to send password reset email to {}: {}", toEmail, ex.getMessage());
      return false;
    }
  }
}
