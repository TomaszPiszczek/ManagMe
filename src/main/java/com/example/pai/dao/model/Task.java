package com.example.pai.dao.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "task")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "estimated_time")
    private Integer estimatedTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskState state;

    @ManyToOne
    @JoinColumn(name = "assigned_user_id")
    private UserManagment assignedUser;


    @Column(name = "creation_timestamp")
    private LocalDateTime creationTimestamp;

    @Column(name = "start_timestamp")
    private LocalDateTime startTimestamp;

    @Column(name = "completion_timestamp")
    private LocalDateTime completionTimestamp;

    @Column(name = "assignment_timestamp")
    private LocalDateTime assignmentTimestamp;

    @Column(name = "has_unread_notes")
    private Boolean hasUnreadNotes = false;

    @PrePersist
    protected void onCreate() {
        creationTimestamp = LocalDateTime.now();
        if (state == null) {
            state = TaskState.NOT_STARTED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (state == TaskState.IN_PROGRESS && startTimestamp == null) {
            startTimestamp = LocalDateTime.now();
        } else if (state == TaskState.FINISHED && completionTimestamp == null) {
            completionTimestamp = LocalDateTime.now();
        }
    }

    public enum Priority {
        LOW, MEDIUM, HIGH
    }

    public enum TaskState {
        NOT_STARTED, IN_PROGRESS, FINISHED, NEEDS_ADJUSTMENT, WAITING_FOR_APPROVAL, APPROVED, REJECTED
    }
}