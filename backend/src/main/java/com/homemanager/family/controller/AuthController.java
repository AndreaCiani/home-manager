package com.homemanager.family.controller;

import com.homemanager.family.dto.AuthDtos.LoginRequest;
import com.homemanager.family.dto.AuthDtos.RegisterRequest;
import com.homemanager.family.dto.AuthDtos.UserResponse;
import com.homemanager.family.model.Family;
import com.homemanager.family.model.Role;
import com.homemanager.family.model.User;
import com.homemanager.family.repository.FamilyRepository;
import com.homemanager.family.repository.UserRepository;
import com.homemanager.family.security.CurrentUserService;
import com.homemanager.family.security.InviteCodeGenerator;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Authentication: invite-based registration, login, logout and "who am I".
 * Module 2 — Users & Family.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final FamilyRepository families;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final InviteCodeGenerator inviteCodes;
    private final CurrentUserService currentUser;
    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthController(UserRepository users, FamilyRepository families, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager, InviteCodeGenerator inviteCodes,
                          CurrentUserService currentUser) {
        this.users = users;
        this.families = families;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.inviteCodes = inviteCodes;
        this.currentUser = currentUser;
    }

    /**
     * Registers a user. The very first account creates the household (as ADMIN);
     * every later account must present a valid family invite code (joins as MEMBER).
     */
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest req,
                                                  HttpServletRequest request, HttpServletResponse response) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email is already registered");
        }

        Family family;
        Role role;
        if (users.count() == 0) {
            family = new Family();
            String name = (req.familyName() == null || req.familyName().isBlank())
                    ? "My Home" : req.familyName().trim();
            family.setName(name);
            family.setInviteCode(inviteCodes.unique());
            family = families.save(family);
            role = Role.ADMIN;
        } else {
            String code = req.inviteCode() == null ? "" : req.inviteCode().trim();
            if (code.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An invite code is required");
            }
            family = families.findByInviteCode(code)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid invite code"));
            role = Role.MEMBER;
        }

        User user = new User();
        user.setEmail(email);
        user.setDisplayName(req.displayName().trim());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole(role);
        user.setFamily(family);
        users.save(user);

        authenticate(email, req.password(), request, response);
        return ResponseEntity.status(HttpStatus.CREATED).body(toUserResponse(user));
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest req,
                              HttpServletRequest request, HttpServletResponse response) {
        String email = req.email().trim().toLowerCase();
        try {
            authenticate(email, req.password(), request, response);
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return toUserResponse(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UserResponse me() {
        return toUserResponse(currentUser.require());
    }

    /** Authenticates and persists the security context into the session. */
    private void authenticate(String email, String password,
                              HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }

    private UserResponse toUserResponse(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getDisplayName(),
                u.getRole().name(), u.getFamily().getId(), u.getFamily().getName());
    }
}
