package com.example.prescription.controller;

import com.example.prescription.model.Prescription;
import com.example.prescription.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionRepository repository;

    @GetMapping
    public List<Prescription> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Prescription create(@RequestBody Prescription prescription) {
        return repository.save(prescription);
    }
}