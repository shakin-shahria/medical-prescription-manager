package com.example.prescription.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "prescriptions")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate prescriptionDate;
    private String patientName;
    private Integer patientAge;
    private String patientGender;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String medicines;

    private LocalDate nextVisitDate;

    // Getters and Setters
    public Long getId(){ return id; }
    public void setId(Long id){ this.id = id; }
    public LocalDate getPrescriptionDate(){ return prescriptionDate; }
    public void setPrescriptionDate(LocalDate prescriptionDate){ this.prescriptionDate = prescriptionDate; }
    public String getPatientName(){ return patientName; }
    public void setPatientName(String patientName){ this.patientName = patientName; }
    public Integer getPatientAge(){ return patientAge; }
    public void setPatientAge(Integer patientAge){ this.patientAge = patientAge; }
    public String getPatientGender(){ return patientGender; }
    public void setPatientGender(String patientGender){ this.patientGender = patientGender; }
    public String getDiagnosis(){ return diagnosis; }
    public void setDiagnosis(String diagnosis){ this.diagnosis = diagnosis; }
    public String getMedicines(){ return medicines; }
    public void setMedicines(String medicines){ this.medicines = medicines; }
    public LocalDate getNextVisitDate(){ return nextVisitDate; }
    public void setNextVisitDate(LocalDate nextVisitDate){ this.nextVisitDate = nextVisitDate; }
}