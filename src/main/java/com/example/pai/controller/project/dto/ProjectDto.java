package com.example.pai.controller.project.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class ProjectDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProjectRequest {
        private String name;
        private String description;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProjectResponse {
        private UUID id;
        private String name;
        private String description;
        private LocalDateTime creationTimestamp;
        private LocalDateTime modificationTimestamp;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProjectUpdateRequest {
        private String name;
        private String description;
    }
}