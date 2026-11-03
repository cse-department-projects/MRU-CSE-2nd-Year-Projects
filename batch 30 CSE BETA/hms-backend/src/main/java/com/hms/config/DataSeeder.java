package com.hms.config;

import com.hms.entity.*;
import com.hms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final MedicineRepository medicineRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Checking/seeding missing roles...");
            if (!userRepository.existsByEmail("pharmacist@hms.com")) {
                seedPharmacist();
            }
            return;
        }

        log.info("Seeding database with initial data...");
        seedAdmin();
        seedPharmacist();
        seedDoctors();
        seedPatients();
        seedMedicines();
        seedAppointments();
        log.info("Database seeding completed successfully!");
    }

    private void seedAdmin() {
        User admin = User.builder()
                .firstName("System")
                .lastName("Administrator")
                .email("admin@hms.com")
                .password(passwordEncoder.encode("Admin@123"))
                .phone("+911234567890")
                .role(Role.ADMIN)
                .isActive(true)
                .emailVerified(true)
                .build();
        userRepository.save(admin);
        log.info("Admin seeded: admin@hms.com / Admin@123");
    }

    private void seedPharmacist() {
        User pharmacist = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("pharmacist@hms.com")
                .password(passwordEncoder.encode("Pharmacist@123"))
                .phone("+919998887776")
                .role(Role.PHARMACIST)
                .isActive(true)
                .emailVerified(true)
                .build();
        userRepository.save(pharmacist);
        log.info("Pharmacist seeded: pharmacist@hms.com / Pharmacist@123");
    }

    private void seedDoctors() {
        // Doctor 1: Cardiologist
        User doctorUser1 = User.builder()
                .firstName("Rajesh")
                .lastName("Kumar")
                .email("gbhavana797@gmail.com")
                .password(passwordEncoder.encode("Doctor@123"))
                .phone("+919876543210")
                .role(Role.DOCTOR)
                .isActive(true)
                .emailVerified(true)
                .build();
        doctorUser1 = userRepository.save(doctorUser1);

        Doctor doctor1 = Doctor.builder()
                .user(doctorUser1)
                .specialization("Cardiology")
                .licenseNumber("MCI-2024-001")
                .experienceYears(15)
                .consultationFee(new BigDecimal("800.00"))
                .bio("Senior cardiologist with 15+ years of experience in interventional cardiology.")
                .availableDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY")
                .availableTimeStart(LocalTime.of(9, 0))
                .availableTimeEnd(LocalTime.of(17, 0))
                .qualification("MBBS, MD (Cardiology), DM")
                .isAvailable(true)
                .build();
        doctorRepository.save(doctor1);

        // Doctor 2: Orthopedic
        User doctorUser2 = User.builder()
                .firstName("Priya")
                .lastName("Sharma")
                .email("dr.priya@hms.com")
                .password(passwordEncoder.encode("Doctor@123"))
                .phone("+919876543211")
                .role(Role.DOCTOR)
                .isActive(true)
                .emailVerified(true)
                .build();
        doctorUser2 = userRepository.save(doctorUser2);

        Doctor doctor2 = Doctor.builder()
                .user(doctorUser2)
                .specialization("Orthopedics")
                .licenseNumber("MCI-2024-002")
                .experienceYears(10)
                .consultationFee(new BigDecimal("600.00"))
                .bio("Specialist in joint replacement, sports injuries and spine surgery.")
                .availableDays("MONDAY,WEDNESDAY,FRIDAY")
                .availableTimeStart(LocalTime.of(10, 0))
                .availableTimeEnd(LocalTime.of(16, 0))
                .qualification("MBBS, MS (Orthopedics)")
                .isAvailable(true)
                .build();
        doctorRepository.save(doctor2);

        // Doctor 3: General Physician
        User doctorUser3 = User.builder()
                .firstName("Amit")
                .lastName("Verma")
                .email("dr.amit@hms.com")
                .password(passwordEncoder.encode("Doctor@123"))
                .phone("+919876543212")
                .role(Role.DOCTOR)
                .isActive(true)
                .emailVerified(true)
                .build();
        doctorUser3 = userRepository.save(doctorUser3);

        Doctor doctor3 = Doctor.builder()
                .user(doctorUser3)
                .specialization("General Medicine")
                .licenseNumber("MCI-2024-003")
                .experienceYears(8)
                .consultationFee(new BigDecimal("400.00"))
                .bio("Experienced general physician providing comprehensive primary care.")
                .availableDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY")
                .availableTimeStart(LocalTime.of(8, 0))
                .availableTimeEnd(LocalTime.of(18, 0))
                .qualification("MBBS, MD (General Medicine)")
                .isAvailable(true)
                .build();
        doctorRepository.save(doctor3);

        // Doctor 4: Dermatologist
        User doctorUser4 = User.builder()
                .firstName("Sunita")
                .lastName("Patel")
                .email("dr.sunita@hms.com")
                .password(passwordEncoder.encode("Doctor@123"))
                .phone("+919876543213")
                .role(Role.DOCTOR)
                .isActive(true)
                .emailVerified(true)
                .build();
        doctorUser4 = userRepository.save(doctorUser4);

        Doctor doctor4 = Doctor.builder()
                .user(doctorUser4)
                .specialization("Dermatology")
                .licenseNumber("MCI-2024-004")
                .experienceYears(12)
                .consultationFee(new BigDecimal("700.00"))
                .bio("Expert in skin disorders, cosmetic dermatology and hair treatments.")
                .availableDays("TUESDAY,THURSDAY,SATURDAY")
                .availableTimeStart(LocalTime.of(11, 0))
                .availableTimeEnd(LocalTime.of(17, 0))
                .qualification("MBBS, MD (Dermatology), DVD")
                .isAvailable(true)
                .build();
        doctorRepository.save(doctor4);

        log.info("Doctors seeded: gbhavana797@gmail.com, dr.priya@hms.com, dr.amit@hms.com, dr.sunita@hms.com / Doctor@123");
    }

    private void seedPatients() {
        // Patient 1
        User patientUser1 = User.builder()
                .firstName("Rahul")
                .lastName("Singh")
                .email("jvedavanshika@gmail.com")
                .password(passwordEncoder.encode("Patient@123"))
                .phone("+919012345678")
                .role(Role.PATIENT)
                .isActive(true)
                .emailVerified(true)
                .build();
        patientUser1 = userRepository.save(patientUser1);

        Patient patient1 = Patient.builder()
                .user(patientUser1)
                .dateOfBirth(LocalDate.of(1990, 5, 15))
                .gender("Male")
                .bloodGroup("O+")
                .address("123 MG Road, Bengaluru, Karnataka 560001")
                .emergencyContact("+919012345679")
                .emergencyContactName("Sunita Singh")
                .medicalHistory("Hypertension, managed with medication")
                .allergies("Penicillin")
                .build();
        patientRepository.save(patient1);

        // Patient 2
        User patientUser2 = User.builder()
                .firstName("Ananya")
                .lastName("Reddy")
                .email("ananya.patient@hms.com")
                .password(passwordEncoder.encode("Patient@123"))
                .phone("+919012345680")
                .role(Role.PATIENT)
                .isActive(true)
                .emailVerified(true)
                .build();
        patientUser2 = userRepository.save(patientUser2);

        Patient patient2 = Patient.builder()
                .user(patientUser2)
                .dateOfBirth(LocalDate.of(1995, 8, 20))
                .gender("Female")
                .bloodGroup("A+")
                .address("456 Jubilee Hills, Hyderabad, Telangana 500033")
                .emergencyContact("+919012345681")
                .emergencyContactName("Vikram Reddy")
                .medicalHistory("Diabetes Type 2")
                .allergies("None known")
                .build();
        patientRepository.save(patient2);

        // Patient 3
        User patientUser3 = User.builder()
                .firstName("Vikram")
                .lastName("Nair")
                .email("vikram.patient@hms.com")
                .password(passwordEncoder.encode("Patient@123"))
                .phone("+919012345682")
                .role(Role.PATIENT)
                .isActive(true)
                .emailVerified(true)
                .build();
        patientUser3 = userRepository.save(patientUser3);

        Patient patient3 = Patient.builder()
                .user(patientUser3)
                .dateOfBirth(LocalDate.of(1985, 3, 10))
                .gender("Male")
                .bloodGroup("B-")
                .address("789 Fort Road, Kochi, Kerala 682001")
                .emergencyContact("+919012345683")
                .emergencyContactName("Meera Nair")
                .medicalHistory("Asthma, controlled")
                .allergies("Sulfa drugs")
                .build();
        patientRepository.save(patient3);

        log.info("Patients seeded: rahul.patient@hms.com, ananya.patient@hms.com, vikram.patient@hms.com / Patient@123");
    }

    private void seedMedicines() {
        Medicine[] medicines = {
            Medicine.builder().name("Paracetamol 500mg").genericName("Acetaminophen").manufacturer("Sun Pharma")
                .batchNumber("SP2024001").quantity(500).expiryDate(LocalDate.of(2026, 12, 31))
                .price(new BigDecimal("2.50")).category("Analgesic").dosageForm("Tablet").strength("500mg")
                .lowStockThreshold(50).isActive(true).build(),

            Medicine.builder().name("Amoxicillin 250mg").genericName("Amoxicillin").manufacturer("Cipla")
                .batchNumber("CP2024002").quantity(200).expiryDate(LocalDate.of(2026, 6, 30))
                .price(new BigDecimal("8.00")).category("Antibiotic").dosageForm("Capsule").strength("250mg")
                .lowStockThreshold(30).isActive(true).build(),

            Medicine.builder().name("Metformin 500mg").genericName("Metformin HCl").manufacturer("Dr. Reddy's")
                .batchNumber("DR2024003").quantity(300).expiryDate(LocalDate.of(2026, 9, 30))
                .price(new BigDecimal("5.00")).category("Antidiabetic").dosageForm("Tablet").strength("500mg")
                .lowStockThreshold(40).isActive(true).build(),

            Medicine.builder().name("Atorvastatin 10mg").genericName("Atorvastatin").manufacturer("Lupin")
                .batchNumber("LP2024004").quantity(150).expiryDate(LocalDate.of(2026, 11, 30))
                .price(new BigDecimal("12.00")).category("Cardiovascular").dosageForm("Tablet").strength("10mg")
                .lowStockThreshold(20).isActive(true).build(),

            Medicine.builder().name("Omeprazole 20mg").genericName("Omeprazole").manufacturer("Torrent")
                .batchNumber("TP2024005").quantity(8).expiryDate(LocalDate.of(2026, 8, 31))
                .price(new BigDecimal("6.00")).category("Gastrointestinal").dosageForm("Capsule").strength("20mg")
                .lowStockThreshold(25).isActive(true).build(),

            Medicine.builder().name("Cetirizine 10mg").genericName("Cetirizine HCl").manufacturer("GSK")
                .batchNumber("GK2024006").quantity(250).expiryDate(LocalDate.of(2026, 7, 31))
                .price(new BigDecimal("3.00")).category("Antihistamine").dosageForm("Tablet").strength("10mg")
                .lowStockThreshold(30).isActive(true).build(),

            Medicine.builder().name("Ibuprofen 400mg").genericName("Ibuprofen").manufacturer("Abbott")
                .batchNumber("AB2024007").quantity(180).expiryDate(LocalDate.of(2026, 10, 31))
                .price(new BigDecimal("4.50")).category("NSAID").dosageForm("Tablet").strength("400mg")
                .lowStockThreshold(25).isActive(true).build(),

            Medicine.builder().name("Azithromycin 500mg").genericName("Azithromycin").manufacturer("Pfizer")
                .batchNumber("PF2024008").quantity(5).expiryDate(LocalDate.of(2026, 5, 31))
                .price(new BigDecimal("45.00")).category("Antibiotic").dosageForm("Tablet").strength("500mg")
                .lowStockThreshold(15).isActive(true).build(),

            Medicine.builder().name("Pantoprazole 40mg").genericName("Pantoprazole").manufacturer("Alkem")
                .batchNumber("AK2024009").quantity(400).expiryDate(LocalDate.of(2026, 12, 31))
                .price(new BigDecimal("7.00")).category("Gastrointestinal").dosageForm("Tablet").strength("40mg")
                .lowStockThreshold(30).isActive(true).build(),

            Medicine.builder().name("Cough Syrup 100ml").genericName("Dextromethorphan+Guaifenesin").manufacturer("Himalaya")
                .batchNumber("HM2024010").quantity(60).expiryDate(LocalDate.of(2026, 4, 30))
                .price(new BigDecimal("85.00")).category("Respiratory").dosageForm("Syrup").strength("10mg/5ml")
                .lowStockThreshold(10).isActive(true).build()
        };

        for (Medicine medicine : medicines) {
            medicineRepository.save(medicine);
        }
        log.info("10 medicines seeded successfully");
    }

    private void seedAppointments() {
        // Load seeded data
        var patient1 = patientRepository.findByUserId(
                userRepository.findByEmail("rahul.patient@hms.com").get().getId()).orElse(null);
        var patient2 = patientRepository.findByUserId(
                userRepository.findByEmail("ananya.patient@hms.com").get().getId()).orElse(null);
        var doctor1 = doctorRepository.findByUserId(
                userRepository.findByEmail("dr.rajesh@hms.com").get().getId()).orElse(null);
        var doctor2 = doctorRepository.findByUserId(
                userRepository.findByEmail("dr.priya@hms.com").get().getId()).orElse(null);

        if (patient1 != null && doctor1 != null) {
            Appointment apt1 = Appointment.builder()
                    .patient(patient1)
                    .doctor(doctor1)
                    .appointmentDate(LocalDate.now().plusDays(2))
                    .appointmentTime(LocalTime.of(10, 0))
                    .status(AppointmentStatus.CONFIRMED)
                    .reason("Chest pain and shortness of breath during exercise")
                    .build();
            appointmentRepository.save(apt1);

            Appointment apt2 = Appointment.builder()
                    .patient(patient1)
                    .doctor(doctor1)
                    .appointmentDate(LocalDate.now().plusDays(7))
                    .appointmentTime(LocalTime.of(14, 30))
                    .status(AppointmentStatus.PENDING)
                    .reason("Follow-up consultation for blood pressure")
                    .build();
            appointmentRepository.save(apt2);
        }

        if (patient2 != null && doctor2 != null) {
            Appointment apt3 = Appointment.builder()
                    .patient(patient2)
                    .doctor(doctor2)
                    .appointmentDate(LocalDate.now().plusDays(3))
                    .appointmentTime(LocalTime.of(11, 0))
                    .status(AppointmentStatus.CONFIRMED)
                    .reason("Knee pain and swelling after fall")
                    .build();
            appointmentRepository.save(apt3);
        }

        log.info("Sample appointments seeded");
    }
}
