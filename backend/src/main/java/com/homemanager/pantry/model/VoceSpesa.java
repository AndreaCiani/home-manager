package com.homemanager.pantry.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Una voce della lista della spesa condivisa.
 * Modulo 1 — Spesa & Dispensa.
 */
@Entity
@Table(name = "voce_spesa")
public class VoceSpesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    private BigDecimal quantita;

    /** true = già presa/comprata. */
    @Column(nullable = false)
    private boolean presa = false;

    /** Chi l'ha aggiunta (provvisorio, in attesa del modulo Utenti & Famiglia). */
    private String aggiuntoDa;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // --- Getter / Setter ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public BigDecimal getQuantita() { return quantita; }
    public void setQuantita(BigDecimal quantita) { this.quantita = quantita; }

    public boolean isPresa() { return presa; }
    public void setPresa(boolean presa) { this.presa = presa; }

    public String getAggiuntoDa() { return aggiuntoDa; }
    public void setAggiuntoDa(String aggiuntoDa) { this.aggiuntoDa = aggiuntoDa; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
