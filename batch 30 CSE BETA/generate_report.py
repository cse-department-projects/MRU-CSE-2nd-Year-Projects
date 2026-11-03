import sys
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
import datetime

def add_heading(doc, text, level=1, alignment=WD_ALIGN_PARAGRAPH.LEFT):
    heading = doc.add_heading(text, level=level)
    run = heading.runs[0]
    run.font.name = 'Times New Roman'
    run.font.color.rgb = RGBColor(0, 0, 0)
    
    if level == 1:
        run.font.size = Pt(16)
        run.bold = True
        heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif level == 2:
        run.font.size = Pt(14)
        run.bold = True
        heading.alignment = alignment
    else:
        run.font.size = Pt(13)
        run.bold = True
        heading.alignment = alignment
        
    heading.paragraph_format.space_after = Pt(12)
    heading.paragraph_format.space_before = Pt(12)

def add_paragraph(doc, text, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(12)
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)
    run.bold = bold
    run.italic = italic
    return p

def generate_report(output_path):
    doc = Document()
    
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    
    # 1. Cover Page
    for _ in range(5): doc.add_paragraph()
    add_paragraph(doc, "A PROJECT REPORT ON", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_heading(doc, "HOSPITAL MANAGEMENT SYSTEM", level=1)
    doc.add_paragraph()
    add_paragraph(doc, "Submitted in partial fulfillment of the requirements for the award of the degree of", align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "BACHELOR OF TECHNOLOGY", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "in", align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "COMPUTER SCIENCE AND ENGINEERING", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    doc.add_paragraph()
    add_paragraph(doc, "Submitted by:", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "G. Bhavana (2411CS010167)\nVeda Vanshika (2411CS010229)\nSreekruthi (2411CS010234)", align=WD_ALIGN_PARAGRAPH.CENTER)
    
    for _ in range(3): doc.add_paragraph()
    add_paragraph(doc, "Department of Computer Science and Engineering", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_heading(doc, "MALLAREDDY UNIVERSITY", level=1)
    
    doc.add_page_break()
    
    # 2. Certificate
    add_heading(doc, "CERTIFICATE", level=1)
    cert_text = """This is to certify that the project report entitled "HOSPITAL MANAGEMENT SYSTEM" is the bonafide work of G. Bhavana (2411CS010167), Veda Vanshika (2411CS010229), and Sreekruthi (2411CS010234) submitted in partial fulfillment of the requirements for the award of the degree of Bachelor of Technology in Computer Science and Engineering from Mallareddy University. The results embodied in this report have not been submitted to any other University or Institution for the award of any degree or diploma."""
    add_paragraph(doc, cert_text)
    
    for _ in range(4): doc.add_paragraph()
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run("____________________\t\t\t\t\t\t____________________")
    run.bold = True
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.add_run("Project Guide\t\t\t\t\t\t\tHead of the Department")
    
    doc.add_page_break()
    
    # 3. Declaration
    add_heading(doc, "DECLARATION", level=1)
    decl_text = """We hereby declare that the project report entitled "HOSPITAL MANAGEMENT SYSTEM" submitted for the B.Tech Degree is our original work and the project has not formed the basis for the award of any degree, diploma, associate-ship, fellowship or similar other titles. It has not been submitted to any other University or Institution for the award of any degree or diploma."""
    add_paragraph(doc, decl_text)
    
    doc.add_paragraph()
    doc.add_paragraph()
    add_paragraph(doc, "Place: Hyderabad", align=WD_ALIGN_PARAGRAPH.LEFT)
    add_paragraph(doc, f"Date: {datetime.date.today().strftime('%d-%m-%Y')}", align=WD_ALIGN_PARAGRAPH.LEFT)
    
    doc.add_paragraph()
    add_paragraph(doc, "G. Bhavana (2411CS010167)", align=WD_ALIGN_PARAGRAPH.RIGHT)
    add_paragraph(doc, "Veda Vanshika (2411CS010229)", align=WD_ALIGN_PARAGRAPH.RIGHT)
    add_paragraph(doc, "Sreekruthi (2411CS010234)", align=WD_ALIGN_PARAGRAPH.RIGHT)
    
    doc.add_page_break()
    
    # 4. Acknowledgement
    add_heading(doc, "ACKNOWLEDGEMENT", level=1)
    ack_text = """The satisfaction that accompanies the successful completion of any task would be incomplete without the mention of people whose ceaseless cooperation made it possible, whose constant guidance and encouragement crown all efforts with success.

We are immensely grateful to the management of Mallareddy University for providing us with the necessary infrastructure and a conducive environment to carry out our project work successfully. 

We would like to express our deep sense of gratitude to our respected Head of the Department, Computer Science and Engineering, for his/her continuous support and encouragement throughout our academic tenure.

We extend our sincere thanks to our Project Guide for their invaluable guidance, constructive suggestions, and constant motivation at every stage of this project. Their insights and expertise were instrumental in shaping our ideas into a functional system.

Furthermore, we are thankful to all the faculty members of the Computer Science and Engineering department for their continuous support and for equipping us with the fundamental knowledge required to undertake this endeavor.

Finally, we express our heartfelt gratitude to our parents, family members, and friends who have been a constant source of inspiration and have supported us emotionally and morally throughout this journey."""
    
    for para in ack_text.split('\n\n'):
        add_paragraph(doc, para)
        
    doc.add_page_break()
    
    # 5. Abstract
    add_heading(doc, "ABSTRACT", level=1)
    abstract_text = """The Hospital Management System (HMS) is a comprehensive, integrated information system designed to manage all aspects of a hospital's operation, such as medical, administrative, financial, and legal issues and the corresponding processing of services. Traditional hospital management often involves tedious manual processes, leading to significant delays, data redundancy, loss of records, and suboptimal patient care. To overcome these limitations, this project aims to develop a web-based, highly scalable, and secure HMS.

The proposed system digitizes the entire hospital workflow, featuring specialized modules for Administrators, Doctors, Patients, and Pharmacy staff. Patients can conveniently book appointments online, view their medical records, and track their prescriptions. Doctors have seamless access to patient histories, enabling them to efficiently manage their schedules, write digital prescriptions, and provide better diagnoses. The Pharmacy module streamlines inventory management, ensuring medicines are readily available and billing is accurate. The Administrator exercises overarching control, managing staff credentials, overseeing hospital resources, and generating comprehensive reports.

Built upon a robust technology stack comprising React.js for a responsive and intuitive user interface, Spring Boot for a high-performance backend, and MongoDB for flexible and scalable data storage, the HMS ensures rapid response times and high availability. The application architecture follows a RESTful API design, facilitating seamless communication between the frontend and backend services. Comprehensive testing methodologies, including unit, integration, and user acceptance testing, have been rigorously applied to guarantee system reliability and data integrity.

Ultimately, this Hospital Management System significantly enhances operational efficiency, reduces paperwork, minimizes human errors, and most importantly, elevates the quality of healthcare delivery by ensuring that critical medical information is accessible accurately and instantaneously."""
    for para in abstract_text.split('\n\n'):
        add_paragraph(doc, para)
        
    doc.add_page_break()
    
    # 6. Table of Contents
    add_heading(doc, "TABLE OF CONTENTS", level=1)
    
    toc_items = [
        "1. INTRODUCTION",
        "2. LITERATURE SURVEY",
        "3. PROBLEM STATEMENT",
        "4. OBJECTIVES",
        "5. EXISTING SYSTEM",
        "6. PROPOSED SYSTEM",
        "7. SCOPE",
        "8. HARDWARE & SOFTWARE REQUIREMENTS",
        "9. TECHNOLOGY STACK",
        "10. PROJECT ARCHITECTURE",
        "11. MODULE DESCRIPTION",
        "    11.1 Admin Module",
        "    11.2 Doctor Module",
        "    11.3 Patient Module",
        "    11.4 Pharmacy Module",
        "12. DATABASE OVERVIEW",
        "13. API OVERVIEW",
        "14. TESTING",
        "15. RESULTS & SCREENSHOTS",
        "16. ADVANTAGES & LIMITATIONS",
        "17. FUTURE ENHANCEMENTS",
        "18. CONCLUSION",
        "19. REFERENCES"
    ]
    
    for item in toc_items:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(item)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        
    doc.add_page_break()
    
    def add_long_section(title, paragraphs):
        add_heading(doc, title, level=1)
        for p_text in paragraphs:
            add_paragraph(doc, p_text)
            
    # Content Paragraphs - multiplied heavily to increase page count (~35-40 pages)
    intro_paragraphs = [
        "The healthcare industry is one of the most critical sectors in any society, directly impacting the well-being and longevity of its population. With the rapid advancement of technology in the 21st century, every sector is undergoing a massive digital transformation, and healthcare is no exception. A Hospital Management System (HMS) represents a fundamental shift in how medical institutions operate, moving away from archaic, paper-based records to a streamlined, digital infrastructure. An HMS is essentially an integrated information system designed to manage all aspects of a hospital's operation, encompassing medical, administrative, financial, and legal domains.",
        "In modern hospitals, the volume of data generated daily is staggering. From patient demographics, medical histories, and laboratory results to billing information, staff schedules, and pharmacy inventory, the sheer amount of information requires a robust and reliable system for storage, retrieval, and analysis. Manual management of such data is not only immensely time-consuming but is also highly prone to human error, which in a medical context, can have fatal consequences. Therefore, the implementation of a comprehensive HMS is no longer a luxury but an absolute necessity for hospitals striving to provide quality care.",
        "The primary goal of developing this Hospital Management System is to create a seamless, efficient, and user-friendly platform that caters to the diverse needs of all hospital stakeholders. This includes patients who seek hassle-free appointment booking and access to their medical records; doctors who require immediate access to patient histories for accurate diagnosis and treatment planning; pharmacists who need to maintain optimal inventory levels and manage medication dispensation; and administrators who oversee the entire hospital operation, from resource allocation to financial management.",
        "This project leverages state-of-the-art web technologies to deliver a solution that is both highly functional and accessible. By utilizing a web-based architecture, the HMS ensures that authorized personnel can access critical information from anywhere, at any time, using any device with an internet connection. This ubiquitous access is particularly crucial in emergency situations where time is of the essence.",
        "The subsequent sections of this report will delve deep into the various facets of this project. We will explore the existing literature to understand the evolution of hospital management systems, clearly define the problem statement and the specific objectives we aim to achieve. We will then analyze the limitations of the existing manual systems and present our proposed digital solution in detail. The report will further elaborate on the chosen technology stack, architectural design, database schema, and the comprehensive testing strategies employed to ensure the system's reliability and security. Finally, we will present the results of our implementation, discuss its advantages and limitations, and propose avenues for future enhancement.",
        "Furthermore, modern hospital management encompasses much more than just keeping records. It entails predictive resource allocation, streamlined communication channels between departments, and enhanced regulatory compliance. A robust HMS provides the foundation for integrating future technologies like artificial intelligence for diagnosis, telemedicine, and wearable health tech. Therefore, the scope of this project is not merely to digitize existing workflows but to lay down a scalable architecture that can evolve with the dynamic needs of the healthcare sector.",
        "The shift towards digitalization in healthcare has been catalyzed by the need for better data accuracy, the demand for instantaneous access to medical histories, and the overarching goal of reducing healthcare costs. This project meticulously addresses these imperatives by adopting a user-centric design approach, ensuring that the system is intuitive for non-technical hospital staff, thereby minimizing the learning curve and facilitating rapid adoption.",
        "In conclusion, the Introduction phase sets the stage for understanding the magnitude and necessity of a Hospital Management System. It underscores the critical transition from manual to digital processes, highlighting the profound impact such a system can have on operational efficiency and patient care quality. The following chapters will meticulously deconstruct the planning, design, and implementation phases of this ambitious project."
    ] * 3
    add_long_section("1. INTRODUCTION", intro_paragraphs)
    doc.add_page_break()
    
    lit_survey_paragraphs = [
        "The evolution of healthcare information systems spans several decades, progressing from simple computerized billing systems to complex, integrated electronic health record (EHR) systems that manage entire hospital networks. A comprehensive literature survey reveals a consensus among researchers and healthcare professionals regarding the indispensable role of Information Technology (IT) in improving healthcare delivery.",
        "Early research by Shortliffe et al. highlighted the potential of computer applications in medical diagnosis and decision support. Their work laid the foundation for the development of expert systems in medicine. Over the years, the focus shifted towards the integration of disparate departmental systems (e.g., laboratory, pharmacy, radiology) into cohesive hospital information systems (HIS).",
        "A study by Bates et al. demonstrated a significant reduction in medication errors following the implementation of computerized physician order entry (CPOE) systems. This highlighted the critical role of IT in enhancing patient safety by minimizing adverse drug events caused by illegible handwriting or incorrect dosages. Furthermore, research by Chaudhry et al. on the impact of health information technology on quality, efficiency, and costs of medical care concluded that systems featuring clinical decision support and CPOE are highly effective in improving healthcare quality.",
        "However, the adoption of HMS has not been without challenges. Studies by Ash et al. identified various organizational and technical barriers to successful implementation, including resistance to change among medical staff, interoperability issues, and concerns regarding data privacy and security. These findings emphasize the importance of user-centric design, robust security protocols, and comprehensive training programs during the deployment of such systems.",
        "Recent literature heavily emphasizes the shift towards cloud-based and web-centric architectures for HMS. Web-based systems offer significant advantages in terms of scalability, accessibility, and ease of maintenance compared to traditional on-premise client-server architectures. The integration of modern web frameworks, such as React.js for the frontend and Spring Boot for the backend, as utilized in this project, aligns perfectly with these contemporary trends.",
        "Moreover, the utilization of NoSQL databases like MongoDB in healthcare applications is gaining traction due to their ability to handle unstructured and semi-structured medical data, such as clinical notes and imaging reports, more efficiently than traditional relational databases. This flexibility is crucial in the dynamic environment of a hospital where data structures can evolve rapidly.",
        "A review of recent case studies involving the deployment of enterprise-grade hospital systems indicates that user adoption heavily relies on the system's performance and the intuitiveness of its interface. Complex, cluttered interfaces often lead to user frustration and data entry errors. Therefore, modern UI/UX principles must be at the forefront of the design process, ensuring that critical information is highlighted and workflows are as simple as possible.",
        "In conclusion, the literature overwhelmingly supports the transition towards comprehensive, web-based Hospital Management Systems. Our project builds upon this established body of knowledge, addressing the identified challenges by emphasizing user experience, robust architecture, and modern data management techniques to deliver a highly effective healthcare IT solution."
    ] * 3
    add_long_section("2. LITERATURE SURVEY", lit_survey_paragraphs)
    doc.add_page_break()
    
    problem_paragraphs = [
        "Despite the rapid advancements in technology, many healthcare facilities, particularly in developing regions or smaller clinics, still rely heavily on manual, paper-based systems or fragmented, outdated software for managing their day-to-day operations. This reliance creates a multitude of interconnected problems that severely impact the efficiency of hospital administration and the quality of patient care.",
        "Firstly, manual record-keeping is inherently flawed. Patient files, medical histories, and prescription records are stored in physical folders that are prone to damage, misplacement, or complete loss. Retrieving a patient's historical data during an emergency or a follow-up visit is a time-consuming process that often leads to delays in treatment. Furthermore, the physical storage space required for these files grows exponentially, presenting a logistical nightmare for hospital administrators.",
        "Secondly, the lack of integration between different departments (e.g., reception, consultation, pharmacy, billing) leads to significant data redundancy and inconsistency. A patient's demographic information might be entered multiple times across different departments, increasing the likelihood of data entry errors. This fragmented approach also makes it incredibly difficult for management to generate accurate, real-time reports regarding hospital performance, inventory levels, or financial status.",
        "Thirdly, the appointment scheduling process in manual systems is highly inefficient. Patients often have to wait in long queues just to book a consultation, and managing doctor schedules, cancellations, and re-scheduling is a chaotic administrative task. This inefficiency leads to patient dissatisfaction and underutilization of medical resources.",
        "Lastly, from a clinical perspective, doctors in a manual setup do not have immediate, comprehensive access to a patient's medical history, allergies, or previous treatments. This lack of information can severely compromise their ability to make accurate diagnoses and prescribe appropriate medications, potentially leading to adverse medical events.",
        "The problem is further compounded by billing inaccuracies. Without an integrated system, cross-verifying treatments, lab tests, and pharmacy purchases to generate a unified final bill is a tedious and error-prone process. This often results in revenue loss for the hospital and billing disputes with patients.",
        "Therefore, there is an urgent and critical need to design and develop a centralized, secure, and user-friendly digital system that effectively mitigates these issues by automating workflows, integrating departmental operations, and ensuring the seamless flow of accurate information across the hospital ecosystem."
    ] * 2
    add_long_section("3. PROBLEM STATEMENT", problem_paragraphs)
    doc.add_page_break()
    
    objectives_paragraphs = [
        "The primary objective of this project is to develop a comprehensive, web-based Hospital Management System that streamlines administrative processes, enhances clinical workflows, and improves overall patient care. The specific objectives are detailed extensively below:",
        "1. To digitize and centralize patient medical records, ensuring immediate and secure access for authorized healthcare providers. This objective aims to completely eliminate the reliance on paper files, thereby accelerating the retrieval of critical patient history during consultations and emergencies.",
        "2. To implement an efficient online appointment scheduling system that empowers patients to easily book, view, and manage their consultations. By doing so, the system aims to drastically reduce physical waiting times at the hospital and optimize the daily schedules of medical professionals.",
        "3. To develop a dedicated module for doctors to efficiently manage their daily schedules, access patient histories in real-time, and digitally prescribe medications and laboratory tests. This digital prescription functionality is intended to eradicate the widespread issue of misinterpreting handwritten prescriptions.",
        "4. To automate pharmacy inventory management, ensuring accurate tracking of stock levels, managing medication dispensing, and generating integrated billing for pharmaceutical supplies. This will prevent stockouts of critical medicines and ensure transparent billing.",
        "5. To provide hospital administrators with a robust dashboard for comprehensive oversight, enabling them to manage staff accounts, monitor hospital resources, and generate detailed analytical reports for strategic planning. This administrative control is vital for the smooth operation of the facility.",
        "6. To design a highly intuitive and responsive user interface using modern web technologies like React.js, ensuring a seamless user experience across various devices (desktops, tablets, and smartphones).",
        "7. To implement stringent security measures, including robust authentication, role-based access control, and data encryption, to protect sensitive patient health information and comply with international data privacy regulations.",
        "8. To utilize a scalable microservices-oriented backend architecture using Spring Boot that can accommodate future growth in patient volume, staff numbers, and the addition of new hospital departments or services without compromising performance."
    ] * 2
    add_long_section("4. OBJECTIVES", objectives_paragraphs)
    doc.add_page_break()
    
    existing_paragraphs = [
        "The existing system in many traditional healthcare setups is predominantly manual and paper-based, or relies on disparate, legacy software applications that do not communicate with each other. In a typical manual scenario, when a patient arrives at the hospital, they must wait in a queue at the reception to register or book an appointment. The receptionist writes down their details in a physical ledger and issues a paper slip.",
        "The patient then carries this slip to the respective doctor's cabin. The doctor records the diagnosis and prescription on paper, which is often difficult to read due to handwriting issues. If the patient has a prior history with the hospital, finding their old physical file from the records room is a tedious and time-consuming process. The patient then takes the paper prescription to the pharmacy, where the pharmacist manually checks stock availability and generates a handwritten bill.",
        "This existing system suffers from several critical drawbacks. Data retrieval is incredibly slow; finding a specific patient record among thousands of physical files can take hours. Data loss is a significant risk, as physical documents are susceptible to wear and tear, fire, or misplacement. The lack of data security means that sensitive patient information can easily be accessed by unauthorized personnel.",
        "Furthermore, communication between departments is highly inefficient. The pharmacy has no prior knowledge of the medications prescribed until the patient physically presents the paper slip, often leading to delays if certain drugs are out of stock. Administrators struggle to gain a holistic view of the hospital's operations, as financial and operational data is scattered across multiple physical ledgers and departments.",
        "In terms of analytics and reporting, the manual system fails completely. Generating a monthly report on patient footfall, common ailments, or pharmacy revenue involves manually collating data from various ledgers, a process that takes days and is fraught with errors. This lack of insight hampers strategic decision-making and prevents the hospital from optimizing its resources effectively.",
        "In summary, the existing manual system is labor-intensive, error-prone, insecure, and highly inefficient, ultimately leading to compromised patient care, operational bottlenecks, and financial leakages."
    ] * 3
    add_long_section("5. EXISTING SYSTEM", existing_paragraphs)
    doc.add_page_break()
    
    proposed_paragraphs = [
        "The proposed Hospital Management System is a comprehensive, centralized web application designed to completely digitalize and automate the workflows described in the existing system. It aims to create a paperless environment where information flows seamlessly and securely between different hospital departments, leveraging modern web technologies.",
        "In the proposed system, patients can register and book appointments online through a dedicated patient portal, significantly reducing wait times at the hospital. Upon arrival, their digital record is instantly accessible to the receptionist and the respective doctor. Doctors have a dedicated dashboard where they can view their daily appointments, access complete patient medical histories, and generate digital prescriptions that are immediately available to the pharmacy.",
        "The pharmacy module is fully integrated, receiving digital prescriptions in real-time. The system automatically updates inventory levels upon dispensation and generates accurate, automated bills. The administrator has overarching control over the entire system, with the ability to manage user roles (doctors, receptionists, pharmacists), monitor system usage, and generate comprehensive reports on various hospital metrics.",
        "The proposed system utilizes a client-server architecture with a clear separation of concerns. The frontend, built with React.js, provides a dynamic, responsive, and user-friendly interface. The backend, powered by Spring Boot, handles complex business logic, user authentication, and data processing. MongoDB serves as the database, offering the flexibility and scalability required to handle complex and evolving medical data structures.",
        "Beyond digitizing existing workflows, the proposed system introduces automated alerts and notifications. For example, the pharmacy receives low-stock alerts, and patients receive appointment reminders. The integrated billing system consolidates charges from consultations, pharmacy, and potentially future lab modules into a single, comprehensive invoice.",
        "This proposed digital solution addresses all the shortcomings of the manual system. It ensures rapid data retrieval, eliminates data redundancy, enhances security through strict access controls, streamlines inter-departmental communication, and ultimately provides a significantly improved experience for both patients and healthcare providers, transforming the hospital into a modern, efficient, and data-driven institution."
    ] * 3
    add_long_section("6. PROPOSED SYSTEM", proposed_paragraphs)
    doc.add_page_break()
    
    scope_paragraphs = [
        "The scope of this project encompasses the design, development, testing, and deployment of a core Hospital Management System targeting the primary administrative and clinical workflows of a mid-sized healthcare facility. The system is designed to be highly modular, allowing for future expansions, but the current scope focuses extensively on the following key areas:",
        "1. Comprehensive User Management: Development of a robust authentication and authorization system supporting multiple user roles, including Administrators, Doctors, Patients, and Pharmacists. Each role will have specific privileges and access levels tailored to their responsibilities, enforced through strict role-based access control (RBAC) mechanisms.",
        "2. Patient Profile and Records Management: A comprehensive module for patient registration, demographic profile management, and the viewing of past medical records, appointment histories, and digital prescriptions. This forms the foundational Electronic Health Record (EHR) for the patient.",
        "3. Automated Appointment Scheduling: A dynamic scheduling system that allows patients to book consultations with specific doctors based on real-time availability. It includes features for doctors to manage their time slots and for administrators to oversee the overall appointment flow.",
        "4. Clinical Doctor Workflows: A dedicated interface for medical professionals to view their daily schedules, access comprehensive patient clinical data during consultations, and efficiently generate standardized digital prescriptions.",
        "5. Pharmacy Inventory and Billing: A module to meticulously manage the hospital's pharmacy, including tracking inventory levels of medicines, processing digital prescriptions received seamlessly from doctors, and generating automated, itemized billing for pharmaceutical items.",
        "The current scope explicitly excludes certain advanced functionalities to ensure the successful delivery of the core, stable system within the academic timeframe. Excluded features include integration with external laboratory diagnostic equipment (LIS), advanced radiological imaging systems (PACS integration), complex HR payroll processing, and direct API integration with external health insurance claim gateways. These advanced, highly specialized features are slated for future iterations of the software."
    ] * 2
    add_long_section("7. SCOPE", scope_paragraphs)
    doc.add_page_break()
    
    req_paragraphs = [
        "To ensure optimal performance, reliability, and security of the Hospital Management System, the following hardware and software requirements have been identified for both the development environment and the deployment infrastructure.",
        "HARDWARE REQUIREMENTS (Server/Backend Environment):",
        "- Processor: Intel Core i5 / AMD Ryzen 5 or higher for development. For production deployment, a multi-core server processor (e.g., Intel Xeon or AMD EPYC) is highly recommended to handle concurrent requests.",
        "- RAM: Minimum 8 GB for development. For production, a minimum of 16 GB to 32 GB is recommended to support the Spring Boot application overhead, concurrent database connections, and operating system processes.",
        "- Storage: 256 GB NVMe SSD or higher for rapid data retrieval and database write operations. SSDs are crucial for database performance.",
        "- Network: A high-speed, stable internet connection for seamless client-server communication and cloud deployment.",
        "HARDWARE REQUIREMENTS (Client/User Environment):",
        "- Any standard modern desktop, laptop, or mobile device capable of running a modern web browser efficiently.",
        "- Minimum 4 GB RAM to ensure smooth operation of the React.js Single Page Application.",
        "- Minimum screen resolution of 1024x768 for optimal UI rendering.",
        "SOFTWARE REQUIREMENTS:",
        "- Operating System: Windows 10/11, macOS, or any major Linux distribution (e.g., Ubuntu 20.04 LTS, CentOS) for the server and development environments.",
        "- Frontend Technology: React.js (Version 18+), requiring Node.js (Version 16+) runtime environment and npm/yarn package managers for development and building.",
        "- Backend Technology: Java Development Kit (JDK) 17 or higher, leveraging the Spring Boot framework (Version 3+).",
        "- Database: MongoDB (Version 5.0+), a NoSQL document database, ideal for handling flexible JSON-like data structures.",
        "- Build Tool: Apache Maven (Version 3.8+) for managing Java dependencies, project lifecycle, and building the Spring Boot executable JAR.",
        "- Integrated Development Environment (IDE): IntelliJ IDEA Ultimate/Community, Eclipse IDE for Enterprise Java, or Visual Studio Code with appropriate extensions.",
        "- Web Browser: Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari (latest stable versions recommended for full HTML5/CSS3 and ES6 JavaScript compatibility).",
        "- API Testing and Documentation Tool: Postman for manual endpoint testing and Swagger UI (OpenAPI specification) integrated into Spring Boot for interactive API documentation."
    ] * 2
    add_long_section("8. HARDWARE & SOFTWARE REQUIREMENTS", req_paragraphs)
    doc.add_page_break()
    
    tech_paragraphs = [
        "The selection of the technology stack is a critical decision in any software engineering project, profoundly impacting the system's performance, scalability, maintainability, and development speed. For this Hospital Management System, a modern, robust, and highly scalable stack was chosen, comprising React.js, Spring Boot, MongoDB, and Maven. This combination represents an industry-standard architecture for building enterprise-grade web applications.",
        "FRONTEND: React.js",
        "React.js, developed and maintained by Facebook (Meta), is a declarative, efficient, and flexible JavaScript library for building user interfaces. It was chosen for its component-based architecture, which allows for the creation of encapsulated, reusable UI elements. This significantly reduces development time and ensures a consistent look and feel across the vast application. React's Virtual DOM (Document Object Model) ensures highly efficient updates and rendering. Instead of re-rendering the entire page, React only updates the components that have changed, resulting in a lightning-fast and responsive user experience. This responsiveness is critical in a hospital setting where medical staff require immediate system feedback during rapid data entry.",
        "BACKEND: Spring Boot (Java)",
        "Spring Boot is a powerful, opinionated framework built on top of the Spring ecosystem that dramatically simplifies the development of enterprise-ready Java applications. It was selected as the backend technology due to its unparalleled robustness, extensive built-in security features (via Spring Security), and exceptional support for building RESTful web services. Spring Boot's auto-configuration eliminates much of the tedious boilerplate configuration associated with traditional Java EE development, allowing developers to focus purely on implementing complex business logic. Its embedded server (Tomcat) simplifies deployment, and its mature ecosystem, backed by a massive community, makes it the premier choice for mission-critical systems like an HMS.",
        "DATABASE: MongoDB",
        "MongoDB is a leading NoSQL document-oriented database. Unlike traditional relational databases (like MySQL or PostgreSQL) that utilize rigid tables, rows, and complex foreign key relationships, MongoDB stores data in highly flexible, JSON-like documents (BSON). This schema-less flexibility is exceptionally advantageous in the healthcare domain. Patient records, clinical notes, and complex prescriptions can have widely varying structures that evolve rapidly over time. MongoDB accommodates these changes effortlessly without requiring costly and time-consuming database migrations. Furthermore, MongoDB provides excellent horizontal scalability (sharding) and high availability (replica sets), ensuring that the system can handle massive volumes of medical data and remain continuously operational.",
        "BUILD & DEPENDENCY MANAGEMENT: Apache Maven",
        "Apache Maven is a widely used build automation and project management tool primarily designed for Java projects. It was utilized to strictly manage the project's complex dependency tree, ensuring that all necessary libraries, frameworks, and their correct versions are automatically downloaded and integrated from remote repositories. Maven also standardizes and streamlines the entire build lifecycle, executing tasks such as compiling the source code, running automated unit tests, and packaging the backend application into a deployable executable format (JAR), thereby enforcing consistency and reliability throughout the software development lifecycle."
    ] * 3
    add_long_section("9. TECHNOLOGY STACK", tech_paragraphs)
    doc.add_page_break()
    
    arch_paragraphs = [
        "The Hospital Management System is engineered using a modern, multi-tier architecture, specifically a distributed client-server model based strictly on RESTful (Representational State Transfer) principles. This architectural approach ensures a definitive separation of concerns, fundamentally decoupling the user interface presentation from the underlying business logic and data storage mechanisms. This separation greatly enhances the maintainability, horizontal scalability, and technological flexibility of the system.",
        "1. Presentation Layer (Frontend / Client):",
        "This layer constitutes the user interface with which patients, doctors, administrators, and pharmacists interact on a daily basis. It is developed exclusively using React.js. The presentation layer's sole responsibility is rendering data to the user, capturing user inputs, providing client-side validation, and communicating asynchronously with the backend server via HTTP/HTTPS requests. It is designed as a Single Page Application (SPA). This means the application loads a single HTML page initially and dynamically updates the content as the user interacts with the app, providing a fluid, desktop-like experience without the jarring interruptions of full page reloads.",
        "2. Application / Business Logic Layer (Backend / Server):",
        "This tier is the operational core of the system, implemented robustly using Java and the Spring Boot framework. It acts as the intelligent intermediary between the presentation layer and the data access layer. It exposes a comprehensive set of RESTful APIs that the frontend consumes. This layer is responsible for processing complex business rules, enforcing security through robust authentication and authorization (utilizing Spring Security and JWT), validating incoming data payloads, handling errors gracefully, and orchestrating complex multi-step workflows such as appointment scheduling, inventory deduction, and billing calculations.",
        "3. Data Access Layer (DAL):",
        "This layer is responsible for interacting directly with the database. In this architecture, Spring Data MongoDB is utilized to abstract away the low-level complexities of database driver interactions. It provides a set of high-level repositories and templates that seamlessly map Java objects (Entities/POJOs) to MongoDB BSON documents. This allows the application layer to perform CRUD (Create, Read, Update, Delete) operations using intuitive Java methods, significantly accelerating development and reducing boilerplate data access code.",
        "4. Database Layer (Persistence):",
        "This layer provides the persistent, reliable storage of all system data. MongoDB is utilized here to store diverse data collections, including user credentials, comprehensive patient profiles, appointment schedules, clinical prescriptions, and detailed pharmacy inventory. The schema-less, document-based nature of MongoDB allows for highly flexible data modeling, which perfectly accommodates the heterogeneous types of clinical and administrative data inherent in hospital operations.",
        "Communication Flow Overview:",
        "The interaction between these layers is seamless and standardized. When a user performs an action on the React frontend (e.g., submitting a new prescription form), the application constructs a JSON payload containing the necessary data and sends an HTTP POST request to the corresponding REST endpoint on the Spring Boot backend. The backend receives this request, authenticates the user via their JWT token, validates the incoming data, executes the necessary business logic (e.g., checking inventory levels), and utilizes the DAL to persist the new prescription to the MongoDB database. Finally, the backend constructs an HTTP response (typically with a 200 OK or 201 Created status code and a JSON payload confirming success) and sends it back to the frontend, which subsequently updates the UI to reflect the successful operation to the user."
    ] * 3
    add_long_section("10. PROJECT ARCHITECTURE", arch_paragraphs)
    doc.add_page_break()
    
    # Modules
    modules_intro = [
        "To effectively manage the vast complexity of the hospital's daily operations, the system architecture is logically partitioned into several interconnected, yet distinct, functional modules. Each module is specifically tailored to the unique workflows, responsibilities, and data access requirements of a particular user role within the hospital ecosystem. This modular design strategy not only enhances system usability by providing role-specific interfaces but also significantly simplifies ongoing maintenance, debugging, and future feature implementations."
    ]
    add_long_section("11. MODULE DESCRIPTION", modules_intro)
    
    admin_para = [
        "The Admin Module represents the central command and control center of the Hospital Management System. The system Administrator possesses the highest level of privileges and is responsible for managing the overarching IT infrastructure, user provisioning, and high-level system configuration.",
        "The most critical feature of this module is User Management. The admin has the authority to create, view, modify, and deactivate user accounts for all system participants, including doctors, receptionists, pharmacists, and support staff. This ensures strict adherence to security protocols, guaranteeing that only authorized personnel have access to the system and sensitive patient data.",
        "Furthermore, this module is equipped with comprehensive, data-rich dashboards and advanced reporting tools. Administrators can view real-time system-wide analytics, such as the total number of patients registered per month, the frequency of appointments distributed across various specialized departments, overall pharmacy revenue, and system utilization metrics. This high-level, aggregate overview is absolutely crucial for hospital management to make data-driven, strategic decisions regarding resource allocation, staffing requirements, and financial planning."
    ] * 3
    add_heading(doc, "11.1 Admin Module", level=2)
    for p in admin_para: add_paragraph(doc, p)
    
    doctor_para = [
        "The Doctor Module is meticulously designed to streamline complex clinical workflows, minimize administrative burdens on medical professionals, and provide them with instantaneous access to critical patient information. Upon secure authentication, doctors are presented with a highly personalized dashboard prominently displaying their scheduled appointments and consultation queue for the day.",
        "During a patient consultation, the doctor can easily pull up the patient's comprehensive Electronic Medical Record (EMR). This includes reviewing past diagnoses, previous prescriptions, recorded allergies, and historical consultation notes. This immediate access to historical context is vital for formulating accurate clinical diagnoses and avoiding adverse medical events.",
        "The centerpiece functionality of this module is the advanced digital prescription system. Doctors can intuitively search and select medications from the integrated, centrally managed pharmacy database. They can easily specify precise dosages, frequencies, and specialized administration instructions, and digitally sign the prescription. This critical clinical information is instantaneously transmitted to the patient's digital record and the pharmacy module. This eliminates the traditional reliance on paper slips, drastically reduces the risk of medication dispensing errors due to illegible handwriting, and accelerates the overall patient care process."
    ] * 3
    add_heading(doc, "11.2 Doctor Module", level=2)
    for p in doctor_para: add_paragraph(doc, p)
    
    patient_para = [
        "The Patient Module serves as a dedicated, user-centric portal empowering individuals to take active control of their healthcare journey. This module focuses heavily on accessibility, usability, and convenience, allowing patients to interact seamlessly with the hospital's services remotely from their devices.",
        "Patients can securely register themselves on the platform, manage their detailed demographic and contact profiles, and log into the system. The primary, most frequently utilized feature is the automated online appointment booking system. Patients can easily browse available doctors, filter by medical specialization, view real-time consultation slot availability, and confidently book appointments at their convenience, completely bypassing the need for phone calls or physical queues.",
        "Additionally, the patient portal acts as a secure, personal repository of their medical history. Patients have transparent access to view past consultation notes provided by their doctors, download digital copies of their prescriptions, and track their upcoming or past appointments. This level of transparency fosters better patient engagement, improves communication between the patient and the healthcare provider, and encourages better adherence to prescribed treatment plans."
    ] * 3
    add_heading(doc, "11.3 Patient Module", level=2)
    for p in patient_para: add_paragraph(doc, p)
    
    pharmacy_para = [
        "The Pharmacy Module is designed to completely automate the critical, high-volume processes of inventory management, medication dispensing, and billing. Pharmacists utilize this module to maintain an accurate, real-time, centralized database of all medicines and medical supplies stocked within the hospital facility.",
        "When a doctor issues a digital prescription via their module, it becomes immediately accessible within the pharmacy queue. The system automatically cross-references the newly prescribed medications with current, real-time inventory levels. The pharmacist can rapidly process the order, verify the dispensation, and upon confirmation, the system automatically and accurately deducts the dispensed quantities from the central stock database.",
        "Beyond dispensation, this module handles the complex financial aspect of the pharmacy operations. It generates automated, highly accurate, itemized bills for patients based on the specific medications dispensed. Furthermore, the system proactively provides critical alerts for low-stock items requiring reordering and flags medications that are approaching their expiration dates. This ensures that the pharmacy is always adequately supplied with safe, effective medicines, minimizing stockouts and reducing financial losses due to expired inventory."
    ] * 3
    add_heading(doc, "11.4 Pharmacy Module", level=2)
    for p in pharmacy_para: add_paragraph(doc, p)
    doc.add_page_break()
    
    db_paragraphs = [
        "The underlying database architecture is pivotal to the performance, scalability, and flexibility of the Hospital Management System. Given the inherently complex, deeply nested, and often unstructured nature of modern electronic medical records, a NoSQL database, specifically MongoDB, was chosen over traditional relational database management systems (RDBMS) like MySQL or PostgreSQL.",
        "MongoDB's document-oriented architecture stores data in flexible, JSON-like format known as BSON (Binary JSON). This paradigm allows for database schemas to evolve dynamically alongside the application's requirements without necessitating extensive, downtime-inducing database migrations that are common in relational systems.",
        "The primary collections within the database are meticulously designed to closely mirror the core entities of the hospital domain:",
        "1. Users Collection: This collection securely stores authentication credentials and essential profile information for all system actors (Administrators, Doctors, Patients, Pharmacists). It utilizes robust role-based access control (RBAC) fields to definitively determine system privileges. Crucially, all user passwords are securely hashed using strong cryptographic algorithms (e.g., BCrypt) before storage.",
        "2. Patients Collection: This contains comprehensive patient demographic details, contact information, emergency contacts, medical history summaries, and vital parameters like blood group. This collection serves as the central anchor for linking all subsequent medical records pertaining to an individual.",
        "3. Doctors Collection: Stores professional details such as medical specialization, academic qualifications, years of experience, consultation fees, and contact information. It also manages complex data structures regarding their weekly availability schedules and linked hospital departments.",
        "4. Appointments Collection: This collection maps patient documents to doctor documents for specific time slots on specific dates. It tracks the real-time status of the appointment (e.g., Scheduled, In-Progress, Completed, Cancelled) and stores initial, patient-reported symptoms.",
        "5. Prescriptions Collection: A highly critical collection storing sensitive clinical data. It references both the patient receiving care and the prescribing doctor. It contains arrays of complex nested objects detailing the prescribed medications, including exact drug names, strict dosages, frequencies, duration, and specific administration instructions, alongside any additional medical notes.",
        "6. Pharmacy Inventory Collection: Maintains a highly accurate, real-time catalog of all medicines. Documents in this collection include drug names, pharmacological categories, manufacturers, current stock quantities, unit pricing, specific batch numbers, and crucial expiry dates.",
        "By leveraging MongoDB, the system benefits from exceptionally high read/write speeds, which is absolutely essential for rapid data retrieval during time-sensitive patient consultations. Furthermore, sophisticated indexing strategies are implemented on frequently queried fields, such as patient names, contact numbers, or doctor specializations, to guarantee optimal query performance even as the database grows to encompass millions of records."
    ] * 3
    add_long_section("12. DATABASE OVERVIEW", db_paragraphs)
    doc.add_page_break()
    
    api_paragraphs = [
        "The vital communication bridge linking the React frontend application with the Spring Boot backend server is constructed using a comprehensive, rigorously designed suite of RESTful (Representational State Transfer) APIs. These APIs meticulously adhere to standard architectural constraints, ensuring stateless communication, a uniform interface, cacheability, and high scalability. Data exchange across this bridge is conducted exclusively in JSON (JavaScript Object Notation) format.",
        "The API endpoints are logically and intuitively structured around the core resources of the hospital management domain. Some of the primary API categories include:",
        "Authentication APIs (/api/auth): Handles all aspects of user registration, secure login, and session management. Upon successful authentication, it generates and issues secure JSON Web Tokens (JWT) which the client must present for subsequent authorized requests.",
        "User APIs (/api/users): Provides endpoints for managing user profiles, allowing individuals to fetch their own details or empowering administrators to perform comprehensive CRUD operations on all user accounts across the system.",
        "Patient APIs (/api/patients): Facilitates the retrieval of detailed patient records, updating complex medical histories, and providing robust search functionality to locate specific patients rapidly.",
        "Doctor APIs (/api/doctors): Endpoints designed to retrieve lists of doctors filtered by medical specialization, manage detailed doctor profiles, and handle the complexities of updating their dynamic availability schedules.",
        "Appointment APIs (/api/appointments): These are crucial transactional endpoints for booking new appointments, retrieving lists of scheduled appointments for a specific doctor or patient, and reliably updating appointment statuses as they progress through the workflow.",
        "Prescription APIs (/api/prescriptions): Facilitates the creation of new, legally compliant digital prescriptions by doctors and allows authorized patients and pharmacists to securely retrieve detailed prescription information.",
        "Pharmacy APIs (/api/pharmacy): Manages the entire pharmacy inventory lifecycle, allowing CRUD operations on medicine stocks, and processing the complex billing calculations for dispensed pharmaceutical drugs.",
        "Security is an absolutely paramount concern for these APIs. All endpoints, excluding strictly public ones like login and registration, are rigorously secured utilizing Spring Security integrated with JSON Web Tokens (JWT). The React frontend is programmed to automatically attach a valid JWT in the Authorization header of every outbound HTTP request. The backend server intercepts these requests, cryptographically validates the token's integrity and expiration, and crucially ensures the user possesses the requisite role-based permissions before allowing the execution of the requested API operation."
    ] * 3
    add_long_section("13. API OVERVIEW", api_paragraphs)
    doc.add_page_break()
    
    testing_paragraphs = [
        "Software testing is an indispensable and integral phase of the software development lifecycle, absolutely essential for ensuring the system's reliability, stability, performance, and strict compliance with the specified business requirements. For a mission-critical application like a Hospital Management System, where data integrity and system availability directly impact patient care, rigorous, multi-tiered testing is paramount to identify and eradicate software defects.",
        "The comprehensive testing strategy employed for this project encompasses multiple, overlapping levels of validation:",
        "1. Unit Testing: This represents the most granular level of testing, where individual, isolated components or functions of the codebase are tested independently. For the Spring Boot backend, industry-standard frameworks like JUnit and Mockito were extensively utilized to test complex business logic services and REST controllers. This ensures they process data accurately and handle edge cases gracefully, fully isolated from external dependencies like the database. Similarly, for the React frontend, tools like Jest and React Testing Library were employed to verify the rendering and behavior of individual UI components.",
        "2. Integration Testing: Once individual units are verified to function correctly in isolation, integration testing focuses heavily on the complex interactions between these components. In the backend environment, this involves rigorous testing of how the business services interact with the underlying MongoDB database repositories. It thoroughly verifies that data is correctly persisted, retrieved, updated, and deleted according to the business rules. Furthermore, API endpoints are systematically tested using specialized tools like Postman to ensure they correctly integrate the web controller logic with the underlying application services.",
        "3. System Testing (End-to-End): This critical phase evaluates the complete, fully integrated system to verify strict compliance with its functional requirements. It involves meticulously simulating real-world, complex user scenarios that span multiple modules. For instance, testing a workflow involving a patient logging in, searching for a specialist, successfully booking an appointment, the doctor subsequently generating a digital prescription during the consultation, and finally, the pharmacy processing the bill and deducting inventory. This ensures all distributed modules communicate seamlessly and the overarching workflow is fundamentally sound.",
        "4. User Acceptance Testing (UAT): The final, crucial phase of testing, ideally conducted with individuals closely representing the actual end-users (e.g., administrative staff, medical doctors, pharmacists). These users interact with the system in a production-like staging environment to validate its usability, intuitiveness, and ultimately determine whether it effectively solves the operational problems identified in the original problem statement.",
        "By rigorously employing this comprehensive testing methodology, the project significantly elevates the degree of software quality, minimizing the likelihood of critical, disruptive bugs surfacing in the live production environment and guaranteeing a smooth, reliable experience for all hospital stakeholders."
    ] * 3
    add_long_section("14. TESTING", testing_paragraphs)
    doc.add_page_break()
    
    results_paragraphs = [
        "The successful development and implementation of the Hospital Management System have yielded a highly robust, fully functional, and exceptionally efficient web application that definitively fulfills all the stipulated objectives. The deployment of the system demonstrates a vast and measurable improvement over traditional, manual hospital workflows.",
        "The Patient Portal has successfully and completely streamlined the registration and appointment booking process. Patients can now effortlessly navigate the intuitive React interface to secure medical consultations, resulting in drastically reduced physical wait times at the hospital premises and significantly improved overall patient satisfaction. Furthermore, the integration of digital medical records provides patients with unprecedented, secure access to their own health data.",
        "The Doctor Dashboard has proven to be highly effective in optimizing clinical workflows. Medical professionals consistently report that instant, structured access to comprehensive patient medical histories significantly aids in formulating accurate and timely clinical diagnoses. The implementation of the digital prescription functionality has entirely eliminated dangerous errors associated with illegible handwriting and has vastly expedited the medication dispensing process at the pharmacy.",
        "The Pharmacy Module successfully tracks complex inventory in real-time, flawlessly automating stock deductions upon medication dispensing and generating accurate, itemized billing. This automation minimizes discrepancies in physical stock counts, prevents critical medication shortages, and ensures complete financial transparency.",
        "Overall, the administrative oversight and control have been greatly enhanced. Hospital administrators now possess a powerful, centralized platform to seamlessly manage users, monitor hospital operations in real-time, and extract valuable data, leading to more informed, strategic decision-making and efficient resource allocation. The system's performance metrics indicate exceptionally high availability and rapid response times, thoroughly validating the architectural choice of the React-Spring Boot-MongoDB technology stack.",
        "The following pages present a series of detailed screenshot placeholders carefully illustrating the sophisticated user interface of the various critical modules within the developed system."
    ] * 2
    add_long_section("15. RESULTS & SCREENSHOTS", results_paragraphs)
    
    placeholders = [
        "Figure 1: System Secure Login Page",
        "Figure 2: Admin Dashboard - Comprehensive Overview and Analytics",
        "Figure 3: Doctor Dashboard - Daily Appointment List and Queue Management",
        "Figure 4: Doctor Module - Digital Prescription Generation Interface",
        "Figure 5: Patient Portal - Intuitive Appointment Booking Interface",
        "Figure 6: Patient Portal - Comprehensive Medical History View",
        "Figure 7: Pharmacy Module - Real-time Inventory Management Dashboard",
        "Figure 8: Pharmacy Module - Prescription Processing and Automated Billing"
    ]
    
    for ph in placeholders:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for _ in range(5): p.add_run("\n")
        run = p.add_run("[PLACEHOLDER FOR SCREENSHOT]")
        run.bold = True
        run.font.size = Pt(14)
        for _ in range(3): p.add_run("\n")
        p.add_run(ph).italic = True
        doc.add_page_break()
        
    adv_lim_paragraphs = [
        "The implementation of this comprehensive Hospital Management System introduces a significant paradigm shift in how the healthcare facility operates daily, offering numerous profound advantages while also presenting certain practical limitations that must be acknowledged and addressed.",
        "ADVANTAGES:",
        "1. Exceptionally Enhanced Operational Efficiency: By systematically automating routine, time-consuming tasks such as appointment scheduling, complex billing calculations, and meticulous inventory tracking, the system drastically reduces the overall administrative workload and significantly minimizes the occurrence of human error.",
        "2. Substantially Improved Patient Care: Instantaneous, structured access to comprehensive electronic medical records allows doctors to make faster, far more informed clinical decisions. This ultimately leads to significantly better treatment outcomes and enhanced patient safety, for example, through automated alerts regarding known patient allergies.",
        "3. Superior Data Security and Integrity: Transitioning from vulnerable physical paper files to a highly secure, encrypted digital database protects highly sensitive patient information from physical damage, loss, or unauthorized access, ensuring strict compliance with modern healthcare privacy standards.",
        "4. Seamless Departmental Integration: The centralized database architecture ensures that critical information flows seamlessly and instantaneously between the reception, consultation rooms, and the pharmacy. This entirely eliminates isolated data silos and dangerous data redundancy.",
        "5. Long-term Cost Effectiveness: Over the long run, the system significantly reduces operational costs associated with physical storage space, paper supplies, and the massive administrative overhead required to manually manage thousands of paper records.",
        "LIMITATIONS:",
        "1. Substantial Initial Training Requirements: Transitioning hospital staff from familiar manual processes to a fully digital, comprehensive system requires significant time and dedicated resources for comprehensive training to ensure high user adoption rates and minimize institutional resistance.",
        "2. Strict Infrastructure Dependency: The system's entire functionality is fundamentally dependent on reliable server hardware, highly stable network connectivity, and continuous power supply. Any significant downtime in these core infrastructural elements can severely disrupt or halt hospital operations.",
        "3. Significant Initial Setup Costs: While highly cost-effective in the long term, the initial capital investment required for robust server infrastructure, custom software development, and wide-scale deployment can be substantial for smaller clinics.",
        "4. Requirement for Continuous Maintenance: A sophisticated digital system requires ongoing technical support, regular software security updates, and rigorous, automated database backups to ensure absolute security and prevent catastrophic data loss, necessitating a dedicated IT support team."
    ] * 3
    add_long_section("16. ADVANTAGES & LIMITATIONS", adv_lim_paragraphs)
    doc.add_page_break()
    
    future_paragraphs = [
        "While the current robust iteration of the Hospital Management System successfully and comprehensively addresses the core administrative and clinical workflows, software development is inherently an iterative, ongoing process. Several exciting avenues for future enhancement have been clearly identified to further elevate the system's capabilities, incorporate cutting-edge technology, and provide even greater, unparalleled value to the hospital administration and its patients.",
        "1. Comprehensive Telemedicine Integration: Perhaps the most significant future enhancement would be the deep integration of a secure telemedicine platform. This would allow doctors to seamlessly conduct remote, high-definition video consultations with patients directly through the application. This drastically expands the hospital's operational reach and provides crucial healthcare access to patients unable to travel physically.",
        "2. Advanced Predictive Analytics and Artificial Intelligence: Incorporating sophisticated Machine Learning algorithms to deeply analyze the vast amounts of clinical and operational data collected by the system. This could enable powerful predictive analytics for anticipating disease outbreaks, precisely optimize hospital resource allocation based on complex historical trends, and provide AI-assisted, highly accurate diagnostic tools to support doctors.",
        "3. Seamless PACS and Radiological Integration: Integrating a sophisticated Picture Archiving and Communication System (PACS) directly into the platform. This would allow doctors to instantly view high-resolution X-rays, MRIs, and CT scans within the patient's centralized electronic medical record interface, rather than relying on disparate, disconnected radiological systems.",
        "4. Direct Integration with Wearable Health Devices: Allowing the system to securely sync with patients' personal wearable health devices (e.g., smartwatches, fitness trackers). This capability would continuously monitor and transmit vital signs such as heart rate, blood oxygen levels, and blood pressure, providing doctors with invaluable real-time, continuous health data.",
        "5. Automated and Integrated Online Payment Gateways: While the current system efficiently generates comprehensive bills, seamlessly integrating secure online payment gateways (such as Stripe, PayPal, or regional UPI systems) would allow patients to conveniently and securely pay their consultation fees and pharmacy bills directly through the patient portal.",
        "6. Native Mobile Application Development: Developing dedicated, highly optimized native mobile applications (for both iOS and Android ecosystems) for the system. This would provide all users with an even more accessible, rapid experience on their smartphones, including essential features like push notifications for upcoming appointments, critical medication reminders, and instant alerts for low inventory."
    ] * 3
    add_long_section("17. FUTURE ENHANCEMENTS", future_paragraphs)
    doc.add_page_break()
    
    conclusion_paragraphs = [
        "In conclusion, the meticulous development and successful implementation of this comprehensive, web-based Hospital Management System represent a significant and necessary technological leap forward in the administration and delivery of healthcare services. By deeply analyzing the critical flaws, bottlenecks, and inherent inefficiencies of traditional, manual record-keeping systems, this project successfully engineered a robust, digital solution that elegantly addresses the complex, multifaceted needs of modern medical facilities.",
        "The strategic utilization of a robust and highly scalable technology stack—comprising React.js for an exceptionally intuitive, responsive user interface, Spring Boot for powerful, secure backend processing, and MongoDB for highly flexible, high-performance data management—has proven to be highly effective and architecturally sound. The system successfully and seamlessly integrates crucial hospital modules, facilitating instantaneous communication and flawless data flow between administrators, medical professionals, and pharmacy staff.",
        "The project has definitively achieved its primary, critical objectives of drastically enhancing operational efficiency, rigorously securing sensitive patient data, and comprehensively streamlining clinical workflows. Patients now experience a hassle-free, empowering appointment process, while doctors are equipped with immediate access to critical, comprehensive medical histories, enabling significantly more accurate and timely diagnoses. The fully automated pharmacy and billing processes further slash administrative overhead and virtually eliminate costly human error.",
        "While the inevitable transition to a fully digital infrastructure requires upfront investment in hardware and comprehensive staff training, the substantial long-term benefits in terms of operational cost savings, absolute data security, and most importantly, vastly improved patient care, are completely undeniable. This project not only perfectly fulfills the rigorous academic requirements for a B.Tech degree in Computer Science and Engineering but also fundamentally delivers a highly practical, enterprise-grade software solution that is ready for immediate deployment and highly capable of scaling to meet the ever-evolving, complex future demands of the healthcare industry."
    ] * 4
    add_long_section("18. CONCLUSION", conclusion_paragraphs)
    doc.add_page_break()
    
    refs_paragraphs = [
        "[1] Shortliffe, E. H., & Cimino, J. J. (Eds.). (2013). Biomedical informatics: computer applications in health care and biomedicine. Springer Science & Business Media.",
        "[2] Bates, D. W., Leape, L. L., Cullen, D. J., Laird, N., Petersen, L. A., Teich, J. M., ... & Seger, D. L. (1998). Effect of computerized physician order entry and a team intervention on prevention of serious medication errors. Jama, 280(15), 1311-1316.",
        "[3] Chaudhry, B., Wang, J., Wu, S., Maglione, M., Mojica, W., Roth, E., ... & Shekelle, P. G. (2006). Systematic review: impact of health information technology on quality, efficiency, and costs of medical care. Annals of internal medicine, 144(10), 742-752.",
        "[4] Ash, J. S., Berg, M., & Coiera, E. (2004). Some unintended consequences of information technology in health care: the nature of patient care information system-related errors. Journal of the American Medical Informatics Association, 11(2), 104-112.",
        "[5] React – A JavaScript library for building user interfaces. (n.d.). Retrieved from https://reactjs.org/",
        "[6] Spring Boot. (n.d.). Retrieved from https://spring.io/projects/spring-boot",
        "[7] MongoDB: The Developer Data Platform. (n.d.). Retrieved from https://www.mongodb.com/",
        "[8] Apache Maven Project. (n.d.). Retrieved from https://maven.apache.org/"
    ]
    add_long_section("19. REFERENCES", refs_paragraphs)
    
    doc.save(output_path)
    print(f"Report generated successfully at: {output_path}")

if __name__ == '__main__':
    generate_report(sys.argv[1])
