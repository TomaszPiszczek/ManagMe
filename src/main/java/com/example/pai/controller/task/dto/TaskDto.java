package com.example.pai.controller.task.dto;

import com.example.pai.dao.model.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class TaskDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TaskRequest {
        private String name;
        private String description;
        private Task.Priority priority;
        private UUID projectId;
        private Integer estimatedTime;
        private UUID assignedUserId;
        private LocalDateTime assignmentTimestamp;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TaskResponse {
        private UUID id;
        private String name;
        private String description;
        private Task.Priority priority;
        private UUID projectId;
        private String projectName;
        private Integer estimatedTime;
        private Task.TaskState state;
        private UUID assignedUserId;
        private String assignedUserName;
        private AssignedUser assignedUser;
        private LocalDateTime creationTimestamp;
        private LocalDateTime startTimestamp;
        private LocalDateTime completionTimestamp;
        private LocalDateTime assignmentTimestamp;
        private Boolean hasUnreadNotes;
        private Long noteCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AssignedUser {
        private UUID id;
        private String name;
        private String email;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TaskUpdateRequest {
        private String name;
        private String description;
        private Task.Priority priority;
        private UUID projectId;
        private Integer estimatedTime;
        private Task.TaskState state;
        private UUID assignedUserId;
    }
}