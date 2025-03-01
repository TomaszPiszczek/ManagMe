package com.example.pai.service.auth;

import com.example.pai.controller.auth.dto.AuthDto;
import com.example.pai.dao.model.UserManagment;
import com.example.pai.dao.reposirtory.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        UserManagment userManagment = new UserManagment();
        userManagment.setEmail(request.getEmail());
        userManagment.setPassword(passwordEncoder.encode(request.getPassword()));
        userManagment.setName(request.getName());
        userManagment.setOrganizationId(request.getOrganizationId());
        userManagment.setActivated(true);
        userManagment.setHidden(false);
        userManagment.setCreationTimestamp(LocalDateTime.now());
        userManagment.setModificationTimestamp(LocalDateTime.now());

        UserManagment savedUserManagment = userRepository.save(userManagment);

        var jwtToken = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                        savedUserManagment.getEmail(),
                        savedUserManagment.getPassword(),
                        java.util.Collections.emptyList()
                )
        );

        return AuthDto.AuthResponse.builder()
                .token(jwtToken)
                .email(savedUserManagment.getEmail())
                .name(savedUserManagment.getName())
                .userId(savedUserManagment.getId())
                .build();
    }

    public AuthDto.AuthResponse authenticate(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserManagment userManagment = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        var jwtToken = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                        userManagment.getEmail(),
                        userManagment.getPassword(),
                        java.util.Collections.emptyList()
                )
        );

        return AuthDto.AuthResponse.builder()
                .token(jwtToken)
                .email(userManagment.getEmail())
                .name(userManagment.getName())
                .userId(userManagment.getId())
                .build();
    }
}
