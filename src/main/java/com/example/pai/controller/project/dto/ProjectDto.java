package com.example.pai.controller.project.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ProjectDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProjectRequest {
        private String name;
        private String description;
        private String status;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProjectResponse {
        private UUID id;
        private String name;
        private String description;
        private String status;
        private UUID ownerId;
        private String ownerName;
        private LocalDateTime creationTimestamp;
        private LocalDateTime modificationTimestamp;
        private List<AssignedUser> assignedUsers;
        private Integer memberCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProjectUpdateRequest {
        private String name;
        private String description;
        private String status;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AssignedUser {
        private UUID id;
        private String name;
        private String email;
        private String role;
        private LocalDateTime assignmentTimestamp;
    }
}