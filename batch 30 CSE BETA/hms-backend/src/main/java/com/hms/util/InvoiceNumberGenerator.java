package com.hms.util;

import com.hms.constants.AppConstants;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

public class InvoiceNumberGenerator {

    private static final AtomicInteger counter = new AtomicInteger(1000);

    private InvoiceNumberGenerator() {}

    public static String generate() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int seq = counter.getAndIncrement();
        return AppConstants.INVOICE_PREFIX + "-" + datePart + "-" + String.format("%04d", seq);
    }
}
