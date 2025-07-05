package com.example.pai.controller.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserResponse {
        private UUID id;
        private String email;
        private String name;
        private RoleDto role;
        private Boolean activated;
        private LocalDateTime creationTimestamp;
        private LocalDateTime modificationTimestamp;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoleDto {
        private UUID id;
        private String name;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserRequest {
        private String email;
        private String name;
        private String password;
        private UUID roleId;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserUpdateRequest {
        private String email;
        private String name;
        private String password;
        private UUID roleId;
        private Boolean activated;
    }
}