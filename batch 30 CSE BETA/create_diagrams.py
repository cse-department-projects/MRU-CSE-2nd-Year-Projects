import math
from PIL import Image, ImageDraw, ImageFont

# Fonts setup
FONT_REGULAR = "C:\\Windows\\Fonts\\segoeui.ttf"
FONT_BOLD = "C:\\Windows\\Fonts\\segoeuib.ttf"
FONT_SEMIBOLD = "C:\\Windows\\Fonts\\segoeuisb.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

# Safe helpers
_orig_rounded_rectangle = ImageDraw.ImageDraw.rounded_rectangle
def _patched_rounded_rectangle(self, xy, radius=0, fill=None, outline=None, width=1, *args, **kwargs):
    return _orig_rounded_rectangle(self, xy, radius=int(radius), fill=fill, outline=outline, width=int(round(width)), *args, **kwargs)
ImageDraw.ImageDraw.rounded_rectangle = _patched_rounded_rectangle

_orig_line = ImageDraw.ImageDraw.line
def _patched_line(self, xy, fill=None, width=1, *args, **kwargs):
    return _orig_line(self, xy, fill=fill, width=int(round(width)), *args, **kwargs)
ImageDraw.ImageDraw.line = _patched_line

def draw_rounded_card(draw, xy, radius=12, fill="#FFFFFF", outline="#E2E8F0", width=2):
    draw.rounded_rectangle(xy, radius=int(radius), fill=fill, outline=outline, width=int(width))

def draw_arrow(draw, start, end, fill="#64748B", width=2, arrow_size=10):
    x1, y1 = start
    x2, y2 = end
    draw.line([start, end], fill=fill, width=int(width))
    angle = math.atan2(y2 - y1, x2 - x1)
    
    p1 = (x2 - arrow_size * math.cos(angle - math.pi / 6),
          y2 - arrow_size * math.sin(angle - math.pi / 6))
    p2 = (x2 - arrow_size * math.cos(angle + math.pi / 6),
          y2 - arrow_size * math.sin(angle + math.pi / 6))
    
    draw.polygon([end, p1, p2], fill=fill)

def draw_text_centered(draw, text, font, fill, rect):
    x1, y1, x2, y2 = rect
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = x1 + (x2 - x1 - tw) / 2
    ty = y1 + (y2 - y1 - th) / 2
    draw.text((tx, ty), text, font=font, fill=fill)

def draw_pill(draw, cx, cy, text, font, fill_bg="#FFFFFF", outline_col="#CBD5E1", text_col="#1E293B", pad_x=12, pad_y=5):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x1 = cx - tw / 2 - pad_x
    y1 = cy - th / 2 - pad_y
    x2 = cx + tw / 2 + pad_x
    y2 = cy + th / 2 + pad_y
    draw.rounded_rectangle((x1, y1, x2, y2), radius=6, fill=fill_bg, outline=outline_col, width=1)
    draw.text((cx - tw / 2, cy - th / 2 - 1), text, font=font, fill=text_col)


# ==============================================================================
# 1. SIMPLE SYSTEM ARCHITECTURE DIAGRAM
# ==============================================================================
def create_system_architecture():
    W, H = 1680, 940
    img = Image.new("RGBA", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)

    f_title = get_font(FONT_BOLD, 28)
    f_sub = get_font(FONT_REGULAR, 16)
    f_tier_title = get_font(FONT_BOLD, 20)
    f_box_title = get_font(FONT_BOLD, 16)
    f_box_sub = get_font(FONT_REGULAR, 13)
    f_pill = get_font(FONT_BOLD, 12)
    f_item = get_font(FONT_REGULAR, 13)

    # Title Bar
    draw.text((60, 40), "Hospital Management System (HMS)", font=f_title, fill="#0F172A")
    draw.text((60, 78), "System Architecture Diagram - 3-Tier Web Architecture", font=f_sub, fill="#64748B")
    draw.line([(60, 110), (1620, 110)], fill="#CBD5E1", width=2)

    # ------------------ TIER 1: CLIENT TIER (FRONTEND) ------------------
    t1_x1, t1_y1, t1_x2, t1_y2 = 60, 140, 470, 880
    draw_rounded_card(draw, (t1_x1, t1_y1, t1_x2, t1_y2), radius=14, fill="#FFFFFF", outline="#93C5FD", width=2)
    draw.rounded_rectangle((t1_x1, t1_y1, t1_x2, t1_y1 + 50), radius=14, fill="#EFF6FF")
    draw.rectangle((t1_x1, t1_y1 + 30, t1_x2, t1_y1 + 50), fill="#EFF6FF")
    draw.text((t1_x1 + 20, t1_y1 + 14), "1. Presentation Layer (Frontend)", font=f_tier_title, fill="#1D4ED8")

    # Users Box (2x2 Grid)
    draw_rounded_card(draw, (t1_x1 + 20, 210, t1_x2 - 20, 340), radius=10, fill="#F8FAFC", outline="#E2E8F0", width=1)
    draw.text((t1_x1 + 25, 222), "User Roles & Devices", font=f_box_title, fill="#0F172A")
    draw.text((t1_x1 + 25, 246), "Access via Web Browser (PC / Mobile)", font=f_box_sub, fill="#64748B")
    
    # 2x2 grid for users
    draw.rounded_rectangle((t1_x1 + 25, 275, t1_x1 + 185, 303), radius=6, fill="#FEF2F2", outline="#EF4444", width=1)
    draw_text_centered(draw, "Admin Portal", f_pill, "#DC2626", (t1_x1 + 25, 275, t1_x1 + 185, 303))

    draw.rounded_rectangle((t1_x1 + 205, 275, t1_x2 - 25, 303), radius=6, fill="#EFF6FF", outline="#2563EB", width=1)
    draw_text_centered(draw, "Doctor Portal", f_pill, "#2563EB", (t1_x1 + 205, 275, t1_x2 - 25, 303))

    draw.rounded_rectangle((t1_x1 + 25, 310, t1_x1 + 185, 338), radius=6, fill="#ECFDF5", outline="#059669", width=1)
    draw_text_centered(draw, "Patient Portal", f_pill, "#059669", (t1_x1 + 25, 310, t1_x1 + 185, 338))

    draw.rounded_rectangle((t1_x1 + 205, 310, t1_x2 - 25, 338), radius=6, fill="#F5F3FF", outline="#7C3AED", width=1)
    draw_text_centered(draw, "Pharmacy Portal", f_pill, "#7C3AED", (t1_x1 + 205, 310, t1_x2 - 25, 338))

    # React App Box
    draw_rounded_card(draw, (t1_x1 + 20, 365, t1_x2 - 20, 855), radius=10, fill="#F0F9FF", outline="#BAE6FD", width=1)
    draw.text((t1_x1 + 25, 380), "React 18 + Vite Web App", font=f_box_title, fill="#0369A1")
    draw.text((t1_x1 + 25, 404), "Single Page Application (SPA) - Port 5173", font=f_box_sub, fill="#0284C7")

    fe_cards = [
        ("Tailwind CSS", "Modern responsive UI & dashboards"),
        ("React Router v6", "Role-based protected route navigation"),
        ("React Hook Form + Zod", "Form validations & appointment booking"),
        ("Axios HTTP Client", "Async REST API calls + JWT interceptors"),
        ("Recharts", "Revenue & appointment analytics charts"),
        ("React Hot Toast", "Interactive status & alert notifications")
    ]
    fey = 435
    for title, desc in fe_cards:
        draw_rounded_card(draw, (t1_x1 + 25, fey, t1_x2 - 25, fey + 58), radius=8, fill="#FFFFFF", outline="#E0F2FE", width=1)
        draw.text((t1_x1 + 38, fey + 9), title, font=get_font(FONT_BOLD, 14), fill="#0F172A")
        draw.text((t1_x1 + 38, fey + 31), desc, font=f_item, fill="#64748B")
        fey += 66

    # ------------------ TIER 2: APPLICATION TIER (BACKEND) ------------------
    t2_x1, t2_y1, t2_x2, t2_y2 = 560, 140, 1140, 880
    draw_rounded_card(draw, (t2_x1, t2_y1, t2_x2, t2_y2), radius=14, fill="#FFFFFF", outline="#86EFAC", width=2)
    draw.rounded_rectangle((t2_x1, t2_y1, t2_x2, t2_y1 + 50), radius=14, fill="#ECFDF5")
    draw.rectangle((t2_x1, t2_y1 + 30, t2_x2, t2_y1 + 50), fill="#ECFDF5")
    draw.text((t2_x1 + 20, t2_y1 + 14), "2. Application Layer (Spring Boot Backend)", font=f_tier_title, fill="#047857")

    # Security
    draw_rounded_card(draw, (t2_x1 + 20, 210, t2_x2 - 20, 310), radius=10, fill="#FEFCE8", outline="#FEF08A", width=1)
    draw.text((t2_x1 + 25, 222), "Spring Security 6 + JWT Authentication", font=f_box_title, fill="#854D0E")
    draw.text((t2_x1 + 25, 246), "Stateless JWT Token Filter · Role-Based Access Control (RBAC)", font=f_box_sub, fill="#A16207")
    draw.text((t2_x1 + 25, 275), "[ JWT Filter ]     [ BCrypt Password Encoder ]     [ SecurityFilterChain ]", font=get_font(FONT_SEMIBOLD, 12), fill="#713F12")

    # REST Controllers
    draw_rounded_card(draw, (t2_x1 + 20, 325, t2_x2 - 20, 465), radius=10, fill="#F8FAFC", outline="#E2E8F0", width=1)
    draw.text((t2_x1 + 25, 337), "REST API Controllers (/api/*) - Port 8080", font=f_box_title, fill="#1E293B")
    
    ctrls = ["AuthController", "DoctorController", "PatientController",
             "AppointmentController", "BillingController", "MedicineController",
             "MedicalRecordController", "AuditLogController", "UserController"]
    cx = t2_x1 + 25
    cy = 368
    for c in ctrls:
        draw.rounded_rectangle((cx, cy, cx + 165, cy + 28), radius=6, fill="#EFF6FF", outline="#BFDBFE")
        draw_text_centered(draw, c, f_pill, "#1E40AF", (cx, cy, cx + 165, cy + 28))
        cx += 175
        if cx > t2_x2 - 160:
            cx = t2_x1 + 25
            cy += 34

    # Business Services
    draw_rounded_card(draw, (t2_x1 + 20, 480, t2_x2 - 20, 685), radius=10, fill="#F0FDF4", outline="#BBF7D0", width=1)
    draw.text((t2_x1 + 25, 492), "Service Layer (Business Logic & Transactions)", font=f_box_title, fill="#166534")
    
    services = [
        ("Auth & User Service", "User registration, password encryption, JWT issuance"),
        ("Appointment Service", "Slot validation, bookings, cancellations & status transitions"),
        ("Medical Record Service", "Patient diagnosis notes, treatment history, e-prescriptions"),
        ("Pharmacy Service", "Medicine stock deductions, low stock tracking, batch expiry"),
        ("Billing & Payment Service", "Consultation & pharmacy bills, invoices and receipts"),
        ("Email Notification Service", "Async appointment booking & reminder email triggers")
    ]
    sy = 522
    for sname, sdesc in services:
        draw.text((t2_x1 + 25, sy), "- " + sname + ":", font=get_font(FONT_BOLD, 13), fill="#14532D")
        draw.text((t2_x1 + 235, sy), sdesc, font=f_item, fill="#374151")
        sy += 26

    # Data Access Layer
    draw_rounded_card(draw, (t2_x1 + 20, 700, t2_x2 - 20, 855), radius=10, fill="#FAF5FF", outline="#E9D5FF", width=1)
    draw.text((t2_x1 + 25, 712), "Data Access Layer (Spring Data JPA / Hibernate)", font=f_box_title, fill="#6B21A8")
    draw.text((t2_x1 + 25, 736), "Hibernate ORM · HikariCP Connection Pool", font=f_box_sub, fill="#7E22CE")
    
    repos = ["UserRepository", "DoctorRepository", "PatientRepository",
             "AppointmentRepository", "BillRepository", "MedicineRepository"]
    rx = t2_x1 + 25
    ry = 770
    for r in repos:
        draw.rounded_rectangle((rx, ry, rx + 165, ry + 28), radius=6, fill="#FFFFFF", outline="#D8B4FE")
        draw_text_centered(draw, r, f_pill, "#6B21A8", (rx, ry, rx + 165, ry + 28))
        rx += 175
        if rx > t2_x2 - 160:
            rx = t2_x1 + 25
            ry += 34

    # ------------------ TIER 3: DATABASE & EXTERNAL SERVICES ------------------
    t3_x1, t3_y1, t3_x2, t3_y2 = 1230, 140, 1620, 880
    draw_rounded_card(draw, (t3_x1, t3_y1, t3_x2, t3_y2), radius=14, fill="#FFFFFF", outline="#FCD34D", width=2)
    draw.rounded_rectangle((t3_x1, t3_y1, t3_x2, t3_y1 + 50), radius=14, fill="#FFFBEB")
    draw.rectangle((t3_x1, t3_y1 + 30, t3_x2, t3_y1 + 50), fill="#FFFBEB")
    draw.text((t3_x1 + 20, t3_y1 + 14), "3. Database & Services", font=f_tier_title, fill="#B45309")

    # MySQL DB
    draw_rounded_card(draw, (t3_x1 + 18, 210, t3_x2 - 18, 570), radius=10, fill="#FFFDF5", outline="#FDE68A", width=1)
    draw.text((t3_x1 + 25, 224), "MySQL 8.0 Database", font=f_box_title, fill="#92400E")
    draw.text((t3_x1 + 25, 248), "Database: hms_db (Port 3306)", font=f_box_sub, fill="#B45309")

    tables = [
        ("users", "User accounts & credentials"),
        ("doctors", "Doctor specializations & fees"),
        ("patients", "Patient records & history"),
        ("appointments", "Booking schedules & visit status"),
        ("medical_records", "Consultations & diagnosis"),
        ("prescriptions", "Medications & dosages"),
        ("medicines", "Pharmacy inventory & stock"),
        ("bills", "Invoices & billing items")
    ]
    ty = 280
    for tbl, tdesc in tables:
        draw.rounded_rectangle((t3_x1 + 22, ty, t3_x2 - 22, ty + 28), radius=5, fill="#FFFFFF", outline="#FCD34D")
        draw.text((t3_x1 + 32, ty + 6), "[Table] " + tbl, font=get_font(FONT_BOLD, 12), fill="#78350F")
        draw.text((t3_x1 + 165, ty + 6), tdesc, font=get_font(FONT_REGULAR, 11), fill="#64748B")
        ty += 34

    # Mail Server
    draw_rounded_card(draw, (t3_x1 + 18, 590, t3_x2 - 18, 715), radius=10, fill="#FDF2F8", outline="#FBCFE8", width=1)
    draw.text((t3_x1 + 25, 604), "Gmail SMTP Server (Port 587)", font=f_box_title, fill="#9D174D")
    draw.text((t3_x1 + 25, 630), "• Appointment confirmation emails", font=f_item, fill="#475569")
    draw.text((t3_x1 + 25, 654), "• Doctor schedule notification alerts", font=f_item, fill="#475569")
    draw.text((t3_x1 + 25, 678), "• Password reset link delivery", font=f_item, fill="#475569")

    # API Documentation
    draw_rounded_card(draw, (t3_x1 + 18, 735, t3_x2 - 18, 855), radius=10, fill="#F0FDFA", outline="#99F6E4", width=1)
    draw.text((t3_x1 + 25, 749), "Swagger UI & OpenAPI 3.0", font=f_box_title, fill="#0F766E")
    draw.text((t3_x1 + 25, 775), "• Swagger UI (/api/swagger-ui.html)", font=f_item, fill="#475569")
    draw.text((t3_x1 + 25, 802), "• OpenAPI REST JSON (/api/v3/api-docs)", font=f_item, fill="#475569")

    # ------------------ CONNECTING ARROWS ------------------
    # Frontend <-> Backend
    draw_arrow(draw, (470, 480), (560, 480), fill="#2563EB", width=2, arrow_size=10)
    draw_arrow(draw, (560, 520), (470, 520), fill="#2563EB", width=2, arrow_size=10)
    draw_pill(draw, 515, 455, "HTTP / REST", f_pill, fill_bg="#EFF6FF", outline_col="#93C5FD", text_col="#1D4ED8")
    draw_pill(draw, 515, 545, "JSON / JWT", f_pill, fill_bg="#EFF6FF", outline_col="#93C5FD", text_col="#1D4ED8")

    # Backend <-> Database
    draw_arrow(draw, (1140, 390), (1230, 390), fill="#D97706", width=2, arrow_size=10)
    draw_arrow(draw, (1230, 430), (1140, 430), fill="#D97706", width=2, arrow_size=10)
    draw_pill(draw, 1185, 365, "JDBC / SQL", f_pill, fill_bg="#FFFBEB", outline_col="#FCD34D", text_col="#B45309")
    draw_pill(draw, 1185, 455, "Result Sets", f_pill, fill_bg="#FFFBEB", outline_col="#FCD34D", text_col="#B45309")

    # Backend -> Mail Server
    draw_arrow(draw, (1140, 655), (1230, 655), fill="#DB2777", width=2, arrow_size=10)
    draw_pill(draw, 1185, 655, "SMTP / TLS", f_pill, fill_bg="#FDF2F8", outline_col="#FBCFE8", text_col="#9D174D")

    output_path = "c:\\Users\\gbhav\\OneDrive\\Desktop\\HMS\\system_architecture.png"
    img.save(output_path, "PNG")
    print(f"Saved: {output_path}")


# ==============================================================================
# 2. SIMPLE SINGLE DATA FLOW DIAGRAM (ALIGNED HORIZONTAL LANES)
# ==============================================================================
def create_single_data_flow_diagram():
    W, H = 1680, 960
    img = Image.new("RGBA", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)

    f_title = get_font(FONT_BOLD, 28)
    f_sub = get_font(FONT_REGULAR, 16)
    f_col_title = get_font(FONT_BOLD, 19)
    f_card_title = get_font(FONT_BOLD, 15)
    f_card_item = get_font(FONT_REGULAR, 12)
    f_pill = get_font(FONT_BOLD, 12)

    # Title Bar
    draw.text((60, 35), "Hospital Management System (HMS)", font=f_title, fill="#0F172A")
    draw.text((60, 73), "Data Flow Diagram - System Data Flow Across Modules", font=f_sub, fill="#64748B")
    draw.line([(60, 105), (1620, 105)], fill="#CBD5E1", width=2)

    # 3 Distinct Columns:
    # Column 1 (Left): User Roles (Admin, Patient, Doctor, Pharmacist)
    # Column 2 (Center): Core System Processes (Aligned neatly with actors)
    # Column 3 (Right): Data Storage (MySQL DB) & Notifications (SMTP Mail)

    # Column Titles
    draw.text((70, 125), "1. User Roles (Actors)", font=f_col_title, fill="#1E293B")
    draw.text((70, 150), "Input sources & result receivers", font=f_card_item, fill="#64748B")

    draw.text((530, 125), "2. Core System Processes", font=f_col_title, fill="#1E293B")
    draw.text((530, 150), "Business workflows & automation", font=f_card_item, fill="#64748B")

    draw.text((1200, 125), "3. Storage & Notifications", font=f_col_title, fill="#1E293B")
    draw.text((1200, 150), "Central database & email alerts", font=f_card_item, fill="#64748B")

    # Dimensions
    c1_x1, c1_x2 = 60, 380
    c2_x1, c2_x2 = 520, 1050
    c3_x1, c3_x2 = 1190, 1620

    # 5 Parallel Functional Lanes:
    # Lane 1: Admin & User Authentication
    # Lane 2: Patient & Appointment Booking
    # Lane 3: Doctor Consultation & E-Prescription
    # Lane 4: Pharmacist & Medicine Inventory
    # Lane 5: Billing, Payments & Invoices

    lanes = [
        # (y, Actor Name, Actor Desc, Process Name, Process Desc, ColorTheme)
        (185,
         "ADMINISTRATOR",
         "• Staff, doctor & patient onboarding\n• System audit logs & security policies\n• Hospital analytics & performance",
         "Process 1: Auth & User Management",
         "• Authenticates credentials via BCrypt hashing\n• Generates signed JWT tokens with user roles\n• Enforces role-based API access permissions",
         "#EF4444", "#FEF2F2", "#7F1D1D", "#FEFCE8", "#EAB308", "#854D0E"),

        (325,
         "PATIENT",
         "• Registers account & searches doctors\n• Books consultation appointment slot\n• Receives email confirmation & token",
         "Process 2: Appointment Scheduling",
         "• Checks doctor availability & schedule slots\n• Books appointment & assigns token number\n• Triggers real-time email notifications",
         "#2563EB", "#EFF6FF", "#1E3A8A", "#EFF6FF", "#3B82F6", "#1E40AF"),

        (465,
         "DOCTOR",
         "• Views daily appointments & patient queue\n• Reviews medical history & records findings\n• Issues digital prescription & dosage",
         "Process 3: Clinical Consultation & Rx",
         "• Captures diagnosis, symptoms & medical notes\n• Generates digital prescriptions with instructions\n• Updates appointment status to COMPLETED",
         "#059669", "#ECFDF5", "#064E3B", "#ECFDF5", "#10B981", "#065F46"),

        (605,
         "PHARMACIST",
         "• Views active doctor prescriptions\n• Dispenses prescribed medicines\n• Tracks batch numbers & stock levels",
         "Process 4: Pharmacy & Medicine Inventory",
         "• Deducts dispensed quantities from stock\n• Validates medicine batch & expiry dates\n• Generates low-stock and expiry warnings",
         "#7C3AED", "#F5F3FF", "#4C1D95", "#F5F3FF", "#8B5CF6", "#5B21B6"),

        (745,
         "BILLING DESK / PATIENT",
         "• Reviews consultation & medicine charges\n• Completes invoice payment\n• Downloads itemized medical receipt",
         "Process 5: Billing & Invoicing Engine",
         "• Calculates consultation fee + medicine costs\n• Applies taxes, discounts & calculates total\n• Generates paid invoice receipt & payment log",
         "#D97706", "#FFFBEB", "#78350F", "#FFF7ED", "#F97316", "#9A3412")
    ]

    for y, aname, adesc, pname, pdesc, acol, abg, atxt, pbg, pborder, ptxt in lanes:
        h = 115
        # 1. Actor Card
        draw_rounded_card(draw, (c1_x1, y, c1_x2, y + h), radius=10, fill=abg, outline=acol, width=2)
        draw.rounded_rectangle((c1_x1, y, c1_x2, y + 30), radius=10, fill=acol)
        draw.rectangle((c1_x1, y + 16, c1_x2, y + 30), fill=acol)
        draw_text_centered(draw, aname, f_pill, "#FFFFFF", (c1_x1, y, c1_x2, y + 30))
        
        # Actor bullet points
        by = y + 36
        for line in adesc.split("\n"):
            draw.text((c1_x1 + 12, by), line, font=f_card_item, fill=atxt)
            by += 22

        # 2. Process Card
        draw_rounded_card(draw, (c2_x1, y, c2_x2, y + h), radius=10, fill=pbg, outline=pborder, width=2)
        draw.text((c2_x1 + 18, y + 10), pname, font=f_card_title, fill=ptxt)
        
        # Process bullet points
        p_by = y + 36
        for line in pdesc.split("\n"):
            draw.text((c2_x1 + 18, p_by), line, font=f_card_item, fill="#374151")
            p_by += 22

        # 3. Horizontal Arrow from Actor to Process
        draw_arrow(draw, (c1_x2, y + h//2), (c2_x1, y + h//2), fill=acol, width=2, arrow_size=9)
        draw_pill(draw, (c1_x2 + c2_x1)//2, y + h//2, "Data Flow", f_pill, fill_bg="#FFFFFF", outline_col="#CBD5E1", text_col=acol, pad_x=8, pad_y=4)

    # ------------------ COLUMN 3: STORAGE & NOTIFICATIONS ------------------
    # MySQL Database Card (covers rows 1-4)
    db_y1, db_y2 = 185, 620
    draw_rounded_card(draw, (c3_x1, db_y1, c3_x2, db_y2), radius=12, fill="#FFFDF5", outline="#F59E0B", width=2)
    draw.rounded_rectangle((c3_x1, db_y1, c3_x2, db_y1 + 38), radius=12, fill="#F59E0B")
    draw.rectangle((c3_x1, db_y1 + 22, c3_x2, db_y1 + 38), fill="#F59E0B")
    draw_text_centered(draw, "DATA STORE: MySQL (hms_db)", f_card_title, "#FFFFFF", (c3_x1, db_y1, c3_x2, db_y1 + 38))

    db_items = [
        "users: Credentials, profiles & roles",
        "doctors: Schedules, fees & license numbers",
        "patients: Demographics & medical history",
        "appointments: Visits, slots & status logs",
        "medical_records: Clinical notes & findings",
        "prescriptions: Meds, dosages & duration",
        "medicines: Pharmacy stock & batch info",
        "bills: Invoices, items & payment receipts",
        "audit_logs: User activities & login history"
    ]
    dby = db_y1 + 48
    for item in db_items:
        draw.rounded_rectangle((c3_x1 + 15, dby, c3_x2 - 15, dby + 30), radius=5, fill="#FFFFFF", outline="#FCD34D")
        draw.text((c3_x1 + 25, dby + 7), item, font=get_font(FONT_REGULAR, 11), fill="#78350F")
        dby += 38

    # Email Alerts Box (covers row 5)
    em_y1, em_y2 = 645, 860
    draw_rounded_card(draw, (c3_x1, em_y1, c3_x2, em_y2), radius=12, fill="#FDF2F8", outline="#EC4899", width=2)
    draw.rounded_rectangle((c3_x1, em_y1, c3_x2, em_y1 + 38), radius=12, fill="#EC4899")
    draw.rectangle((c3_x1, em_y1 + 22, c3_x2, em_y1 + 38), fill="#EC4899")
    draw_text_centered(draw, "OUTPUT: Email Alerts (Gmail SMTP)", f_card_title, "#FFFFFF", (c3_x1, em_y1, c3_x2, em_y1 + 38))

    draw.text((c3_x1 + 20, em_y1 + 48), "• Booking Confirmation to Patient", font=get_font(FONT_BOLD, 12), fill="#9D174D")
    draw.text((c3_x1 + 20, em_y1 + 70), "  Contains appointment date, time & doctor", font=f_card_item, fill="#64748B")
    draw.text((c3_x1 + 20, em_y1 + 98), "• New Appointment Alert to Doctor", font=get_font(FONT_BOLD, 12), fill="#9D174D")
    draw.text((c3_x1 + 20, em_y1 + 120), "  Notifies doctor of newly scheduled patient", font=f_card_item, fill="#64748B")
    draw.text((c3_x1 + 20, em_y1 + 148), "• Appointment Cancellation Notice", font=get_font(FONT_BOLD, 12), fill="#9D174D")
    draw.text((c3_x1 + 20, em_y1 + 170), "  Real-time schedule update delivery", font=f_card_item, fill="#64748B")

    # Connect Processes to DB
    for y_offset in [242, 382, 522, 662, 802]:
        target_y = min(db_y2 - 20, max(db_y1 + 50, y_offset))
        draw_arrow(draw, (c2_x2, y_offset), (c3_x1, target_y), fill="#D97706", width=2, arrow_size=9)
    draw_pill(draw, (c2_x2 + c3_x1)//2, 400, "SQL Read / Write", f_pill, fill_bg="#FFFBEB", outline_col="#FCD34D", text_col="#B45309")

    # Connect Appointment Process to Email Alerts
    draw_arrow(draw, (c2_x2, 395), (c3_x1, 740), fill="#EC4899", width=2, arrow_size=9)
    draw_pill(draw, (c2_x2 + c3_x1)//2, 610, "Trigger Email", f_pill, fill_bg="#FDF2F8", outline_col="#FBCFE8", text_col="#9D174D")

    output_path = "c:\\Users\\gbhav\\OneDrive\\Desktop\\HMS\\data_flow_diagram.png"
    img.save(output_path, "PNG")
    print(f"Saved: {output_path}")

if __name__ == "__main__":
    create_system_architecture()
    create_single_data_flow_diagram()
    print("Clean single diagrams generated successfully!")
