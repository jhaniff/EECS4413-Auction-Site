package com.eecs4413.auth.service;

import com.eecs4413.auth.exception.UserCredentialsException;
import com.eecs4413.auth.model.AuthPasswordReset;
import com.eecs4413.auth.model.User;
import com.eecs4413.auth.repository.AuthPasswordResetRepository;
import com.eecs4413.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final Duration TTL = Duration.ofMinutes(15);
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_USED   = "USED";
    private static final String STATUS_REVOKED = "REVOKED";

    private final UserRepository userRepository;
    private final AuthPasswordResetRepository authPasswordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;
    private final UserService userService;
    private final EmailService emailService;
    @Value("${application.security.forgot-password.secret}")
    private String secret;

    @Transactional
    public void requestForgotPassword(String emailAddress) {
        try {
            User user = userRepository.findByEmail(emailAddress).orElseThrow(()->new UserCredentialsException("User not found"));

            var now  = Instant.now(clock);
            var id   = UUID.randomUUID();
            var code = generateCode6();

            emailService.sendResetEmail(emailAddress, code, id);

            var authPasswordReset = AuthPasswordReset.builder()
                    .id(id)
                    .userId(user.getUserId())
                    .codeHash(hashCode(code))
                    .expiresAt(now.plus(TTL))
                    .createdAt(now)
                    .status(STATUS_ACTIVE)
                    .attempts((short) 0)
                    .maxAttempts((short) 5)
                    .build();

            authPasswordResetRepository.save(authPasswordReset);
        } catch (Exception ignored) {
            // Ignore to not let user know if its a valid email or not.
        }
    }


    @Transactional
    public void resetPassword(String uuid, String code, String newPassword) {
        UUID id = parseUuid(uuid);
        var now = Instant.now(clock);

        var row = authPasswordResetRepository.findActive(id, now)
                .orElseThrow(() -> new UserCredentialsException("Invalid or expired token"));

        // Attempt number guard
        if (row.getAttempts() >= row.getMaxAttempts()) {
            row.setStatus(STATUS_REVOKED);
            authPasswordResetRepository.save(row);
            throw new UserCredentialsException("Too many attempts");
        }

        if (!row.getCodeHash().equals(hashCode(code))) {
            row.setAttempts((short) (row.getAttempts() + 1));
            authPasswordResetRepository.save(row);
            throw new UserCredentialsException("Invalid code");
        }

        // Update user password
        var user = userRepository.findById(row.getUserId()).orElseThrow();
        userService.validatePassword(newPassword);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Can no longer use this code
        row.setUsedAt(now);
        row.setStatus(STATUS_USED);
        authPasswordResetRepository.save(row);

        // get rid of all previous tokens from user now that password has changed
        userService.revokeAllForUser(user.getUserId());
    }

    private static String generateCode6() {
        final String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var r = new SecureRandom();
        var sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) sb.append(alphabet.charAt(r.nextInt(alphabet.length())));
        return sb.toString();
    }

    private static UUID parseUuid(String s) {
        try { return UUID.fromString(s); } catch (Exception e) {
            throw new UserCredentialsException("Invalid uuid");
        }
    }

    private String hashCode(String code) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(Base64.getDecoder().decode(secret), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(code.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            throw new IllegalStateException("Bad reset code secret", e);
        }
    }
}
