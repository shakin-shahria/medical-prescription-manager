package com.example.prescription.repository;

import com.example.prescription.model.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Page<Prescription> findAllByPrescriptionDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<Prescription> findAllByPrescriptionDateAfter(LocalDate startDate, Pageable pageable);
    Page<Prescription> findAllByPrescriptionDateBefore(LocalDate endDate, Pageable pageable);
}