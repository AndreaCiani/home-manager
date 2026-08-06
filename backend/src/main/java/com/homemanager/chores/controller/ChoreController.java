package com.homemanager.chores.controller;

import com.homemanager.chores.model.Chore;
import com.homemanager.chores.model.ChoreRecurrence;
import com.homemanager.chores.repository.ChoreRepository;
import com.homemanager.family.model.User;
import com.homemanager.family.repository.UserRepository;
import com.homemanager.family.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

/**
 * Household Chores API, scoped to the authenticated user's family: list, CRUD,
 * and "mark done" (recurring chores roll forward to their next occurrence).
 */
@RestController
@RequestMapping("/api/chores")
public class ChoreController {

    private final ChoreRepository repository;
    private final UserRepository users;
    private final CurrentUserService currentUser;

    public ChoreController(ChoreRepository repository, UserRepository users, CurrentUserService currentUser) {
        this.repository = repository;
        this.users = users;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<Chore> list() {
        return repository.findByFamilyIdOrderByDoneAscCreatedAtAsc(currentUser.requireFamilyId());
    }

    @PostMapping
    public Chore add(@Valid @RequestBody Chore chore) {
        Long familyId = currentUser.require().getFamily().getId();
        chore.setId(null);
        chore.setFamily(currentUser.require().getFamily());
        applyAssignee(chore, chore.getAssigneeUserId(), familyId);
        return repository.save(chore);
    }

    @PutMapping("/{id}")
    public Chore update(@PathVariable Long id, @Valid @RequestBody Chore data) {
        Chore c = requireOwned(id);
        c.setTitle(data.getTitle());
        c.setDueDate(data.getDueDate());
        c.setRecurrence(data.getRecurrence());
        c.setDone(data.isDone());
        applyAssignee(c, data.getAssigneeUserId(), c.getFamily().getId());
        return repository.save(c);
    }

    /** Marks a chore done; a recurring chore with a due date rolls forward instead. */
    @PostMapping("/{id}/done")
    public Chore markDone(@PathVariable Long id) {
        Chore c = requireOwned(id);
        if (c.getRecurrence() != ChoreRecurrence.NONE && c.getDueDate() != null) {
            c.setDueDate(nextOccurrence(c.getDueDate(), c.getRecurrence()));
            c.setDone(false);
        } else {
            c.setDone(true);
        }
        return repository.save(c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        repository.delete(requireOwned(id));
        return ResponseEntity.noContent().build();
    }

    private void applyAssignee(Chore chore, Long assigneeUserId, Long familyId) {
        if (assigneeUserId == null) {
            chore.setAssigneeUserId(null);
            chore.setAssigneeName(null);
            return;
        }
        User assignee = users.findById(assigneeUserId)
                .filter(u -> u.getFamily().getId().equals(familyId))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Assignee is not a member of your family"));
        chore.setAssigneeUserId(assignee.getId());
        chore.setAssigneeName(assignee.getDisplayName());
    }

    private LocalDate nextOccurrence(LocalDate from, ChoreRecurrence recurrence) {
        return switch (recurrence) {
            case DAILY -> from.plusDays(1);
            case WEEKLY -> from.plusWeeks(1);
            case MONTHLY -> from.plusMonths(1);
            case NONE -> from;
        };
    }

    private Chore requireOwned(Long id) {
        Long familyId = currentUser.requireFamilyId();
        return repository.findById(id)
                .filter(c -> c.getFamily().getId().equals(familyId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
