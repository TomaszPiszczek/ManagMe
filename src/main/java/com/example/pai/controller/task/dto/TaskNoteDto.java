package com.example.pai.controller.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class TaskNoteDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TaskNoteRequest {
        private String noteText;
        private Boolean isAdminNote;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TaskNoteResponse {
        private UUID id;
        private UUID taskId;
        private UUID userId;
        private String userName;
        private String noteText;
        private Boolean isAdminNote;
        private LocalDateTime creationTimestamp;
        private LocalDateTime modificationTimestamp;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TaskNoteUpdateRequest {
        private String noteText;
    }
}