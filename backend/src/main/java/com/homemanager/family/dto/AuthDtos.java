package com.homemanager.family.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Request/response payloads for authentication and family endpoints.
 */
public final class AuthDtos {

    private AuthDtos() {}

    public record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password,
            @NotBlank String displayName,
            /** Required when joining an existing family; ignored for the first (bootstrap) account. */
            String inviteCode,
            /** Optional name for the household created by the first account. */
            String familyName) {}

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String newPassword) {}

    public record RoleUpdateRequest(@NotBlank String role) {}

    public record UserResponse(
            Long id,
            String email,
            String displayName,
            String role,
            Long familyId,
            String familyName) {}

    public record MemberResponse(Long id, String displayName, String email, String role) {}

    /** inviteCode is populated only for admins. */
    public record FamilyResponse(Long id, String name, String inviteCode, List<MemberResponse> members) {}
}
