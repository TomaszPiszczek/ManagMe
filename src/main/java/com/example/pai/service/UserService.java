package com.example.pai.service;

import com.example.pai.controller.user.dto.UserDto;
import com.example.pai.dao.model.UserManagment;
import com.example.pai.dao.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserManagment> getAllUsers() {
        return userRepository.findAll();
    }

    public List<UserDto.UserResponse> getAllUsersDto() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public Optional<UserManagment> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    public Optional<UserManagment> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserManagment createUser(UserManagment userManagment) {
        if (userRepository.existsByEmail(userManagment.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        userManagment.setPassword(passwordEncoder.encode(userManagment.getPassword()));
        userManagment.setCreationTimestamp(LocalDateTime.now());
        userManagment.setModificationTimestamp(LocalDateTime.now());

        return userRepository.save(userManagment);
    }

    public Optional<UserManagment> updateUser(UUID id, UserManagment userManagmentDetails) {
        return userRepository.findById(id)
                .map(existingUserManagment -> {
                    if (userManagmentDetails.getName() != null) {
                        existingUserManagment.setName(userManagmentDetails.getName());
                    }

                    if (userManagmentDetails.getEmail() != null && !userManagmentDetails.getEmail().equals(existingUserManagment.getEmail())) {
                        if (userRepository.existsByEmail(userManagmentDetails.getEmail())) {
                            throw new RuntimeException("Email already exists");
                        }
                        existingUserManagment.setEmail(userManagmentDetails.getEmail());
                    }

                    if (userManagmentDetails.getPassword() != null) {
                        existingUserManagment.setPassword(passwordEncoder.encode(userManagmentDetails.getPassword()));
                    }

                    if (userManagmentDetails.getRole() != null) {
                        existingUserManagment.setRole(userManagmentDetails.getRole());
                    }

                    if (userManagmentDetails.getActivated() != null) {
                        existingUserManagment.setActivated(userManagmentDetails.getActivated());
                    }

                    if (userManagmentDetails.getHidden() != null) {
                        existingUserManagment.setHidden(userManagmentDetails.getHidden());
                    }

                    existingUserManagment.setModificationTimestamp(LocalDateTime.now());

                    return userRepository.save(existingUserManagment);
                });
    }

    public boolean deleteUser(UUID id) {
        return userRepository.findById(id)
                .map(userManagment -> {
                    userRepository.delete(userManagment);
                    return true;
                })
                .orElse(false);
    }

    public boolean softDeleteUser(UUID id) {
        return userRepository.findById(id)
                .map(userManagment -> {
                    userManagment.setHidden(true);
                    userManagment.setModificationTimestamp(LocalDateTime.now());
                    userRepository.save(userManagment);
                    return true;
                })
                .orElse(false);
    }

    private UserDto.UserResponse mapToUserResponse(UserManagment user) {
        return UserDto.UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(UserDto.RoleDto.builder()
                        .id(user.getRole().getId())
                        .name(user.getRole().getName())
                        .build())
                .activated(user.getActivated())
                .creationTimestamp(user.getCreationTimestamp())
                .modificationTimestamp(user.getModificationTimestamp())
                .build();
    }
}