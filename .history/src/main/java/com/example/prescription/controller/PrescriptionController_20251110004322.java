package com.example.prescription.controller;

import com.example.prescription.model.Prescription;
import com.example.prescription.repository.PrescriptionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/prescriptions")
@Tag(name = "Prescription Management", description = "APIs for managing prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionRepository repository;

    @GetMapping
    @Operation(summary = "Get all prescriptions", description = "Retrieve a paginated list of prescriptions with optional date filtering")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved prescriptions"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required")
    })
    public Page<Prescription> getAll(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Start date for filtering (YYYY-MM-DD)") @RequestParam(required = false) LocalDate startDate,
            @Parameter(description = "End date for filtering (YYYY-MM-DD)") @RequestParam(required = false) LocalDate endDate) {

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
    @Operation(summary = "Get prescription by ID", description = "Retrieve a specific prescription by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved prescription"),
        @ApiResponse(responseCode = "404", description = "Prescription not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required")
    })
    public ResponseEntity<Prescription> getById(
            @Parameter(description = "Prescription ID") @PathVariable Long id) {
        Optional<Prescription> prescription = repository.findById(id);
        return prescription.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create new prescription", description = "Create a new prescription record")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Prescription created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required")
    })
    public Prescription create(@RequestBody Prescription prescription) {
        return repository.save(prescription);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update prescription", description = "Update an existing prescription by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Prescription updated successfully"),
        @ApiResponse(responseCode = "404", description = "Prescription not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required")
    })
    public ResponseEntity<Prescription> update(
            @Parameter(description = "Prescription ID") @PathVariable Long id,
            @RequestBody Prescription prescriptionDetails) {
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
    @Operation(summary = "Delete prescription", description = "Delete a prescription by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Prescription deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Prescription not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "Prescription ID") @PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}