package com.example.prescription.controller;

import com.example.prescription.model.Prescription;
import com.example.prescription.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionRepository repository;

    @GetMapping
    public Page<Prescription> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        
        Pageable pageable = PageRequest.of(page, size);
        
        if (startDate != null && endDate != null) {
            return repository.findAllByPrescriptionDateBetween(startDate, endDate, pageable);
        } else if (startDate != null) {
            return repository.findAllByPrescriptionDateAfter(startDate, pageable);
        } else if (endDate != null) {
            return repository.findAllByPrescriptionDateBefore(endDate, pageable);
        } else {
            return repository.findAll(pageable);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getById(@PathVariable Long id) {
        Optional<Prescription> prescription = repository.findById(id);
        return prescription.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Prescription create(@RequestBody Prescription prescription) {
        return repository.save(prescription);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prescription> update(@PathVariable Long id, @RequestBody Prescription prescriptionDetails) {
        Optional<Prescription> optionalPrescription = repository.findById(id);
        if (optionalPrescription.isPresent()) {
            Prescription prescription = optionalPrescription.get();
            prescription.setPrescriptionDate(prescriptionDetails.getPrescriptionDate());
            prescription.setPatientName(prescriptionDetails.getPatientName());
            prescription.setPatientAge(prescriptionDetails.getPatientAge());
            prescription.setPatientGender(prescriptionDetails.getPatientGender());
            prescription.setDiagnosis(prescriptionDetails.getDiagnosis());
            prescription.setMedicines(prescriptionDetails.getMedicines());
            prescription.setNextVisitDate(prescriptionDetails.getNextVisitDate());
            return ResponseEntity.ok(repository.save(prescription));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}