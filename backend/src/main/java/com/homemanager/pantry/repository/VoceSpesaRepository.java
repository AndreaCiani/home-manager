package com.homemanager.pantry.repository;

import com.homemanager.pantry.model.VoceSpesa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Accesso alle voci della lista della spesa. Spring genera l'implementazione.
 */
public interface VoceSpesaRepository extends JpaRepository<VoceSpesa, Long> {

    /** Voci ordinate: prima quelle da prendere, poi per data di inserimento. */
    List<VoceSpesa> findAllByOrderByPresaAscCreatedAtAsc();
}
