package com.hms.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    /**
     * Sends an email to the doctor when a patient books an appointment.
     * Accepts plain Strings only — avoids JPA lazy-loading issues in async threads.
     */
    @Async
    public void sendAppointmentBookedEmailToDoctor(
            String doctorEmail, String doctorLastName,
            String patientFullName, String appointmentDate,
            String appointmentTime, String reason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(doctorEmail);
            message.setSubject("New Appointment Booking – HMS");
            message.setText(
                    "Dear Dr. " + doctorLastName + ",\n\n" +
                    "A new appointment has been booked with you.\n\n" +
                    "Patient Name : " + patientFullName + "\n" +
                    "Date         : " + appointmentDate + "\n" +
                    "Time         : " + appointmentTime + "\n" +
                    "Reason       : " + (reason != null && !reason.isBlank() ? reason : "N/A") + "\n\n" +
                    "Please log in to the HMS portal to confirm or cancel.\n\n" +
                    "Best regards,\nHMS System"
            );
            javaMailSender.send(message);
            log.info("Booking alert email sent to doctor: {}", doctorEmail);
        } catch (Exception e) {
            log.error("Failed to send booking alert to doctor ({}): {}", doctorEmail, e.getMessage());
        }
    }

    /**
     * Sends a status update email to the patient when the doctor confirms or cancels.
     * Accepts plain Strings only — avoids JPA lazy-loading issues in async threads.
     */
    @Async
    public void sendAppointmentStatusEmailToPatient(
            String patientEmail, String patientFirstName,
            String doctorFullName, String appointmentDate,
            String appointmentTime, String status) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(patientEmail);
            String statusLabel = status.equals("CONFIRMED") ? "Confirmed" : "Cancelled";
            message.setSubject("Appointment " + statusLabel + " – HMS");
            message.setText(
                    "Dear " + patientFirstName + ",\n\n" +
                    "Your appointment with Dr. " + doctorFullName + " has been " +
                    status.toLowerCase() + ".\n\n" +
                    "Appointment Details:\n" +
                    "Date : " + appointmentDate + "\n" +
                    "Time : " + appointmentTime + "\n\n" +
                    "Thank you for choosing HMS.\n\n" +
                    "Best regards,\nHMS System"
            );
            javaMailSender.send(message);
            log.info("Status ({}) email sent to patient: {}", status, patientEmail);
        } catch (Exception e) {
            log.error("Failed to send status ({}) email to patient ({}): {}", status, patientEmail, e.getMessage());
        }
    }
}
