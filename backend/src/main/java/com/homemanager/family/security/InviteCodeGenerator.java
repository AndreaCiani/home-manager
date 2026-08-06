package com.homemanager.family.security;

import com.homemanager.family.repository.FamilyRepository;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * Generates short, unambiguous, unique family invite codes.
 */
@Component
public class InviteCodeGenerator {

    /** No ambiguous characters (0/O, 1/I/L). */
    private static final String ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final int LENGTH = 8;

    private final SecureRandom random = new SecureRandom();
    private final FamilyRepository families;

    public InviteCodeGenerator(FamilyRepository families) {
        this.families = families;
    }

    /** A random code that is not currently in use. */
    public String unique() {
        String code;
        do {
            code = random();
        } while (families.existsByInviteCode(code));
        return code;
    }

    private String random() {
        StringBuilder sb = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
