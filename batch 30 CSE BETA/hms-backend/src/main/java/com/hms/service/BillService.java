package com.hms.service;

import com.hms.dto.request.GenerateBillRequest;
import com.hms.dto.response.BillItemResponse;
import com.hms.dto.response.BillResponse;
import com.hms.dto.response.PagedResponse;
import com.hms.entity.*;
import com.hms.exception.DuplicateResourceException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.BillRepository;
import com.hms.repository.PatientRepository;
import com.hms.util.InvoiceNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BillService {

    private final BillRepository billRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final AuditLogService auditLogService;

    public BillResponse generateBill(GenerateBillRequest request, User generatedBy) {
        if (billRepository.findByAppointmentId(request.getAppointmentId()).isPresent()) {
            throw new DuplicateResourceException("Bill already generated for this appointment");
        }

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        BigDecimal consultationFee = request.getConsultationFee();
        BigDecimal medicineCharges = request.getMedicineCharges() != null ? request.getMedicineCharges() : BigDecimal.ZERO;
        BigDecimal additionalCharges = request.getAdditionalCharges() != null ? request.getAdditionalCharges() : BigDecimal.ZERO;
        BigDecimal discountPercent = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal gstPercent = request.getGstPercentage() != null ? request.getGstPercentage() : new BigDecimal("18.00");

        // Calculate subtotal
        BigDecimal subtotal = consultationFee.add(medicineCharges).add(additionalCharges);

        // Apply discount
        BigDecimal discountAmount = subtotal.multiply(discountPercent).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);

        // Apply GST
        BigDecimal gstAmount = afterDiscount.multiply(gstPercent).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = afterDiscount.add(gstAmount);

        Bill bill = Bill.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .invoiceNumber(InvoiceNumberGenerator.generate())
                .consultationFee(consultationFee)
                .medicineCharges(medicineCharges)
                .additionalCharges(additionalCharges)
                .discount(discountPercent)
                .gstPercentage(gstPercent)
                .gstAmount(gstAmount)
                .grandTotal(grandTotal)
                .paymentStatus(PaymentStatus.PENDING)
                .notes(request.getNotes())
                .paymentMethod(request.getPaymentMethod())
                .items(new ArrayList<>())
                .build();

        bill = billRepository.save(bill);

        // Add bill items if provided
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            final Bill finalBill = bill;
            List<BillItem> billItems = request.getItems().stream().map(itemReq -> {
                BigDecimal totalPrice = itemReq.getUnitPrice()
                        .multiply(new BigDecimal(itemReq.getQuantity()))
                        .setScale(2, RoundingMode.HALF_UP);
                return BillItem.builder()
                        .bill(finalBill)
                        .description(itemReq.getDescription())
                        .quantity(itemReq.getQuantity())
                        .unitPrice(itemReq.getUnitPrice())
                        .totalPrice(totalPrice)
                        .build();
            }).collect(Collectors.toList());
            bill.setItems(billItems);
        }

        // Mark appointment bill as generated
        appointment.setBillGenerated(true);
        appointmentRepository.save(appointment);

        bill = billRepository.save(bill);
        auditLogService.log(generatedBy, "GENERATE_BILL", "BILL", bill.getId(),
                "Bill generated: " + bill.getInvoiceNumber() + " for patient: " +
                appointment.getPatient().getUser().getFullName());

        return mapToResponse(bill);
    }

    public BillResponse markAsPaid(Long billId, String paymentMethod, User updatedBy) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", billId));
        bill.setPaymentStatus(PaymentStatus.PAID);
        bill.setPaymentDate(LocalDate.now());
        if (paymentMethod != null) bill.setPaymentMethod(paymentMethod);
        bill = billRepository.save(bill);
        auditLogService.log(updatedBy, "MARK_BILL_PAID", "BILL", billId,
                "Bill marked as paid: " + bill.getInvoiceNumber());
        return mapToResponse(bill);
    }

    @Transactional(readOnly = true)
    public BillResponse getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id));
        return mapToResponse(bill);
    }

    @Transactional(readOnly = true)
    public BillResponse getBillByAppointmentId(Long appointmentId) {
        Bill bill = billRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found for appointment: " + appointmentId));
        return mapToResponse(bill);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BillResponse> getAllBills(int page, int size, String paymentStatus) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Bill> bills;
        if (paymentStatus != null && !paymentStatus.isBlank()) {
            bills = billRepository.findByPaymentStatus(PaymentStatus.valueOf(paymentStatus.toUpperCase()), pageable);
        } else {
            bills = billRepository.findAll(pageable);
        }
        return toPagedResponse(bills);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BillResponse> getPatientBills(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Bill> bills = billRepository.findByPatientId(patientId, pageable);
        return toPagedResponse(bills);
    }

    public BillResponse mapToResponse(Bill bill) {
        List<BillItemResponse> itemResponses = bill.getItems() == null ? List.of() :
                bill.getItems().stream().map(item -> BillItemResponse.builder()
                        .id(item.getId())
                        .description(item.getDescription())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build()).collect(Collectors.toList());

        User doctorUser = bill.getAppointment().getDoctor().getUser();
        User patientUser = bill.getPatient().getUser();

        return BillResponse.builder()
                .id(bill.getId())
                .appointmentId(bill.getAppointment().getId())
                .patientId(bill.getPatient().getId())
                .patientName(patientUser.getFullName())
                .patientEmail(patientUser.getEmail())
                .doctorName(doctorUser.getFullName())
                .invoiceNumber(bill.getInvoiceNumber())
                .consultationFee(bill.getConsultationFee())
                .medicineCharges(bill.getMedicineCharges())
                .additionalCharges(bill.getAdditionalCharges())
                .discount(bill.getDiscount())
                .gstPercentage(bill.getGstPercentage())
                .gstAmount(bill.getGstAmount())
                .grandTotal(bill.getGrandTotal())
                .paymentStatus(bill.getPaymentStatus())
                .paymentDate(bill.getPaymentDate())
                .paymentMethod(bill.getPaymentMethod())
                .notes(bill.getNotes())
                .items(itemResponses)
                .createdAt(bill.getCreatedAt())
                .build();
    }

    private PagedResponse<BillResponse> toPagedResponse(Page<Bill> page) {
        List<BillResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PagedResponse.<BillResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
}
