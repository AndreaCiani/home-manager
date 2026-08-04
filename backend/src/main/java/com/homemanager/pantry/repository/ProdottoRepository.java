package com.homemanager.pantry.repository;

import com.homemanager.pantry.model.Prodotto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Accesso ai prodotti della dispensa. Spring genera l'implementazione.
 */
public interface ProdottoRepository extends JpaRepository<Prodotto, Long> {

    /** Prodotti che scadono entro una certa data, ordinati per scadenza. */
    List<Prodotto> findByDataScadenzaLessThanEqualOrderByDataScadenzaAsc(LocalDate limite);
}
