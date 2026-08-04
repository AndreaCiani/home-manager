package com.homemanager.pantry.controller;

import com.homemanager.pantry.model.VoceSpesa;
import com.homemanager.pantry.repository.VoceSpesaRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API della lista della spesa condivisa.
 */
@RestController
@RequestMapping("/api/spesa")
public class VoceSpesaController {

    private final VoceSpesaRepository repository;

    public VoceSpesaController(VoceSpesaRepository repository) {
        this.repository = repository;
    }

    /** Elenco della lista (prima le voci da prendere). */
    @GetMapping
    public List<VoceSpesa> elenco() {
        return repository.findAllByOrderByPresaAscCreatedAtAsc();
    }

    /** Aggiunge una voce alla lista. */
    @PostMapping
    public VoceSpesa aggiungi(@Valid @RequestBody VoceSpesa voce) {
        voce.setId(null);
        return repository.save(voce);
    }

    /** Modifica una voce (es. spuntare "presa"). */
    @PutMapping("/{id}")
    public ResponseEntity<VoceSpesa> modifica(@PathVariable Long id,
                                              @Valid @RequestBody VoceSpesa dati) {
        return repository.findById(id)
                .map(v -> {
                    v.setNome(dati.getNome());
                    v.setQuantita(dati.getQuantita());
                    v.setPresa(dati.isPresa());
                    v.setAggiuntoDa(dati.getAggiuntoDa());
                    return ResponseEntity.ok(repository.save(v));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Rimuove una voce dalla lista. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> rimuovi(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
