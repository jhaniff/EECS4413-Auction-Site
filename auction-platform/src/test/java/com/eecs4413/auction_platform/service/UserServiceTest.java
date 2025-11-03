package com.eecs4413.auction_platform.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;

import com.eecs4413.auction_platform.dto.AuthenticationResponseDTO;
import com.eecs4413.auction_platform.dto.RegisterDTO;
import com.eecs4413.auction_platform.dto.SignInDTO;
import com.eecs4413.auction_platform.exception.UserCredentialsException;
import com.eecs4413.auction_platform.model.Token;
import com.eecs4413.auction_platform.model.User;
import com.eecs4413.auction_platform.model.UserAddress;
import com.eecs4413.auction_platform.repository.TokenRepository;
import com.eecs4413.auction_platform.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings({"null", "unused"})
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JWTService jwtService;

    @Mock
    private TokenRepository tokenRepository;

    @InjectMocks
    private UserService userService;

    private UserAddress address;

    @BeforeEach
    void setUp() {
        address = UserAddress.builder()
                .userId(0L)
                .streetName("King St")
                .streetNumber("123")
                .city("Toronto")
                .country("Canada")
                .postalCode("M5V2T6")
                .build();
    }

    @Test
    void registerUserPersistsEntityAndReturnsToken() {
        RegisterDTO registerDTO = RegisterDTO.builder()
                .email("new.user@example.com")
                .password("Password123")
                .confirmPassword("Password123")
                .firstName("New")
                .lastName("User")
                .userAddress(address)
                .build();

        when(jwtService.generateToken(registerDTO.getEmail())).thenReturn("jwt-token");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setUserId(101L);
            return saved;
        });
        when(tokenRepository.save(any(Token.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthenticationResponseDTO response = userService.registerUser(registerDTO);

        assertThat(response.getAccessToken()).isEqualTo("jwt-token");
        verify(userRepository).save(any(User.class));
        verify(tokenRepository).save(any(Token.class));
    }

    @Test
    void registerUserThrowsWhenPasswordsDoNotMatch() {
        RegisterDTO invalid = RegisterDTO.builder()
                .email("mismatch@example.com")
                .password("Password123")
                .confirmPassword("Password321")
                .firstName("Mismatch")
                .lastName("User")
                .userAddress(address)
                .build();

        assertThatThrownBy(() -> userService.registerUser(invalid))
                .isInstanceOf(UserCredentialsException.class)
                .hasMessageContaining("do not match");
    }

    @Test
    void authenticateReturnsTokenForValidCredentials() {
        SignInDTO signInDTO = SignInDTO.builder()
                .email("new.user@example.com")
                .password("Password123")
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);

        User persisted = User.builder()
                .userId(42L)
                .email(signInDTO.getEmail())
                .passwordHash("hashed")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .isActive(true)
                .build();

        when(userRepository.findByEmail(signInDTO.getEmail())).thenReturn(persisted);
        when(jwtService.generateToken(signInDTO.getEmail())).thenReturn("jwt-token");
        when(tokenRepository.save(any(Token.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthenticationResponseDTO response = userService.authenticate(signInDTO);

        assertThat(response.getAccessToken()).isEqualTo("jwt-token");
        verify(tokenRepository).save(any(Token.class));
    }

    @Test
    void revokeAllForUserDelegatesToRepository() {
        userService.revokeAllForUser(77L);
        verify(tokenRepository).deleteAllByUser_userId(77L);
    }
}
