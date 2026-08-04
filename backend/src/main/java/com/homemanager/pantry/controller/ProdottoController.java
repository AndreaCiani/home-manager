package com.homemanager.pantry.controller;

import com.homemanager.pantry.model.Prodotto;
import com.homemanager.pantry.repository.ProdottoRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * API della dispensa: elenco prodotti, aggiunta, modifica, rimozione,
 * e la vista "in scadenza".
 */
@RestController
@RequestMapping("/api/prodotti")
public class ProdottoController {

    private final ProdottoRepository repository;

    public ProdottoController(ProdottoRepository repository) {
        this.repository = repository;
    }

    /** Elenco completo della dispensa. */
    @GetMapping
    public List<Prodotto> elenco() {
        return repository.findAll();
    }

    /** Prodotti in scadenza entro N giorni (default 7). */
    @GetMapping("/in-scadenza")
    public List<Prodotto> inScadenza(@RequestParam(defaultValue = "7") int giorni) {
        return repository.findByDataScadenzaLessThanEqualOrderByDataScadenzaAsc(
                LocalDate.now().plusDays(giorni));
    }

    /** Aggiunge un prodotto. */
    @PostMapping
    public Prodotto aggiungi(@Valid @RequestBody Prodotto prodotto) {
        prodotto.setId(null);
        return repository.save(prodotto);
    }

    /** Modifica un prodotto esistente. */
    @PutMapping("/{id}")
    public ResponseEntity<Prodotto> modifica(@PathVariable Long id,
                                             @Valid @RequestBody Prodotto dati) {
        return repository.findById(id)
                .map(p -> {
                    p.setNome(dati.getNome());
                    p.setQuantita(dati.getQuantita());
                    p.setUnita(dati.getUnita());
                    p.setCategoria(dati.getCategoria());
                    p.setDataScadenza(dati.getDataScadenza());
                    return ResponseEntity.ok(repository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Rimuove un prodotto. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> rimuovi(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
