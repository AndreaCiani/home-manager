package com.homemanager.family.controller;

import com.homemanager.family.dto.AuthDtos.FamilyResponse;
import com.homemanager.family.dto.AuthDtos.MemberResponse;
import com.homemanager.family.model.Family;
import com.homemanager.family.model.Role;
import com.homemanager.family.model.User;
import com.homemanager.family.repository.FamilyRepository;
import com.homemanager.family.repository.UserRepository;
import com.homemanager.family.security.CurrentUserService;
import com.homemanager.family.security.InviteCodeGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * The current user's family: members and (for admins) the invite code.
 * Module 2 — Users & Family.
 */
@RestController
@RequestMapping("/api/family")
public class FamilyController {

    private final UserRepository users;
    private final FamilyRepository families;
    private final CurrentUserService currentUser;
    private final InviteCodeGenerator inviteCodes;

    public FamilyController(UserRepository users, FamilyRepository families,
                            CurrentUserService currentUser, InviteCodeGenerator inviteCodes) {
        this.users = users;
        this.families = families;
        this.currentUser = currentUser;
        this.inviteCodes = inviteCodes;
    }

    @GetMapping
    public FamilyResponse get() {
        return toFamilyResponse(currentUser.require());
    }

    /** Admins can rotate the invite code (e.g. to revoke old invitations). */
    @PostMapping("/invite-code/regenerate")
    public FamilyResponse regenerateInviteCode() {
        User me = currentUser.require();
        if (me.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can regenerate the invite code");
        }
        Family family = me.getFamily();
        family.setInviteCode(inviteCodes.unique());
        families.save(family);
        return toFamilyResponse(me);
    }

    private FamilyResponse toFamilyResponse(User me) {
        Family family = me.getFamily();
        List<MemberResponse> members = users.findByFamilyIdOrderByCreatedAtAsc(family.getId()).stream()
                .map(u -> new MemberResponse(u.getId(), u.getDisplayName(), u.getEmail(), u.getRole().name()))
                .toList();
        String inviteCode = me.getRole() == Role.ADMIN ? family.getInviteCode() : null;
        return new FamilyResponse(family.getId(), family.getName(), inviteCode, members);
    }
}
