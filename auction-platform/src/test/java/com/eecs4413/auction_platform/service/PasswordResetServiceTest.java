package com.eecs4413.auction_platform.service;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.argThat;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.eecs4413.auction_platform.model.AuthPasswordReset;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.repository.AuthPasswordResetRepository;
import com.eecs4413.auction_platform.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class PasswordResetServiceTest {

    private static final String BASE64_SECRET = Base64.getEncoder().encodeToString("reset-secret-key".getBytes(StandardCharsets.UTF_8));

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthPasswordResetRepository authPasswordResetRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserService userService;

    private Clock clock;

    @InjectMocks
    private PasswordResetService passwordResetService;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        clock = Clock.fixed(Instant.parse("2025-01-01T12:00:00Z"), ZoneOffset.UTC);
        passwordResetService = new PasswordResetService(userRepository, authPasswordResetRepository, passwordEncoder, clock, userService);
        ReflectionTestUtils.setField(passwordResetService, "secret", BASE64_SECRET);
    }

    @Test
    void requestForgotPasswordPersistsResetRecord() {
        User user = User.builder().userId(15L).email("reset@example.com").build();
        when(userRepository.findByEmail(user.getEmail())).thenReturn(user);

        passwordResetService.requestForgotPassword(user.getEmail());

        verify(authPasswordResetRepository).save(argThat(reset ->
                reset.getUserId().equals(user.getUserId()) &&
                        reset.getStatus().equals("ACTIVE") &&
                        reset.getExpiresAt().isAfter(Instant.now(clock))));
    }

    @Test
    void resetPasswordUpdatesUserPasswordAndTerminatesToken() {
        UUID id = UUID.randomUUID();
        String code = "ABCD12";
        Instant now = Instant.now(clock);

        AuthPasswordReset activeReset = AuthPasswordReset.builder()
                .id(id)
                .userId(15L)
                .codeHash(hmacSha256Hex(BASE64_SECRET, code))
                .expiresAt(now.plusSeconds(900))
                .createdAt(now.minusSeconds(60))
                .status("ACTIVE")
                .attempts((short) 0)
                .maxAttempts((short) 5)
                .build();

        when(authPasswordResetRepository.findActive(id, now)).thenReturn(Optional.of(activeReset));

        User user = User.builder().userId(15L).passwordHash("old").build();
        when(userRepository.findById(15L)).thenReturn(Optional.of(user));
        doNothing().when(userService).validatePassword("NewPassword1");
        when(passwordEncoder.encode("NewPassword1")).thenReturn("encoded-new");

        passwordResetService.resetPassword(id.toString(), code, "NewPassword1");

        assertThat(user.getPasswordHash()).isEqualTo("encoded-new");
        assertThat(activeReset.getStatus()).isEqualTo("USED");
        assertThat(activeReset.getUsedAt()).isEqualTo(now);

        verify(userRepository).save(user);
        verify(authPasswordResetRepository).save(activeReset);
        verify(userService).revokeAllForUser(15L);
    }

    private static String hmacSha256Hex(String base64Secret, String code) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(Base64.getDecoder().decode(base64Secret), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(code.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Unable to compute HMAC", e);
        }
    }
}
