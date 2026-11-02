package com.careerguidance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Please enter your full name.")
    private String fullName;

    @NotBlank(message = "Please enter your email address.")
    @Email(message = "Please provide a valid email address.")
    private String email;

    @NotBlank(message = "Please enter your password.")
    @Size(min = 6, message = "Password must be at least 6 characters long.")
    private String password;

    private String phone;
    private String education;
    private String college;
    private String degree;
    private Integer graduationYear;

    public RegisterRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
}
